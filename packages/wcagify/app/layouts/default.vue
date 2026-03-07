<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const kbdEnabled = useKeyboardShortcutsEnabled()
</script>

<template>
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
        class="no-underline!"
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
      <slot />
    </UContainer>
  </UMain>

  <USeparator />

  <UFooter>
    <template #left>
      <p class="text-sm text-muted">WCAGify &copy; {{ new Date().getFullYear() }}</p>
    </template>

    <template #right>
      <UButton
        to="https://github.com/focusring/WCAGify"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
