export class ServicoPostRequestDTO {
    constructor(
        public nome: string,
        public descricao: string | null,
        public status?: "ativo" | "inativo"
    ) {}
}
