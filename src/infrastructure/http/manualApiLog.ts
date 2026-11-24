export type ManualApiDado = string | number | boolean | null;

export function registrarManualApi(evento: string, dados: Record<string, ManualApiDado | undefined>): void {
    const plano: Record<string, ManualApiDado> = { evento };
    for (const [chave, valor] of Object.entries(dados)) {
        if (valor == null) continue;
        if (typeof valor === "string" || typeof valor === "number" || typeof valor === "boolean") {
            plano[chave] = valor;
        }
    }
    const falha = evento === "falha-rede" || evento === "tela" || plano.aceito === false;
    const escrever = falha ? console.error : console.info;
    escrever("[manual-api]", plano);
}
