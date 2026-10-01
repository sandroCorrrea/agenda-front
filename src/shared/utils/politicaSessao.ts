export type EstrategiaInferida = "nenhuma" | "sessao" | "token";

export function inferirEstrategia(
    sessaoSugerida: string | null,
    tokenAcesso: string | null
): EstrategiaInferida {
    if (tokenAcesso) return "token";
    if (sessaoSugerida) return "sessao";
    return "nenhuma";
}

export function novoUuid(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const aleatorio = Math.floor(Math.random() * 16);
        const valor = char === "x" ? aleatorio : (aleatorio & 0x3) | 0x8;
        return valor.toString(16);
    });
}

/**
 * sessao/cookie: reutiliza o uuid já guardado; se não houver, usa sessaoSugerida.
 * token: também precisa de um uuid de sessão, independente do token de acesso.
 * nenhuma: reaproveita o uuid do rascunho aberto e gera outro depois da conclusão.
 */
export function resolverSessaoId(params: {
    armazenada: string | null;
    sessaoSugerida: string | null;
    estrategia: EstrategiaInferida;
    gerar?: () => string;
}): string {
    const gerar = params.gerar ?? novoUuid;
    if (params.armazenada) return params.armazenada;
    if (params.estrategia === "sessao" && params.sessaoSugerida) return params.sessaoSugerida;
    return gerar();
}

export function chaveSessaoPesquisa(token: string): string {
    return `politica_pesquisa_sessao_${token}`;
}

export function chaveRascunhoPesquisa(token: string): string {
    return `politica_pesquisa_rascunho_${token}`;
}
