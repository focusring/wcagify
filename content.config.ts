import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    reports: defineCollection({
      type: 'page',
      source: 'reports/**/index.md',
      schema: z.object({
        language: z.enum(['nl', 'en']),
        evaluation: z.object({
          evaluator: z.string(),
          commissioner: z.string(),
          target: z.string(),
          targetLevel: z.string(),
          targetWcagVersion: z.string(),
          date: z.string(),
          specialRequirements: z.string()
        }),
        scope: z.array(z.string()),
        outOfScope: z.array(z.string()).optional(),
        baseline: z.array(z.string()),
        technologies: z.array(z.string()),
        sample: z.array(z.object({
          title: z.string(),
          id: z.string(),
          url: z.string(),
          description: z.string()
        }))
      })
    }),

    issues: defineCollection({
      type: 'page',
      source: {
        include: 'reports/**/*.md',
        exclude: ['reports/**/index.md']
      },
      schema: z.object({
        sc: z.string(),
        severity: z.enum(['Low', 'Medium', 'High']),
        difficulty: z.enum(['Low', 'Medium', 'High']),
        sample: z.string()
      })
    }),

    shared: defineCollection({
      type: 'page',
      source: 'shared/**/*.md'
    })
  }
})
