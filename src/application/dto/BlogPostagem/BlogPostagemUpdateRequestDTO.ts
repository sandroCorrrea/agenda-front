export type BlogPostagemStatusDTO = "ativo" | "inativo";

export class BlogPostagemUpdateRequestDTO {
    constructor(
        public nome: string,
        public descricao: string,
        public categoria_id: number,
        public usuario_id: number,
        public status?: BlogPostagemStatusDTO,
        public imagem?: File | null,
        public arquivo?: File | null
    ) {}
}
