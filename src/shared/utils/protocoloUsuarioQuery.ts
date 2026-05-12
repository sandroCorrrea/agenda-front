import type { ProtocoloUsuarioListQuery } from "@/application/dto/Protocolo/ProtocoloUsuarioListagemQuery";

/** Params enviados à API após remover vazios e limites. */
export type ProtocoloUsuarioQuerySanitizado = {
    page?: number;
    per_page?: number;
    titulo?: string;
    ano?: number;
    destinatario_tipo?: "fisica" | "juridica";
};

/**
 * Remove `undefined`, strings vazias e valores fora dos limites do contrato.
 */
export function sanitizeProtocoloUsuarioQuery(
    q: Partial<ProtocoloUsuarioListQuery>
): ProtocoloUsuarioQuerySanitizado {
    const out: ProtocoloUsuarioQuerySanitizado = {};

    if (q.page != null && Number.isFinite(q.page)) {
        const p = Math.floor(Number(q.page));
        if (p >= 1) out.page = p;
    }

    if (q.per_page != null && Number.isFinite(q.per_page)) {
        const n = Math.floor(Number(q.per_page));
        if (n >= 1 && n <= 100) out.per_page = n;
    }

    if (typeof q.titulo === "string") {
        const t = q.titulo.trim();
        if (t.length > 0) {
            out.titulo = t.length > 100 ? t.slice(0, 100) : t;
        }
    }

    if (q.ano != null && Number.isFinite(q.ano)) {
        const a = Math.floor(Number(q.ano));
        if (a >= 2000 && a <= 9999) out.ano = a;
    }

    if (q.destinatario_tipo === "fisica" || q.destinatario_tipo === "juridica") {
        out.destinatario_tipo = q.destinatario_tipo;
    }

    return out;
}
