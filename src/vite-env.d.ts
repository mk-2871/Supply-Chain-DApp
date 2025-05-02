/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_ADMIN_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
