import type { BlogCategoria } from "./BlogCategoria";

export class BlogPostagem {
    constructor(
        public id: number,
        public nome: string,
        public descricao: string,
        public categoria: BlogCategoria,
        public status: string,
        public imagem: string | null,
        public arquivo: string | null,
    ) {}
}
