/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_API_BASE_URL?: string
  // 在这里添加更多环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
