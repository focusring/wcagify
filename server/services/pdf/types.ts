type Language = 'nl' | 'en'
type WcagVersion = '2.0' | '2.1' | '2.2'
type Level = 'A' | 'AA' | 'AAA'

interface MinimarkBody {
  type: string
  value: unknown[]
}

interface Report {
  title: string
  language: string
  evaluation: {
    evaluator: string
    commissioner: string
    target: string
    targetLevel: string
    targetWcagVersion: string
    date: string
    specialRequirements: string
  }
  scope: string[]
  outOfScope?: string[]
  baseline: string[]
  technologies: string[]
  sample: { title: string; id: string; url: string; description: string }[]
  body?: MinimarkBody
}

interface Issue {
  title: string
  path: string
  sc: string
  severity: string
  difficulty: string
  sample: string
  body?: MinimarkBody
}

interface SharedContent {
  body?: MinimarkBody
}

interface PdfTemplateData {
  report: Report
  issues: Issue[]
  aboutThisReport: SharedContent | null
  language: Language
  wcagVersion: WcagVersion
  targetLevel: Level
}

export type {
  Issue,
  Language,
  Level,
  MinimarkBody,
  PdfTemplateData,
  Report,
  SharedContent,
  WcagVersion
}