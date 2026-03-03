import { defineContentConfig, defineCollection } from '@nuxt/content'
import { reportSchema, issueSchema, contentSources } from 'wcagify'

export default defineContentConfig({
  collections: {
    reports: defineCollection({
      type: 'page',
      source: contentSources.reports,
      schema: reportSchema
    }),

    issues: defineCollection({
      type: 'page',
      source: contentSources.issues,
      schema: issueSchema
    })
  }
})
