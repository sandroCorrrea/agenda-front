/**
 * Monta URL absoluta para arquivos públicos (storage) retornados pela API.
 * Alinhado ao padrão usado em PageClientePerfil (VITE_STORAGE_BASE_URL / API + /storage).
 */
export function resolvePublicAssetUrl(path: string | null | undefined): string | null {
    const raw = (path ?? "").trim();
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

    const storageBaseUrl = import.meta.env.VITE_STORAGE_BASE_URL ?? "";
    const baseApi =
        import.meta.env.VITE_API_BASE_URL ?? (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL ?? "";

    const baseStorage = storageBaseUrl.replace(/\/$/, "");
    const apiSemSufixoApi = baseApi.replace(/\/api\/?$/, "");
    const baseApiStorage = `${apiSemSufixoApi.replace(/\/$/, "")}/storage`;
    const base = baseStorage || baseApiStorage;

    const caminhoNormalizado = raw.replace(/^\/+/, "").replace(/^storage\/+/i, "");
    if (!base) {
        return raw.startsWith("/") ? raw : `/${caminhoNormalizado}`;
    }
    return `${base}/${encodeURI(caminhoNormalizado)}`;
}

/** Último segmento do caminho ou URL, para exibição. */
export function fileNameFromPath(path: string | null | undefined): string {
    const s = (path ?? "").trim();
    if (!s) return "";
    try {
        const u = new URL(s, "https://placeholder.local");
        const seg = u.pathname.split("/").filter(Boolean).pop();
        return seg ? decodeURIComponent(seg) : s;
    } catch {
        const parts = s.split(/[/\\]/);
        return parts[parts.length - 1] || s;
    }
}

export type DocKind = "pdf" | "word" | "excel" | "ppt" | "text" | "generic";

export function docKindFromFileName(name: string): DocKind {
    const n = name.toLowerCase();
    if (n.endsWith(".pdf")) return "pdf";
    if (n.endsWith(".doc") || n.endsWith(".docx")) return "word";
    if (n.endsWith(".xls") || n.endsWith(".xlsx")) return "excel";
    if (n.endsWith(".ppt") || n.endsWith(".pptx")) return "ppt";
    if (n.endsWith(".txt")) return "text";
    return "generic";
}
