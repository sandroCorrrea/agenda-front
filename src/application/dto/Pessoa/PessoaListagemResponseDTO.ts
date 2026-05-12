import type { PessoaListagemDTO } from "./PessoaListagemDTO";

export class PessoaListagemResponseDTO {
    constructor(
        public pessoa: PessoaListagemDTO[],
        public total: number,
        public pagina: number,
        public porPagina: number
    ) {}
}
