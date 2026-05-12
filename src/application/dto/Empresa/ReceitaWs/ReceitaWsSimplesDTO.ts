export class ReceitaWsSimplesDTO {
    constructor(
        public optante: boolean,
        public dataOpcao: string | null,
        public dataExclusao: string | null,
        public ultimaAtualizacao: string
    ) {}
}

