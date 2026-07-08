export class ParticipacaoAnaliseRequestDTO {
    constructor(
        public funcao?: string | null,
        public subfuncao?: string | null,
        public programa?: string | null,
        public natureza_despesa?: string | null,
        public categoria_economica?: string | null,
        public possui_previsao_ppa?: boolean | null,
        public compativel_ldo?: boolean | null,
        public fonte_recurso?: string | null,
        public atende?: boolean | null,
        public parecer_tecnico?: string | null,
        public status?: string | null,
        public usuario_analise_id?: number | null
    ) {}
}
