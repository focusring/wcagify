# RFC: Collection Relations for Nuxt Content & Nuxt Studio

> Related issue: https://github.com/nuxt/content/issues/3352

## Problem

Nuxt Content v3 collections are independent — there is no way to declare that a field in one collection references an item from another collection. This forces developers into workarounds that are brittle, lack type safety, and provide poor editing experiences in Nuxt Studio.

### Real-world example: WCAG accessibility reports

[WCAGify](https://github.com/nickvdmade/wcagify) is an open-source WCAG audit tool built on Nuxt Content. It has two collections that need to reference a third:

**Reports** (`content/reports/{slug}/index.md`):

```yaml
---
title: WCAG audit Example Website
evaluation:
  evaluator: wcagify # <-- should reference an evaluator
  commissioner: Client Name
  date: '2025-01-15'
---
```

**Evaluators** (`content/evaluators/{slug}.md`):

```yaml
---
name: WCAGify
email: info@wcagify.dev
phone: '+31 6 12345678'
website: https://wcagify.dev
---
```

The `evaluator` field on a report should reference an evaluator from the evaluators collection. Today, this is stored as a plain string with manual query-time resolution.

### Current workarounds and their costs

**1. String reference + manual resolution**

```ts
// In the page component
const { data: evaluator } = await useAsyncData(() =>
  queryCollection('evaluators').where('stem', '=', report.value.evaluation.evaluator).first()
)
```

- No type safety on the reference
- Extra boilerplate in every page/component that needs the related data
- No validation that the referenced item exists
- Studio renders a plain text input — editors must know valid slugs

**2. Hardcoded `z.enum()` for Studio dropdown**

```ts
defineWcagifyCollections({ evaluators: ['wcagify', 'other-org'] })
// internally: z.enum(options.evaluators)
```

- Schema must be manually updated when evaluators are added/removed
- Not scalable for collections with many items
- Breaks the content-driven principle — data changes require code changes

**3. Inline the related data**

```yaml
evaluation:
  evaluator:
    name: WCAGify
    email: info@wcagify.dev
```

- Data duplication across every report
- Updates require changing every file that references the entity
- No single source of truth

None of these are satisfactory. This is a fundamental content modeling pattern that Nuxt Content should support natively.

## Proposed API

### Schema definition: `z.relation()`

A new Zod extension method that declares a field references another collection:

```ts
import { z } from 'zod'
import { defineCollection } from '@nuxt/content'

const evaluatorSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  website: z.string()
})

const reportSchema = z.object({
  evaluation: z.object({
    evaluator: z.relation('evaluators'),
    commissioner: z.string(),
    date: z.string()
  })
})

export default defineContentConfig({
  collections: {
    evaluators: defineCollection({
      type: 'data',
      source: 'evaluators/**/*.md',
      schema: evaluatorSchema
    }),
    reports: defineCollection({
      type: 'page',
      source: 'reports/**/index.md',
      schema: reportSchema
    })
  }
})
```

The `z.relation('evaluators')` call:

- Stores the value as a string (the referenced item's `stem` or `path`)
- Validates at build time that the referenced collection exists
- Generates TypeScript types that reflect the related item's shape when populated

### Query API: `.populate()`

Explicit opt-in to resolve relations during queries:

```ts
// Without populate — returns the raw string reference
const report = await queryCollection('reports').path('/reports/example').first()
report.evaluation.evaluator // => 'wcagify' (string)

// With populate — resolves to the full related item
const report = await queryCollection('reports')
  .populate('evaluation.evaluator')
  .path('/reports/example')
  .first()
report.evaluation.evaluator // => { name: 'WCAGify', email: 'info@wcagify.dev', ... }
```

Type inference adjusts based on whether `.populate()` is called:

```ts
type ReportBase = {
  evaluation: {
    evaluator: string // unpopulated
  }
}

type ReportPopulated = {
  evaluation: {
    evaluator: EvaluatorsCollectionItem // populated
  }
}
```

### Relation variants

```ts
// Single relation (one-to-one)
z.relation('evaluators')

// Optional relation
z.relation('evaluators').optional()

// Multiple relations (one-to-many)
z.array(z.relation('tags'))
```

## Nuxt Studio integration

This is where the biggest UX improvement lies. When Studio detects a `z.relation()` field in the JSON Schema:

1. **Render a searchable select/combobox** instead of a plain text input
2. **Populate options** by querying the referenced collection
3. **Display the item's `title` or `name`** as the label, store the `stem`/`path` as the value
4. **Support create-new** optionally, allowing editors to create a new item in the referenced collection inline

### Studio form rendering

For a report's `evaluation.evaluator` field with `z.relation('evaluators')`:

```
Evaluator: [ WCAGify                    v ]
           [ WCAGify                      ]
           [ Other Organisation           ]
           [ + Create new evaluator       ]
```

### JSON Schema output

`z.relation()` should emit a custom JSON Schema extension that Studio can detect:

```json
{
  "type": "string",
  "x-relation": {
    "collection": "evaluators",
    "displayField": "name"
  }
}
```

The `displayField` could default to `title` (standard Nuxt Content field) or be configurable:

```ts
z.relation('evaluators', { displayField: 'name' })
```

## Implementation considerations

### Nuxt Content (runtime + build)

**Storage**: Relations are stored as strings in SQLite — no schema changes needed. The value is the referenced item's `stem` (filename without extension) by default.

**Build-time validation**: During content build, validate that:

- The referenced collection exists in the config
- Referenced items actually exist (warn on broken references)

**Query resolution**: `.populate()` executes a secondary query (or JOIN) to resolve the related item. This keeps unpopulated queries fast and gives developers control.

**Type generation**: The `@nuxt/content` type generator needs to:

- Output `string` for unpopulated relation fields
- Output the related collection's item type when populated
- Handle `.populate()` at the type level (conditional types or overloads)

### Nuxt Studio (editor)

**Schema detection**: Parse `x-relation` from the JSON Schema to identify relation fields.

**Options loading**: Query the referenced collection's items to populate the select options. Cache aggressively — the list rarely changes during an editing session.

**Value mapping**: Store the `stem`/`path` string, display the `displayField` value.

**Nested relations**: Support relation fields inside nested objects (like `evaluation.evaluator`).

## Prior art

- **Decap CMS**: `relation` widget with `collection`, `value_field`, `display_fields`, `search_fields`
- **Sanity**: `reference` type with `to` pointing to document types
- **Strapi**: Relations as a field type with one-to-one, one-to-many, many-to-many
- **Payload CMS**: `relationship` field type with `relationTo` collection name

All major headless CMS solutions support this pattern. Nuxt Content's SQLite backend makes it straightforward to implement.

## Summary

| Aspect     | Current state                 | With `z.relation()`                           |
| ---------- | ----------------------------- | --------------------------------------------- |
| Schema     | `z.string()` with manual docs | `z.relation('evaluators')` — self-documenting |
| Types      | Manual type assertions        | Auto-inferred from related collection         |
| Validation | None — any string accepted    | Build-time check for valid references         |
| Query      | Manual secondary queries      | `.populate()` with type-safe resolution       |
| Studio     | Plain text input              | Searchable select populated from collection   |
| DX         | Boilerplate in every consumer | Declare once, use everywhere                  |
