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

export interface ISicomRepository {
    validarRemessa(manual: File, remessa: File): Promise<SicomValidacaoResposta>;
    consultarEmentario(remessa: File, ementario: File): Promise<SicomContasResposta>;
    gerarRelatorio(remessa: File, ementario: File): Promise<SicomRelatorioResposta>;
    gravarHistorico(remessas: File[], ementario: File): Promise<SicomHistoricoGravacao>;
    listarHistorico(municipio?: string): Promise<SicomHistoricoLista>;
    detalharHistorico(id: number): Promise<SicomHistoricoDetalhe>;
    excluirHistorico(id: number): Promise<SicomHistoricoExclusao>;
    prever(municipio: string, horizonte: number): Promise<SicomPrevisao>;
}
