/// <reference types="vite/client" />
/// <reference lib="dom" />

interface ImportMetaEnv {
    readonly VITE_APP_BE_URL: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
