/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT_ID?: string
  readonly VITE_ADSENSE_SLOT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
