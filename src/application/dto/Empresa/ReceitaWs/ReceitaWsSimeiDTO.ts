export class ReceitaWsSimeiDTO {
    constructor(
        public optante: boolean,
        public dataOpcao: string | null,
        public dataExclusao: string | null,
        public ultimaAtualizacao: string
    ) {}
}

