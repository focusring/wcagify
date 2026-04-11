<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../composables/useI18n'

const props = defineProps<{
  current: number
  total: number
}>()

const emit = defineEmits<{
  cancel: []
}>()

const { t } = useI18n()

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
})
</script>

<template>
  <div
    class="space-y-2 p-3 rounded-sm bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
  >
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
        {{ t('pages.progress', { current: current + 1, total }) }}
      </p>
      <UButton
        @click="emit('cancel')"
        :label="t('pages.cancelCapture')"
        size="xs"
        color="neutral"
        variant="subtle"
        :ui="{ base: 'cursor-pointer selectable-focus' }"
      />
    </div>
    <UProgress :value="percentage" color="info" size="sm" />
  </div>
</template>
