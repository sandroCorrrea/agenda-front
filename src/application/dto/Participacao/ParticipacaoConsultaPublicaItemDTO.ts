/**
 * Retorno público (sem análise técnica interna).
 * Campos sensíveis do cidadão (e-mail/telefone/nome completo) podem vir mascarados pelo backend.
 */
export interface ParticipacaoConsultaPublicaItemDTO {
    id: number;
    instrumento: string;
    exercicio: number;
    status: string;
    bairroComunidade: string;
    localidadeAtendida: string;
    localidadeDescricao: string | null;
    prioridade: string;
    tipoDemanda: string;
    publicoBeneficiado: string[];
    problemaResumo: string | null;
    solucaoResumo: string | null;
    funcao: {
        id: number;
        codigo: string;
        nome: string;
    } | null;
    registradoEm: string | null;
}
