interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string,
    readonly VITE_TOKEN_API_AVISO: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}