/** Extrai o nome do arquivo do header Content-Disposition (`filename*` ou `filename`). */
export function nomeArquivoDoContentDisposition(
    contentDisposition: string | undefined,
    fallback: string
): string {
    if (!contentDisposition) return fallback;
    const estendido = /filename\*=UTF-8''([^;\n]+)/i.exec(contentDisposition);
    const simples = /filename="([^"]+)"|filename=([^;\s]+)/i.exec(contentDisposition);
    const raw = estendido?.[1] ?? simples?.[1] ?? simples?.[2];
    if (!raw) return fallback;
    const limpo = raw.replace(/"/g, "").trim();
    try {
        return decodeURIComponent(limpo);
    } catch {
        return limpo;
    }
}
