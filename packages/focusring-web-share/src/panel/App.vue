<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import logoSvg from '../assets/focusring-icon.svg'
import PageList from './components/PageList.vue'
import SettingsPage from './components/SettingsPage.vue'

const { t } = useI18n()
const currentView = ref<'main' | 'settings'>('main')
</script>

<template>
  <UApp>
    <SettingsPage v-if="currentView === 'settings'" @back="currentView = 'main'" />

    <div v-show="currentView === 'main'" class="min-h-screen p-4 font-sans">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <img :src="logoSvg" alt="" aria-hidden="true" class="size-7" />
          <h1 class="text-lg font-bold text-black dark:text-white">
            {{ t('app.title') }}
          </h1>
        </div>
        <UButton
          @click="currentView = 'settings'"
          :aria-label="t('settings.title')"
          :title="t('settings.title')"
          icon="i-lucide-settings"
          size="xl"
          color="neutral"
          variant="ghost"
          :ui="{
            base: 'cursor-pointer selectable-focus',
            leadingIcon: 'size-5'
          }"
        />
      </div>

      <PageList />
    </div>
  </UApp>
</template>
