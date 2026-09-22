/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_DATA_MODE?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_ENABLE_RECURRING?: string;
  readonly VITE_DEMO_CADENCE_MINUTES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
