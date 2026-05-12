export function formatarData(data: Date | string) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(data))
}

/**
 * Exibe data no padrão dd/MM/yyyy a partir de string ISO (ex.: 2026-04-01).
 * Usa apenas a parte YYYY-MM-DD quando presente, evitando deslocamento por fuso.
 */
export function formatarDataIsoPtBr(valor: string | null | undefined): string {
    if (valor == null || !String(valor).trim()) return "—";
    const s = String(valor).trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) {
        return `${m[3]}/${m[2]}/${m[1]}`;
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("pt-BR");
    }
    return s;
}
