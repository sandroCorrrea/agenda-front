export class ContatoPostRequestDTO {
    constructor (
        public nome: string,
        public email: string,
        public mensagem: string,
        public empresa?: string
    ) {}
}
