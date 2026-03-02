import { defineContentConfig, defineCollection } from '@nuxt/content'
import { reportSchema, issueSchema } from '@wcagify/core'

export default defineContentConfig({
  collections: {
    reports: defineCollection({
      type: 'page',
      source: 'reports/**/index.md',
      schema: reportSchema
    }),

    issues: defineCollection({
      type: 'page',
      source: {
        include: 'reports/**/*.md',
        exclude: ['reports/**/index.md']
      },
      schema: issueSchema
    }),

    shared: defineCollection({
      type: 'page',
      source: 'shared/**/*.md'
    })
  }
})
