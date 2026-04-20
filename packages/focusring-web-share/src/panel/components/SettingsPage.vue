<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useColorMode } from '../../composables/useColorMode'
import { useI18n } from '../../composables/useI18n'
import type { Locale } from '../../i18n'
import { localeLabels } from '../../i18n'
import logoSvg from '../../assets/focusring-icon.svg'

const version = ref('')
onMounted(() => {
  try {
    version.value = chrome.runtime.getManifest().version
  } catch {}
})

const emit = defineEmits<{ back: [] }>()

const { preference, cycle } = useColorMode()
const { t: translate, locale } = useI18n()

const colorModeIcon = computed(() => {
  if (preference.value === 'dark') return 'i-lucide-moon'
  if (preference.value === 'light') return 'i-lucide-sun'
  return 'i-lucide-monitor'
})

const colorModeLabel = computed(() => {
  if (preference.value === 'dark') return translate('colorMode.dark')
  if (preference.value === 'light') return translate('colorMode.light')
  return translate('colorMode.system')
})

const locales = Object.entries(localeLabels) as [Locale, string][]
const localeItems = computed(() => locales.map(([value, label]) => ({ value, label })))
</script>

<template>
  <div class="min-h-screen p-4 font-sans">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <h1 class="text-lg font-bold text-black dark:text-white">
        {{ translate('settings.title') }}
      </h1>
      <UButton
        @click="emit('back')"
        :label="translate('settings.back')"
        icon="i-lucide-arrow-left"
        size="xl"
        color="neutral"
        variant="subtle"
        :aria-label="translate('settings.back')"
        :ui="{
          base: 'cursor-pointer font-medium selectable-focus',
          leadingIcon: 'size-5'
        }"
        class="ml-auto selectable-focus"
      />
    </div>

    <USeparator class="my-3" />

    <!-- Appearance -->
    <h2 class="text-sm font-semibold text-muted tracking-wide mb-3">
      {{ translate('settings.appearance') }}
    </h2>
    <section class="bg-elevated rounded-sm p-4 space-y-3">
      <!-- Language -->
      <UFormField
        :label="translate('settings.languageLabel')"
        :ui="{ label: 'text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300' }"
        class="flex flex-row items-center justify-between gap-4"
      >
        <USelect
          v-model="locale"
          :items="localeItems"
          :aria-label="translate('language')"
          :ui="{
            trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            item: 'selectable-focus',
            content: 'overflow-visible'
          }"
          variant="subtle"
          size="lg"
          class="w-auto min-w-36 cursor-pointer selectable-focus"
        />
      </UFormField>

      <!-- Theme -->
      <UFormField
        :label="translate('settings.colorMode')"
        :ui="{ label: 'text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300' }"
        class="flex flex-row items-center justify-between gap-4"
      >
        <UButton
          @click="cycle"
          :aria-label="`${translate('colorMode.dark')}/${translate('colorMode.light')}/${translate('colorMode.system')}: ${colorModeLabel}`"
          :ui="{
            base: 'cursor-pointer',
            leadingIcon: 'size-4'
          }"
          :leading-icon="colorModeIcon"
          :label="colorModeLabel"
          size="lg"
          color="neutral"
          variant="subtle"
          class="min-w-28 selectable-focus"
        />
      </UFormField>
    </section>

    <!-- About -->
    <USeparator class="my-4" />

    <footer
      class="flex flex-col items-center gap-2 text-center text-xs text-muted pb-2 max-w-md mx-auto"
    >
      <img :src="logoSvg" alt="FocusRing Web Share Logo" class="size-8" />
      <div class="space-y-1.5">
        <p>
          <a
            href="https://www.focusring.io"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-primary hover:underline selectable-focus"
            >FocusRing Web Share</a
          >
          {{ translate('settings.license') }}
        </p>
        <p>
          {{ translate('settings.madeBy') }}
          <a
            href="https://www.focusring.io"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-primary hover:underline selectable-focus"
            >focusring.io</a
          >
          {{ translate('settings.inRegion') }}
        </p>
        <p v-if="version">{{ translate('settings.version') }} {{ version }}</p>
      </div>
    </footer>
  </div>
</template>
