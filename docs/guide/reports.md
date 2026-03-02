# Reports

Reports are the core output of WCAGify. Each report represents a WCAG accessibility audit for a specific website or application.

## Report Structure

A report lives in `content/reports/{slug}/` and consists of:

- **`index.md`** — The report metadata and summary (frontmatter with evaluation details)
- **Individual issue files** — One markdown file per finding (e.g. `focus-style-missing.md`)

## Report Sections

Reports follow a defined section order:

1. Header and metadata
2. Executive summary
3. Scorecard
4. About this report
5. Scope, baseline, and technologies
6. Sample pages
7. Issues
8. Tips and recommendations

## Creating a Report

Create a new directory under `content/reports/` with a descriptive slug:

```
content/reports/my-audit/
├── index.md
├── missing-alt-text.md
├── low-contrast.md
└── keyboard-trap.md
```

### Report Frontmatter

The `index.md` file uses frontmatter to define report metadata:

```yaml
---
title: Accessibility Audit — Example Site
evaluator: Your Name
date: 2025-01-15
scope: https://example.com
conformanceTarget: AA
---
```

## PDF Export

Reports can be exported as accessible PDFs with:

- Cover page with report metadata
- Running headers and page numbers
- Proper heading structure for assistive technologies
