import type { AvisoListagemDTO } from "./AvisoListagemDTO";

export class AvisoListagemResponseDTO {
    constructor(
        public aviso: AvisoListagemDTO[],
        public total: number,
        public pagina: number,
        public porPagina: number
    ) {}
}
