/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TCB_ENV_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
