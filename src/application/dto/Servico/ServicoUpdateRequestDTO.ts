export class ServicoUpdateRequestDTO {
    constructor(
        public nome: string,
        public descricao: string | null,
        public status?: "ativo" | "inativo"
    ) {}
}
