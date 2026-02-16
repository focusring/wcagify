<script setup lang="ts">
import type { IssuesCollectionItem } from '@nuxt/content'
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  issues: IssuesCollectionItem[]
  targetLevel: string
  wcagVersion: string
}>()

const { t } = useI18n()
const { scorecard } = useWcagData()

const data = computed(() => scorecard(props.issues, props.targetLevel as 'A' | 'AA' | 'AAA', props.wcagVersion as '2.0' | '2.1' | '2.2'))

const principles = ['perceivable', 'operable', 'understandable', 'robust'] as const

const rows = computed(() => {
  const sc = data.value
  return [
    ...principles.map(principle => ({
      principle: t(`report.principles.${principle}`),
      conforming: sc.conforming[principle],
      total: sc.totals[principle]
    })),
    {
      principle: t('report.total'),
      conforming: sc.conforming.all,
      total: sc.totals.all
    }
  ]
})

type ScorecardRow = { principle: string, conforming: number, total: number }

const columns: TableColumn<ScorecardRow>[] = [
  {
    accessorKey: 'principle',
    header: t('report.resultsPerPrinciple')
  },
  {
    accessorKey: 'conforming',
    header: t('report.conforming')
  },
  {
    accessorKey: 'total',
    header: t('report.total')
  }
]
</script>

<template>
  <UTable
    :data="rows"
    :columns="columns"
  />
</template>
