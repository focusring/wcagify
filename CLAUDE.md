# WCAGify

WCAG accessibility tool built with Nuxt 4.

## Stack

- **Nuxt 4** with TypeScript
- **Nuxt UI v4** (components, includes Tailwind CSS 4 + color mode)
- **Nuxt Content v3** (markdown-driven content, SQLite-backed)
- **Nuxt Studio** (visual content editing)
- **@nuxtjs/i18n** (Dutch default, English secondary)

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build (SSR required for Studio)
- `pnpm lint` — run ESLint
- `pnpm typecheck` — run type checking

## Project Structure

- `app/` — Vue app (pages, components, assets, app.vue)
- `content/` — markdown content files
- `content.config.ts` — content collection definitions
- `i18n/locales/` — translation files (nl.json, en.json)

## i18n

- Default locale: `nl` (no URL prefix)
- English: `/en/` prefix
- Strategy: `prefix_except_default`
- Use `$t('key')` in templates, `useI18n()` in scripts
- Use `useLocalePath()` or `<NuxtLinkLocale>` for locale-aware links

## Conventions

- Package manager: pnpm
- ESLint: no trailing commas, 1tbs brace style
- Components use `U` prefix (Nuxt UI)
