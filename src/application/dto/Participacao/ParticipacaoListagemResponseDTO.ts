import type { ParticipacaoPostResponseDTO } from "./ParticipacaoPostResponseDTO";

export class ParticipacaoListagemResponseDTO {
    constructor(
        public participacao: ParticipacaoPostResponseDTO[],
        public total: number,
        public pagina: number,
        public porPagina: number
    ) {}
}
