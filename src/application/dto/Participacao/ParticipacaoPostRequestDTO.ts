export class ParticipacaoPostRequestDTO {
    constructor(
        public bairro_comunidade: string,
        public faixa_etaria: string,
        public localidade_atendida: string,
        public participacao_funcao_id: number,
        public tipo_demanda: string,
        public problema: string,
        public solucao: string,
        public beneficios: string,
        /** Um ou mais values do enum (ex.: ["criancas", "idosos"]). */
        public publico_beneficiado: string[],
        public prioridade: string,
        public abrangencia: string,
        public autoriza_lgpd: boolean,
        public aceite_viabilidade: boolean,
        public nome?: string | null,
        public sexo?: string | null,
        public email?: string | null,
        public telefone?: string | null,
        public localidade_descricao?: string | null,
        public deseja_info_audiencia?: boolean,
        public instrumento?: string,
        public exercicio?: number
    ) {}
}
