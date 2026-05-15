import type { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";

export class HomeCarrosselImagemListagemResponseDTO {
    constructor(
        public imagens: HomeCarrosselImagem[],
        public total: number,
        public pagina: number,
        public porPagina: number
    ) {}
}
