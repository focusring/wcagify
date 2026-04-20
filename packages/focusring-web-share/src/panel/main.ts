import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import AppComponent from './App.vue'
import { useI18n } from '../composables/useI18n'
// oxlint-disable-next-line no-unassigned-import
import './style.css'

const app = createApp(AppComponent)
app.use(ui)

const { ready } = useI18n()

ready.then(() => app.mount('#app'))
