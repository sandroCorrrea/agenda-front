import type { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import type {
    CandidatoSalvarDTO,
    CargoSalvarDTO,
    EleicaoSalvarDTO,
    PartidoSalvarDTO,
    PesquisaPerguntasSalvarDTO,
    PesquisaRespostaSalvarDTO,
    PesquisaSalvarDTO
} from "@/application/dto/Politica/PoliticaRequestDTO";
import type { IPoliticaRepository } from "@/domain/repositories/IPoliticaRepository";
import type {
    ArquivoExportado,
    Cargo,
    Candidato,
    Eleicao,
    MunicipioPolitica,
    Partido,
    PesquisaDetalhe,
    PesquisaResultado,
    PesquisaResumo,
    PoliticaListaQuery,
    PoliticaMensagem,
    PoliticaPagina,
    ResultadoFiltro
} from "@/domain/politica/tipos";
import { nomeArquivoDoContentDisposition } from "@/shared/utils/contentDispositionFilename";
import {
    limparParams,
    mapCandidato,
    mapCargo,
    mapEleicao,
    mapMensagem,
    mapMunicipio,
    mapPagina,
    mapPartido,
    mapPesquisaDetalhe,
    mapPesquisaResumo,
    mapResultado
} from "@/infrastructure/repositories/politica/politicaMappers";

export class PoliticaRepository implements IPoliticaRepository {
    constructor(private api: AxiosInstance) {}

    obterPesquisaPublica(token: string): Promise<PesquisaDetalhe> {
        return this.api
            .get(`/politica/pesquisa/${encodeURIComponent(token)}`, { skipAuth: true })
            .then((resp) => mapPesquisaDetalhe(resp.data ?? {}));
    }

    enviarResposta(token: string, dto: PesquisaRespostaSalvarDTO): Promise<PoliticaMensagem> {
        return this.api
            .post(`/politica/pesquisa/${encodeURIComponent(token)}/resposta`, dto, { skipAuth: true })
            .then((resp) => mapMensagem(resp.data ?? {}));
    }

    listarEleicoes(query?: PoliticaListaQuery): Promise<PoliticaPagina<Eleicao>> {
        return this.listar("/politica/eleicao", "eleicoes", mapEleicao, query);
    }

    obterEleicao(id: number): Promise<Eleicao> {
        return this.api.get(`/politica/eleicao/${id}`).then((resp) => mapEleicao(resp.data ?? {}));
    }

    criarEleicao(dto: EleicaoSalvarDTO): Promise<Eleicao> {
        return this.api.post("/politica/eleicao", dto).then((resp) => mapEleicao(resp.data ?? {}));
    }

    atualizarEleicao(id: number, dto: EleicaoSalvarDTO): Promise<Eleicao> {
        return this.api.put(`/politica/eleicao/${id}`, dto).then((resp) => mapEleicao(resp.data ?? {}));
    }

    excluirEleicao(id: number): Promise<PoliticaMensagem> {
        return this.api.delete(`/politica/eleicao/${id}`).then((resp) => mapMensagem(resp.data ?? {}));
    }

    enviarArquivoEleicao(id: number, arquivo: File): Promise<PoliticaMensagem> {
        const corpo = new FormData();
        corpo.append("arquivo", arquivo);
        return this.api
            .post(`/politica/eleicao/${id}/arquivo`, corpo)
            .then((resp) => mapMensagem(resp.data ?? {}));
    }

    sincronizarEleicao(id: number): Promise<PoliticaMensagem> {
        return this.api
            .post(`/politica/eleicao/${id}/sincronizar`)
            .then((resp) => mapMensagem(resp.data ?? {}));
    }

    listarCargos(query?: PoliticaListaQuery): Promise<PoliticaPagina<Cargo>> {
        return this.listar("/politica/cargo", "cargos", mapCargo, query);
    }

    criarCargo(dto: CargoSalvarDTO): Promise<Cargo> {
        return this.api.post("/politica/cargo", dto).then((resp) => mapCargo(resp.data ?? {}));
    }

    atualizarCargo(id: number, dto: CargoSalvarDTO): Promise<Cargo> {
        return this.api.put(`/politica/cargo/${id}`, dto).then((resp) => mapCargo(resp.data ?? {}));
    }

    excluirCargo(id: number): Promise<PoliticaMensagem> {
        return this.api.delete(`/politica/cargo/${id}`).then((resp) => mapMensagem(resp.data ?? {}));
    }

    listarPartidos(query?: PoliticaListaQuery): Promise<PoliticaPagina<Partido>> {
        return this.listar("/politica/partido", "partidos", mapPartido, query);
    }

    criarPartido(dto: PartidoSalvarDTO): Promise<Partido> {
        return this.api.post("/politica/partido", dto).then((resp) => mapPartido(resp.data ?? {}));
    }

    atualizarPartido(id: number, dto: PartidoSalvarDTO): Promise<Partido> {
        return this.api.put(`/politica/partido/${id}`, dto).then((resp) => mapPartido(resp.data ?? {}));
    }

    excluirPartido(id: number): Promise<PoliticaMensagem> {
        return this.api.delete(`/politica/partido/${id}`).then((resp) => mapMensagem(resp.data ?? {}));
    }

    listarCandidatos(query?: PoliticaListaQuery): Promise<PoliticaPagina<Candidato>> {
        return this.listar("/politica/candidato", "candidatos", mapCandidato, query);
    }

    obterCandidato(id: number): Promise<Candidato> {
        return this.api.get(`/politica/candidato/${id}`).then((resp) => mapCandidato(resp.data ?? {}));
    }

    criarCandidato(dto: CandidatoSalvarDTO): Promise<Candidato> {
        return this.api.post("/politica/candidato", dto).then((resp) => mapCandidato(resp.data ?? {}));
    }

    atualizarCandidato(id: number, dto: CandidatoSalvarDTO): Promise<Candidato> {
        return this.api
            .put(`/politica/candidato/${id}`, dto)
            .then((resp) => mapCandidato(resp.data ?? {}));
    }

    excluirCandidato(id: number): Promise<PoliticaMensagem> {
        return this.api.delete(`/politica/candidato/${id}`).then((resp) => mapMensagem(resp.data ?? {}));
    }

    listarMunicipios(): Promise<MunicipioPolitica[]> {
        return this.api.get("/politica/municipios").then((resp) => {
            const lista = Array.isArray(resp.data?.municipios) ? resp.data.municipios : [];
            return lista.map((item: Record<string, unknown>) => mapMunicipio(item));
        });
    }

    listarPesquisas(query?: PoliticaListaQuery): Promise<PoliticaPagina<PesquisaResumo>> {
        return this.listar("/politica/pesquisa", "pesquisas", mapPesquisaResumo, query);
    }

    obterPesquisa(id: number): Promise<PesquisaDetalhe> {
        return this.api.get(`/politica/pesquisa/${id}`).then((resp) => mapPesquisaDetalhe(resp.data ?? {}));
    }

    criarPesquisa(dto: PesquisaSalvarDTO): Promise<PesquisaDetalhe> {
        return this.api.post("/politica/pesquisa", dto).then((resp) => mapPesquisaDetalhe(resp.data ?? {}));
    }

    atualizarPesquisa(id: number, dto: PesquisaSalvarDTO): Promise<PesquisaDetalhe> {
        return this.api
            .put(`/politica/pesquisa/${id}`, dto)
            .then((resp) => mapPesquisaDetalhe(resp.data ?? {}));
    }

    excluirPesquisa(id: number): Promise<PoliticaMensagem> {
        return this.api.delete(`/politica/pesquisa/${id}`).then((resp) => mapMensagem(resp.data ?? {}));
    }

    atualizarStatusPesquisa(id: number, status: string): Promise<PesquisaDetalhe> {
        return this.api
            .put(`/politica/pesquisa/${id}/status`, { status })
            .then((resp) => mapPesquisaDetalhe(resp.data ?? {}));
    }

    salvarPerguntas(id: number, dto: PesquisaPerguntasSalvarDTO): Promise<PesquisaDetalhe> {
        return this.api
            .put(`/politica/pesquisa/${id}/perguntas`, dto)
            .then((resp) => mapPesquisaDetalhe(resp.data ?? {}));
    }

    obterResultados(id: number, filtro?: ResultadoFiltro): Promise<PesquisaResultado> {
        return this.api
            .get(`/politica/pesquisa/${id}/resultados`, { params: limparParams(filtro) })
            .then((resp) => mapResultado(resp.data ?? {}));
    }

    exportarCsv(id: number, filtro?: ResultadoFiltro): Promise<ArquivoExportado> {
        return this.baixar(
            `/politica/pesquisa/${id}/exportacao/csv`,
            filtro,
            "text/csv, application/json",
            "pesquisa-resultados.csv"
        );
    }

    exportarPdf(id: number, filtro?: ResultadoFiltro): Promise<ArquivoExportado> {
        return this.baixar(
            `/politica/pesquisa/${id}/exportacao/pdf`,
            filtro,
            "application/pdf, application/json",
            "pesquisa-resultados.pdf"
        );
    }

    private listar<T>(
        url: string,
        chave: string,
        mapear: (item: Record<string, unknown>) => T,
        query?: PoliticaListaQuery
    ): Promise<PoliticaPagina<T>> {
        const page = query?.page ?? 1;
        const perPage = query?.per_page ?? 15;
        return this.api.get(url, { params: limparParams(query) }).then((resp) =>
            mapPagina(resp.data ?? {}, chave, mapear, page, perPage)
        );
    }

    private async baixar(
        url: string,
        filtro: ResultadoFiltro | undefined,
        accept: string,
        fallback: string
    ): Promise<ArquivoExportado> {
        try {
            const resp = await this.api.get(url, {
                params: limparParams(filtro),
                responseType: "blob",
                headers: { Accept: accept }
            });
            const blob = resp.data as Blob;
            const contentType = String(resp.headers["content-type"] ?? "");
            if (contentType.includes("application/json")) {
                throw new Error(await mensagemBlob(blob, "Não foi possível exportar."));
            }
            return {
                blob,
                filename: nomeArquivoDoContentDisposition(
                    headerTexto(resp, "content-disposition"),
                    fallback
                )
            };
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.data instanceof Blob) {
                throw new Error(await mensagemBlob(e.response.data, "Não foi possível exportar."));
            }
            throw e;
        }
    }
}

function headerTexto(resp: AxiosResponse, nome: string): string | undefined {
    const valor = resp.headers[nome];
    return typeof valor === "string" ? valor : undefined;
}

async function mensagemBlob(blob: Blob, fallback: string): Promise<string> {
    try {
        const parsed = JSON.parse(await blob.text()) as { message?: string };
        if (typeof parsed.message === "string" && parsed.message.trim()) return parsed.message;
        return fallback;
    } catch {
        return fallback;
    }
}
