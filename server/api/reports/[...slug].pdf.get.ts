import { queryCollection } from '@nuxt/content/server'
import { buildReportHtml, generatePdf } from '../../services/pdf'
import type { Level, WcagVersion } from '../../services/pdf/types'

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, 'slug.pdf')
  const slug = raw?.replace(/\.pdf$/, '')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing report slug' })
  }

  const reportPath = `/reports/${slug}`

  const report = await queryCollection(event, 'reports').path(reportPath).first()
  if (!report) {
    throw createError({ statusCode: 404, statusMessage: 'Report not found' })
  }

  const issues = await queryCollection(event, 'issues')
    .where('path', 'LIKE', `${reportPath}/%`)
    .all()

  const language = report.language === 'en' ? 'en' : 'nl'
  const sharedPath = `/shared/${language}/about-this-report`
  const aboutThisReport = await queryCollection(event, 'shared').path(sharedPath).first()

  const html = buildReportHtml({
    report: report as never,
    issues: issues as never[],
    aboutThisReport: aboutThisReport as never,
    language,
    wcagVersion: (report.evaluation.targetWcagVersion as WcagVersion),
    targetLevel: (report.evaluation.targetLevel as Level)
  })

  const config = useRuntimeConfig()
  const filename = `${report.title}.pdf`
  const pdfBuffer = await generatePdf(html, filename, config.weasyprintUrl)

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
  return pdfBuffer
})
