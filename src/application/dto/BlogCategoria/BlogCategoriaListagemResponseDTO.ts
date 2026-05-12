import type { BlogCategoria } from "@/domain/entities/BlogCategoria";

export class BlogCategoriaListagemResponseDTO {
    constructor(
        public categoria: BlogCategoria[],
        public total: number,
        public pagina: number,
        public porPagina: number
    ) {}
}
