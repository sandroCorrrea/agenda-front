import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type {
    ReceitaOrcamentariaConsulta,
    ReceitaOrcamentariaDownload,
    ReceitaOrcamentariaEnvio,
    ReceitaOrcamentariaLista
} from "@/domain/casp/receitaOrcamentaria";
import type { IReceitaOrcamentariaRepository } from "@/domain/repositories/IReceitaOrcamentariaRepository";
import {
    mapEnvioReceita,
    mapListaReceita
} from "@/infrastructure/repositories/casp/receitaOrcamentariaMappers";
import { nomeArquivoDoContentDisposition } from "@/shared/utils/contentDispositionFilename";
import { LIMITE_BUSCA } from "@/shared/utils/receitaOrcamentaria";

const TIPO_PLANILHA = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const FALHA_DOWNLOAD = "Não foi possível baixar o arquivo.";

export class ReceitaOrcamentariaRepository implements IReceitaOrcamentariaRepository {
    constructor(private api: AxiosInstance) {}

    async listar(consulta: ReceitaOrcamentariaConsulta): Promise<ReceitaOrcamentariaLista> {
        const q = consulta.q?.trim().slice(0, LIMITE_BUSCA);
        const resp = await this.api.get("/casp/receita-orcamentaria", {
            params: {
                q: q || undefined,
                page: consulta.page,
                per_page: consulta.per_page
            }
        });
        return mapListaReceita(resp.data);
    }

    async enviar(
        arquivo: File,
        apelido?: string,
        aoProgresso?: (percentual: number) => void
    ): Promise<ReceitaOrcamentariaEnvio> {
        const dados = new FormData();
        dados.append("arquivo", arquivo);
        const nome = apelido?.trim();
        if (nome) dados.append("apelido", nome);

        const resp = await this.api.post("/casp/receita-orcamentaria", dados, {
            onUploadProgress: (evento) => {
                if (!aoProgresso || !evento.total) return;
                aoProgresso(Math.min(100, Math.round((evento.loaded * 100) / evento.total)));
            }
        });
        return mapEnvioReceita(resp.data);
    }

    async baixar(id: number, nomeOriginal: string): Promise<ReceitaOrcamentariaDownload> {
        try {
            const resp = await this.api.get(`/casp/receita-orcamentaria/${id}/download`, {
                responseType: "blob"
            });
            const blob = resp.data as Blob;
            const tipo = headerTexto(resp, "content-type");
            if (tipo?.includes("application/json")) {
                throw new Error(await mensagemDoBlob(blob, FALHA_DOWNLOAD));
            }
            return {
                blob: new Blob([blob], { type: TIPO_PLANILHA }),
                filename: nomeArquivoDoContentDisposition(
                    headerTexto(resp, "content-disposition"),
                    nomeOriginal
                )
            };
        } catch (erro: unknown) {
            if (erro instanceof Error && !axios.isAxiosError(erro)) throw erro;
            if (axios.isAxiosError(erro) && erro.response?.data instanceof Blob) {
                throw new Error(await mensagemDoBlob(erro.response.data, FALHA_DOWNLOAD));
            }
            throw new Error(FALHA_DOWNLOAD);
        }
    }
}

function headerTexto(resp: AxiosResponse, nome: string): string | undefined {
    const valor = resp.headers?.[nome];
    return typeof valor === "string" ? valor : undefined;
}

async function mensagemDoBlob(blob: Blob, fallback: string): Promise<string> {
    try {
        const parsed = JSON.parse(await blob.text()) as { message?: unknown };
        if (typeof parsed.message === "string" && parsed.message.trim()) return parsed.message;
        return fallback;
    } catch {
        return fallback;
    }
}
