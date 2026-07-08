import type { ParticipacaoConsultaPublicaItemDTO } from "./ParticipacaoConsultaPublicaItemDTO";

export class ParticipacaoConsultaPublicaResponseDTO {
    constructor(public participacao: ParticipacaoConsultaPublicaItemDTO[]) {}
}
