<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import logoSvg from '../../assets/focusring-icon.svg'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center text-center space-y-3 pt-8">
    <img :src="logoSvg" alt="" aria-hidden="true" class="size-16" />
    <div class="space-y-1">
      <h2 class="text-lg font-bold text-black dark:text-white">
        {{ t('pages.noPages') }}
      </h2>
      <p class="text-sm text-muted">
        {{ t('pages.noPagesHint') }}
      </p>
    </div>
  </div>
</template>
