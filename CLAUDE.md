# WCAGify

WCAG accessibility tool — pnpm monorepo.

## Stack

- **Nuxt 4** with TypeScript (playground)
- **Nuxt UI v4** (components, includes Tailwind CSS 4 + color mode)
- **Nuxt Content v3** (markdown-driven content, SQLite-backed)
- **Nuxt Studio** (visual content editing)
- **@nuxtjs/i18n** (Dutch default, English secondary)
- **tsdown** (package builds)
- **VitePress** (documentation)

## Commands

- `pnpm dev` — start playground dev server
- `pnpm build` — production build
- `pnpm lint` — run OXlint
- `pnpm typecheck` — run type checking
- `pnpm docs:dev` — start docs dev server
- `pnpm docs:build` — build docs
- `pnpm --filter @focusring/wcagify build` — build core package
- `pnpm --filter create-wcagify build` — build CLI package

## Project Structure

- `packages/wcagify/` — core engine (@focusring/wcagify): WCAG data, types, schemas
- `packages/create-wcagify/` — CLI scaffolding tool (create-wcagify)
- `playground/` — Nuxt app (@wcagify/playground)
  - `playground/app/` — Vue app (pages, components, assets)
  - `playground/content/` — markdown content files
  - `playground/content.config.ts` — content collection definitions
  - `playground/i18n/locales/` — translation files (nl.json, en.json)
  - `playground/server/` — API routes and PDF service
- `docs/` — VitePress documentation site (@wcagify/docs)

## i18n

- Default locale: `nl` (no URL prefix)
- English: `/en/` prefix
- Strategy: `prefix_except_default`
- Use `$t('key')` in templates, `useI18n()` in scripts
- Use `useLocalePath()` or `<NuxtLinkLocale>` for locale-aware links

## Conventions

- Package manager: pnpm
- Linter: OXlint (correctness, suspicious, style rules)
- Formatter: oxfmt
- Components use `U` prefix (Nuxt UI)
- Both packages use tsdown for building (ESM, dts generation)
