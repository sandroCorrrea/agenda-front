import type { ISicomRepository } from "@/domain/repositories/ISicomRepository";
import type { SicomContasResposta } from "@/domain/sicom/contas";
import type {
    SicomHistoricoDetalhe,
    SicomHistoricoExclusao,
    SicomHistoricoGravacao,
    SicomHistoricoLista
} from "@/domain/sicom/historico";
import type { SicomPrevisao } from "@/domain/sicom/previsao";
import type { SicomRelatorioResposta } from "@/domain/sicom/relatorio";
import type { SicomValidacaoResposta } from "@/domain/sicom/validacao";
import { HttpManualApiGateway, type ManualApiGateway } from "@/infrastructure/http/HttpManualApiGateway";
import { mapContas } from "@/infrastructure/repositories/sicom/contasMappers";
import {
    mapDetalheHistorico,
    mapExclusaoHistorico,
    mapGravacaoHistorico,
    mapListaHistorico
} from "@/infrastructure/repositories/sicom/historicoMappers";
import { mapPrevisao } from "@/infrastructure/repositories/sicom/previsaoMappers";
import { mapRelatorio } from "@/infrastructure/repositories/sicom/relatorioMappers";
import { mapValidacao } from "@/infrastructure/repositories/sicom/validacaoMappers";

const ACEITOS_ENVIO = [200, 400, 413, 422] as const;

export class SicomRepository implements ISicomRepository {
    constructor(private http: ManualApiGateway = new HttpManualApiGateway()) {}

    validarRemessa(manual: File, remessa: File): Promise<SicomValidacaoResposta> {
        return this.http
            .post(
                "/api/remessas",
                [
                    { nome: "manual", arquivo: manual },
                    { nome: "remessa", arquivo: remessa }
                ],
                ACEITOS_ENVIO
            )
            .then((dados) => mapValidacao(dados));
    }

    consultarEmentario(remessa: File, ementario: File): Promise<SicomContasResposta> {
        return this.http
            .post(
                "/api/remessas/contas",
                [
                    { nome: "remessa", arquivo: remessa },
                    { nome: "ementario", arquivo: ementario }
                ],
                ACEITOS_ENVIO
            )
            .then((dados) => mapContas(dados));
    }

    gerarRelatorio(remessa: File, ementario: File): Promise<SicomRelatorioResposta> {
        return this.http
            .post(
                "/api/remessas/relatorio",
                [
                    { nome: "remessa", arquivo: remessa },
                    { nome: "ementario", arquivo: ementario }
                ],
                ACEITOS_ENVIO
            )
            .then((dados) => mapRelatorio(dados));
    }

    gravarHistorico(remessas: File[], ementario: File): Promise<SicomHistoricoGravacao> {
        return this.http
            .post(
                "/api/remessas/historico",
                [...remessas.map((arquivo) => ({ nome: "remessa", arquivo })), { nome: "ementario", arquivo: ementario }],
                ACEITOS_ENVIO
            )
            .then((dados) => mapGravacaoHistorico(dados));
    }

    listarHistorico(municipio?: string): Promise<SicomHistoricoLista> {
        return this.http
            .get("/api/remessas/historico", municipio ? { municipio } : undefined, [200, 400])
            .then((dados) => mapListaHistorico(dados));
    }

    detalharHistorico(id: number): Promise<SicomHistoricoDetalhe> {
        return this.http
            .get(`/api/remessas/historico/${id}`, undefined, [200, 404])
            .then((dados) => mapDetalheHistorico(dados));
    }

    excluirHistorico(id: number): Promise<SicomHistoricoExclusao> {
        return this.http.delete(`/api/remessas/historico/${id}`, [200, 404]).then((dados) => mapExclusaoHistorico(dados));
    }

    prever(municipio: string, horizonte: number): Promise<SicomPrevisao> {
        return this.http
            .get("/api/remessas/previsao", { municipio, horizonte }, [200, 400, 404])
            .then((dados) => mapPrevisao(dados));
    }
}
