export class AvisoUpdateRequestDTO {
    constructor(
        public nome: string,
        public descricao: string,
        public usuario_id: number
    ) {}
}
