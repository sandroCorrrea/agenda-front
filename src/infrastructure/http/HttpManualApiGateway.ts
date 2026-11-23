import { AxiosError } from "axios";
import { resolverBaseManual } from "@/infrastructure/http/manualApiBase";

const TEMPO_MS = 90_000;

export type CampoArquivo = { nome: string; arquivo: File };

export type ManualApiGateway = {
    post(caminho: string, campos: readonly CampoArquivo[], aceitos: readonly number[]): Promise<unknown>;
    get(
        caminho: string,
        params: Record<string, string | number | undefined> | undefined,
        aceitos: readonly number[]
    ): Promise<unknown>;
    delete(caminho: string, aceitos: readonly number[]): Promise<unknown>;
};

function caminhoPermitido(caminho: string): boolean {
    return (
        caminho === "/api/remessas" ||
        caminho === "/api/remessas/contas" ||
        caminho === "/api/remessas/relatorio" ||
        caminho === "/api/remessas/historico" ||
        caminho === "/api/remessas/previsao" ||
        /^\/api\/remessas\/historico\/\d+$/.test(caminho)
    );
}

export class HttpManualApiGateway implements ManualApiGateway {
    private readonly base: string;

    constructor(
        private readonly buscar: typeof fetch = fetch,
        base = resolverBaseManual(import.meta.env.VITE_MANUAL_API_URL)
    ) {
        this.base = base;
    }

    post(caminho: string, campos: readonly CampoArquivo[], aceitos: readonly number[]): Promise<unknown> {
        const corpo = new FormData();
        for (const campo of campos) corpo.append(campo.nome, campo.arquivo);
        return this.pedir("POST", caminho, aceitos, corpo);
    }

    get(
        caminho: string,
        params: Record<string, string | number | undefined> | undefined,
        aceitos: readonly number[]
    ): Promise<unknown> {
        return this.pedir("GET", caminho, aceitos, undefined, params);
    }

    delete(caminho: string, aceitos: readonly number[]): Promise<unknown> {
        return this.pedir("DELETE", caminho, aceitos);
    }

    private async pedir(
        method: "GET" | "POST" | "DELETE",
        caminho: string,
        aceitos: readonly number[],
        corpo?: FormData,
        params?: Record<string, string | number | undefined>
    ): Promise<unknown> {
        if (!caminhoPermitido(caminho)) {
            throw new AxiosError("falha");
        }

        const url = new URL(`${this.base}${caminho}`);
        if (params) {
            for (const [chave, valor] of Object.entries(params)) {
                if (valor !== undefined && valor !== "") url.searchParams.set(chave, String(valor));
            }
        }

        let resposta: Response;
        try {
            resposta = await this.buscar(url, {
                method,
                body: corpo,
                credentials: "omit",
                redirect: "error",
                headers: { Accept: "application/json" },
                signal: AbortSignal.timeout(TEMPO_MS)
            });
        } catch {
            throw new AxiosError("falha");
        }

        if (!aceitos.includes(resposta.status)) {
            throw new AxiosError("falha");
        }

        try {
            return await resposta.json();
        } catch {
            throw new AxiosError("falha");
        }
    }
}
