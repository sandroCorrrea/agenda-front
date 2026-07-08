export interface ParticipacaoListagemQueryDTO {
    page?: number;
    per_page?: number;
    exercicio?: number;
    instrumento?: string;
    status?: string;
    prioridade?: string;
    localidade_atendida?: string;
    participacao_funcao_id?: number;
}
