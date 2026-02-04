/// <reference types="vite/client" />
declare global {
  const GITHUB_RUNTIME_PERMANENT_NAME: string
  const BASE_KV_SERVICE_URL: string
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_EDGE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
