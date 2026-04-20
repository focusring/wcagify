/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'single-file-core/single-file' {
  interface GetPageDataOptions extends Record<string, unknown> {
    initOptions?: Record<string, unknown>
    doc?: Document
    win?: Window
  }
  function init(options?: Record<string, unknown>): void
  function getPageData(options?: GetPageDataOptions): Promise<{ content: string; title: string }>
  const helper: {
    initDoc(doc: Document): void
  }
  export { init, getPageData, helper }
}
