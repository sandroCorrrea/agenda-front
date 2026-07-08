import type { ParticipacaoFuncaoDTO } from "./ParticipacaoFuncaoDTO";
import type { ParticipacaoValueLabelDTO } from "./ParticipacaoValueLabelDTO";

export interface ParticipacaoOpcoesResponseDTO {
    faixaEtaria: ParticipacaoValueLabelDTO[];
    sexo: ParticipacaoValueLabelDTO[];
    localidadeAtendida: ParticipacaoValueLabelDTO[];
    tipoDemanda: ParticipacaoValueLabelDTO[];
    publicoBeneficiado: ParticipacaoValueLabelDTO[];
    prioridade: ParticipacaoValueLabelDTO[];
    abrangencia: ParticipacaoValueLabelDTO[];
    funcao: ParticipacaoFuncaoDTO[];
}
