export type BlogCategoriaStatusDTO = "ativo" | "inativo";

export class BlogCategoriaUpdateRequestDTO {
    constructor(
        public nome: string,
        public descricao: string,
        public status?: BlogCategoriaStatusDTO
    ) {}
}
