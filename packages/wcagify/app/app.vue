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
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
[data-kbd='false'] [data-kbd-hint] {
  display: none;
}
</style>
