export interface ParticipacaoAnaliseDTO {
    id: number;
    participacaoId: number;
    funcao: string | null;
    subfuncao: string | null;
    programa: string | null;
    naturezaDespesa: string | null;
    categoriaEconomica: string | null;
    possuiPrevisaoPpa: boolean | null;
    compativelLdo: boolean | null;
    fonteRecurso: string | null;
    atende: boolean | null;
    parecerTecnico: string | null;
    usuarioAnaliseId: number | null;
}
