import type { ParticipacaoAnaliseDTO } from "./ParticipacaoAnaliseDTO";
import type { ParticipacaoFuncaoDTO } from "./ParticipacaoFuncaoDTO";

export interface ParticipacaoPostResponseDTO {
    id: number;
    instrumento: string;
    exercicio: number;
    ibge: string | null;
    /** Nome da cidade em endereco.localidade, resolvido pelo back-end a partir do IBGE. */
    localidade: string | null;
    bairroComunidade: string;
    faixaEtaria: string;
    localidadeAtendida: string;
    participacaoFuncaoId: number;
    tipoDemanda: string;
    problema: string;
    solucao: string;
    beneficios: string;
    /** Sempre array; backend antigo pode ainda devolver string (normalizado no repository). */
    publicoBeneficiado: string[];
    prioridade: string;
    abrangencia: string;
    desejaInfoAudiencia: boolean;
    autorizaLgpd: boolean;
    aceiteViabilidade: boolean;
    status: string;
    nome: string | null;
    sexo: string | null;
    email: string | null;
    telefone: string | null;
    localidadeDescricao: string | null;
    funcao: ParticipacaoFuncaoDTO | null;
    analise: ParticipacaoAnaliseDTO | null;
}
