export class BlogPostagemPostRequestDTO {
    constructor(
        public nome: string,
        public descricao: string,
        public categoria_id: number,
        public usuario_id: number,
        public imagem?: File | null,
        public arquivo?: File | null
    ) {}
}
