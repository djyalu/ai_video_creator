/// <reference types="vite/client" />

// Environment variable types for AI Video Creator
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}