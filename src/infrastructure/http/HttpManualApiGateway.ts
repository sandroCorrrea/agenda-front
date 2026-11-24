import { AxiosError } from "axios";
import { registrarManualApi } from "@/infrastructure/http/manualApiLog";
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

function descreverArquivos(corpo?: FormData): string {
    if (!corpo) return "";
    const partes: string[] = [];
    for (const [campo, valor] of corpo.entries()) {
        if (valor instanceof File) partes.push(`${campo}=${valor.name}:${valor.size}`);
    }
    return partes.join(";");
}

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

        const inicio = performance.now();
        registrarManualApi("pedido", {
            method,
            url: url.href,
            caminho,
            origin: typeof window === "undefined" ? "" : window.location.origin,
            arquivos: descreverArquivos(corpo),
            modo: import.meta.env.MODE
        });

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
        } catch (erro: unknown) {
            registrarManualApi("falha-rede", {
                method,
                url: url.href,
                caminho,
                nome: erro instanceof Error ? erro.name : "Error",
                mensagem: erro instanceof Error ? erro.message : "",
                duracao: Math.round(performance.now() - inicio),
                online: typeof navigator === "undefined" ? null : navigator.onLine
            });
            throw new AxiosError("falha");
        }

        const aceito = aceitos.includes(resposta.status);
        let json: unknown = null;
        let jsonLegivel = false;
        try {
            json = await resposta.json();
            jsonLegivel = true;
        } catch {
            jsonLegivel = false;
        }

        const dados: Record<string, string | number | boolean | null> = {
            method,
            url: url.href,
            http: resposta.status,
            contentType: resposta.headers.get("content-type") ?? "",
            duracao: Math.round(performance.now() - inicio),
            aceito
        };
        if (jsonLegivel && json != null && typeof json === "object" && !Array.isArray(json)) {
            const registro = json as Record<string, unknown>;
            if (typeof registro.status === "string") dados.status = registro.status;
            if (typeof registro.totalErros === "number") dados.totalErros = registro.totalErros;
            if (typeof registro.mensagem === "string") dados.mensagem = registro.mensagem;
        }
        registrarManualApi("resposta", dados);

        if (!aceito || !jsonLegivel) {
            throw new AxiosError("falha");
        }
        return json;
    }
}
