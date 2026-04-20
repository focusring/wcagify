import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
// oxlint-disable-next-line no-unassigned-import -- Side-effect CSS import
import './style.css'

const app = createApp(App)
app.use(ui)
app.mount('#app')
