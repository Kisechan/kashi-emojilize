/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_API_BASE_URL?: string
  readonly VITE_TURNSTILE_SITE_KEY?: string
  // 在这里添加更多环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Cloudflare Turnstile 全局类型
declare interface Window {
  turnstile: {
    render(
      container: HTMLElement | string,
      params: {
        sitekey: string
        callback?: (token: string) => void
        'error-callback'?: () => void
        'expired-callback'?: () => void
        theme?: 'light' | 'dark' | 'auto'
        size?: 'normal' | 'compact'
      }
    ): string
    reset(widgetId?: string): void
    remove(widgetId: string): void
  }
}
