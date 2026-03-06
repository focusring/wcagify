<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'

const { t } = useI18n()
const head = useLocaleHead({ seo: true })
const localePath = useLocalePath()
const kbdEnabled = useKeyboardShortcutsEnabled()

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }, ...(head.value.link || [])],
  htmlAttrs: {
    ...head.value.htmlAttrs
  }
})

useSeoMeta({
  title: () => t('app.title'),
  description: () => t('app.description'),
  ogTitle: () => t('app.title'),
  ogDescription: () => t('app.description')
})

onKeyStroke(',', (e: KeyboardEvent) => {
  if (!kbdEnabled.value) return
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    return
  e.preventDefault()
  navigateTo(localePath('/settings'))
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLinkLocale to="/">
          <AppLogo />
        </NuxtLinkLocale>
      </template>

      <template #right>
        <UButton
          :to="localePath('/settings')"
          :label="t('settings.title').toLowerCase()"
          :aria-keyshortcuts="kbdEnabled ? ',' : undefined"
          color="neutral"
          variant="ghost"
        >
          <template #trailing>
            <kbd
              data-kbd-hint
              aria-hidden="true"
              class="ms-1 inline-flex items-center justify-center size-5 text-xs text-muted bg-elevated border border-default rounded font-mono"
              >,</kbd
            >
          </template>
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <NuxtPage />
      </UContainer>
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">WCAGify &copy; {{ new Date().getFullYear() }}</p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/timdamen/wcagify"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>

<style>
[data-kbd='false'] [data-kbd-hint] {
  display: none;
}
</style>
