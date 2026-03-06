import { defineCollection } from '@nuxt/content'
import { reportSchema, issueSchema } from './schemas'

function defineWcagifyCollections() {
  return {
    reports: defineCollection({
      type: 'page' as const,
      source: {
        include: 'reports/**/index.md',
        prefix: '/reports'
      },
      schema: reportSchema
    }),
    issues: defineCollection({
      type: 'page' as const,
      source: {
        include: 'reports/**/*.md',
        exclude: ['reports/**/index.md'],
        prefix: '/reports'
      },
      schema: issueSchema
    })
  }
}

export { defineWcagifyCollections }
