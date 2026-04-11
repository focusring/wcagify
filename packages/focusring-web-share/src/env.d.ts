/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'single-file-core/single-file' {
  const singleFile: unknown
  export default singleFile
}
