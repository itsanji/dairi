/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly BEURL: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
