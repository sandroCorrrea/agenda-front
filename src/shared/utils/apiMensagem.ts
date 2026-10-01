import axios from "axios";

export type ErroApi = {
    status: number | null;
    mensagem: string;
    campos: Record<string, string>;
};

export function lerErroApi(erro: unknown, fallback: string): ErroApi {
    if (axios.isAxiosError(erro)) {
        const status = erro.response?.status ?? null;
        const data = erro.response?.data as { message?: unknown; errors?: unknown } | undefined;
        const campos = achatarErros(data?.errors);
        const primeira = Object.values(campos)[0];
        const mensagem =
            typeof data?.message === "string" && data.message.trim()
                ? data.message
                : primeira || fallback;
        return { status, mensagem, campos };
    }
    if (erro instanceof Error && erro.message.trim()) {
        return { status: null, mensagem: erro.message, campos: {} };
    }
    return { status: null, mensagem: fallback, campos: {} };
}

function achatarErros(errors: unknown): Record<string, string> {
    if (errors == null || typeof errors !== "object") return {};
    const saida: Record<string, string> = {};
    for (const [chave, valor] of Object.entries(errors as Record<string, unknown>)) {
        if (Array.isArray(valor)) {
            const texto = valor.find((item) => typeof item === "string" && item.trim());
            if (typeof texto === "string") saida[chave] = texto;
            continue;
        }
        if (typeof valor === "string" && valor.trim()) saida[chave] = valor;
    }
    return saida;
}

export function tokenInvalido(erro: ErroApi): boolean {
    return /token de acesso|token inválido|token invalido/i.test(erro.mensagem);
}
