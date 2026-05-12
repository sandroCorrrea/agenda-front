import type { Protocolo } from "@/domain/entities/Protocolo";

export class ProtocoloListagemResponseDTO {
    constructor(
        public protocolo: Protocolo[],
        public total: number,
        public pagina: number,
        public porPagina: number
    ) {}
}
