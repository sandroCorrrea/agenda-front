export class AvisoPostRequestDTO {
    constructor(
        public nome: string,
        public descricao: string,
        public usuario_id: number
    ) {}
}
