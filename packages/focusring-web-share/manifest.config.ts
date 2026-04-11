import { defineManifest } from '@crxjs/vite-plugin'
import { version } from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'FocusRing Web Share',
  description: 'Capture authenticated web pages for WCAG accessibility auditing',
  version,
  icons: {
    '16': 'src/assets/focusring-16.png',
    '48': 'src/assets/focusring-48.png',
    '128': 'src/assets/focusring-128.png'
  },
  action: {
    default_icon: {
      '16': 'src/assets/focusring-16.png',
      '48': 'src/assets/focusring-48.png'
    }
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module'
  },
  permissions: ['activeTab', 'tabs', 'storage', 'sidePanel'],
  host_permissions: ['http://*/*', 'https://*/*'],
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'; img-src 'self' data: https://*;"
  },
  side_panel: {
    default_path: 'src/panel/index.html'
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/content/capture-agent.ts'],
      run_at: 'document_idle'
    }
  ]
})
