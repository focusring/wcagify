import { pdfStyles } from './pdf-styles'
import { t } from './i18n-labels'
import { scName, scUri, scorecard } from './wcag-data'
import { bodyToHtml } from './content-to-html'
import type { Issue, Language, PdfTemplateData, WcagVersion } from './types'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildCoverPage(data: PdfTemplateData): string {
  const { report, issues, language, wcagVersion, targetLevel } = data
  const sc = scorecard(issues, targetLevel, wcagVersion)
  const conformanceResult = t('report.criteriaMet', language, { conforming: sc.conforming.all, total: sc.totals.all })

  return `
  <div class="cover-page">
    <h1>${escapeHtml(t('report.accessibilityConformanceReportFor', language, { title: report.title }))}</h1>
    <dl>
      <dt>${escapeHtml(t('report.commissionedBy', language))}</dt>
      <dd>${escapeHtml(report.evaluation.commissioner)}</dd>
      <dt>${escapeHtml(t('report.evaluatedBy', language))}</dt>
      <dd>${escapeHtml(report.evaluation.evaluator)}</dd>
      <dt>${escapeHtml(t('report.date', language))}</dt>
      <dd>${escapeHtml(report.evaluation.date)}</dd>
      <dt>${escapeHtml(t('report.conformanceResult', language))}</dt>
      <dd>${escapeHtml(conformanceResult)}</dd>
    </dl>
  </div>`
}

function buildExecutiveSummary(data: PdfTemplateData): string {
  const { report, language } = data
  const body = bodyToHtml(report.body)
  if (!body) return ''

  return `
  <section id="executive-summary">
    <h2>${escapeHtml(t('report.executiveSummary', language))}</h2>
    <div class="prose">${body}</div>
  </section>`
}

function buildScorecard(data: PdfTemplateData): string {
  const { issues, language, wcagVersion, targetLevel } = data
  const sc = scorecard(issues, targetLevel, wcagVersion)
  const principles = ['perceivable', 'operable', 'understandable', 'robust'] as const

  const rows = principles.map(p => `
      <tr>
        <td>${escapeHtml(t(`report.principles.${p}`, language))}</td>
        <td>${escapeHtml(t('report.criteriaMet', language, { conforming: sc.conforming[p], total: sc.totals[p] }))}</td>
      </tr>`).join('')

  return `
  <section id="scorecard">
    <h2>${escapeHtml(t('report.resultsPerPrinciple', language))}</h2>
    <p>${escapeHtml(t('report.conformanceLevel', language, { level: targetLevel, conforming: sc.conforming.all, total: sc.totals.all }))}</p>
    <table>
      <caption>${escapeHtml(t('report.resultsPerPrinciple', language))}</caption>
      <thead>
        <tr>
          <th scope="col">${escapeHtml(t('report.principle', language))}</th>
          <th scope="col">${escapeHtml(t('report.result', language))}</th>
        </tr>
      </thead>
      <tbody>${rows}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">${escapeHtml(t('report.total', language))}</th>
          <td>${escapeHtml(t('report.criteriaMet', language, { conforming: sc.conforming.all, total: sc.totals.all }))}</td>
        </tr>
      </tfoot>
    </table>
  </section>`
}

function buildAboutThisReport(data: PdfTemplateData): string {
  const { aboutThisReport, language } = data
  if (!aboutThisReport) return ''

  const body = bodyToHtml(aboutThisReport.body)
  if (!body) return ''

  return `
  <section id="about">
    <h2>${escapeHtml(t('report.aboutThisReport', language))}</h2>
    <div class="prose">${body}</div>
  </section>`
}

function buildScope(data: PdfTemplateData): string {
  const { report, language } = data

  const scopeItems = report.scope.map(s => `<li>${escapeHtml(s)}</li>`).join('')
  const outOfScope = report.outOfScope?.length
    ? `<h3>${escapeHtml(t('report.notInScope', language))}</h3>
       <ul>${report.outOfScope.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`
    : ''
  const baseline = report.baseline.map(s => `<li>${escapeHtml(s)}</li>`).join('')
  const technologies = report.technologies.map(s => `<li>${escapeHtml(s)}</li>`).join('')

  return `
  <section id="scope">
    <h2>${escapeHtml(t('report.scope', language))}</h2>
    <h3>${escapeHtml(t('report.scopeItems', language))}</h3>
    <ul>${scopeItems}</ul>
    ${outOfScope}
    <h3>${escapeHtml(t('report.accessibilitySupport', language))}</h3>
    <p>${escapeHtml(t('report.accessibilitySupportExplanation', language))}</p>
    <ul>${baseline}</ul>
    <h3>${escapeHtml(t('report.technologiesUsed', language))}</h3>
    <p>${escapeHtml(t('report.technologiesExplanation', language))}</p>
    <ul>${technologies}</ul>
  </section>`
}

function buildSample(data: PdfTemplateData): string {
  const { report, language } = data
  const rows = report.sample.map(s => `
      <tr>
        <td>${escapeHtml(s.title)}</td>
        <td><a href="${escapeHtml(s.url)}">${escapeHtml(s.url)}</a></td>
        <td>${escapeHtml(s.description)}</td>
      </tr>`).join('')

  return `
  <section id="sample">
    <h2>${escapeHtml(t('report.representativeSample', language))}</h2>
    <table>
      <caption>${escapeHtml(t('report.representativeSample', language))}</caption>
      <thead>
        <tr>
          <th scope="col">${escapeHtml(t('report.title', language))}</th>
          <th scope="col">${escapeHtml(t('report.url', language))}</th>
          <th scope="col">${escapeHtml(t('report.description', language))}</th>
        </tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
  </section>`
}

interface IssueGroup {
  sc: string
  name: string
  uri: string
  issues: Issue[]
}

function groupIssuesBySc(issues: Issue[], wcagVersion: WcagVersion, language: Language): IssueGroup[] {
  const reportIssues = issues
    .filter(i => i.sc !== 'none')
    .toSorted((a, b) => a.sc.localeCompare(b.sc, undefined, { numeric: true }))

  const groups: IssueGroup[] = []
  const seen = new Map<string, number>()

  for (const issue of reportIssues) {
    const idx = seen.get(issue.sc)
    if (idx !== undefined) {
      groups[idx]!.issues.push(issue)
    } else {
      seen.set(issue.sc, groups.length)
      groups.push({
        sc: issue.sc,
        name: scName(issue.sc, wcagVersion, language),
        uri: scUri(issue.sc, wcagVersion, language),
        issues: [issue]
      })
    }
  }
  return groups
}

function buildIssues(data: PdfTemplateData): string {
  const { issues, report, language, wcagVersion } = data
  const groups = groupIssuesBySc(issues, wcagVersion, language)
  if (!groups.length) return ''

  const toc = groups.map(g => {
    const items = g.issues.map(i => {
      const id = i.path.split('/').pop()
      return `<li><a href="#issue-${id}">${escapeHtml(i.title)}</a></li>`
    }).join('')
    return `<h3>${escapeHtml(g.name)}</h3><ol>${items}</ol>`
  }).join('')

  const sections = groups.map(g => {
    const articles = g.issues.map(i => {
      const id = i.path.split('/').pop()
      const samplePage = report.sample.find(s => s.id === i.sample)
      const body = bodyToHtml(i.body)

      return `
      <article id="issue-${id}">
        <h4>${escapeHtml(i.title)}</h4>
        <div class="meta">
          <span>${escapeHtml(t('report.successCriterion', language))}: ${escapeHtml(g.name)}</span>
          <span>${escapeHtml(t('report.severity', language))}: ${escapeHtml(i.severity)}</span>
          <span>${escapeHtml(t('report.difficulty', language))}: ${escapeHtml(i.difficulty)}</span>
          ${samplePage ? `<span>${escapeHtml(t('report.sample', language))}: ${escapeHtml(samplePage.title)}</span>` : ''}
        </div>
        <div class="prose">${body}</div>
      </article>`
    }).join('')

    return `
    <div>
      <h3><a href="${escapeHtml(g.uri)}">${escapeHtml(g.name)}</a></h3>
      ${articles}
    </div>`
  }).join('')

  return `
  <section id="issues">
    <h2>${escapeHtml(t('report.issues', language))}</h2>
    <nav>${toc}</nav>
    ${sections}
  </section>`
}

function buildTips(data: PdfTemplateData): string {
  const { issues, language } = data
  const tips = issues.filter(i => i.sc === 'none')
  if (!tips.length) return ''

  const items = tips.map(tip => {
    const body = bodyToHtml(tip.body)
    return `
    <li>
      <h3>${escapeHtml(tip.title)}</h3>
      <p>${escapeHtml(t('report.difficulty', language))}: ${escapeHtml(tip.difficulty)}</p>
      <div class="prose">${body}</div>
    </li>`
  }).join('')

  return `
  <section id="tips">
    <h2>${escapeHtml(t('report.tips', language))}</h2>
    <ol>${items}</ol>
  </section>`
}

export function buildReportHtml(data: PdfTemplateData): string {
  const { report, language } = data
  const title = t('report.accessibilityConformanceReportFor', language, { title: report.title })

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>${pdfStyles}</style>
</head>
<body>
  ${buildCoverPage(data)}
  ${buildExecutiveSummary(data)}
  ${buildScorecard(data)}
  ${buildAboutThisReport(data)}
  ${buildScope(data)}
  ${buildSample(data)}
  ${buildIssues(data)}
  ${buildTips(data)}
</body>
</html>`
}
