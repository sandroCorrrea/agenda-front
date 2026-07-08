import type { ParticipacaoConsultaPublicaQueryDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaQueryDTO";
import type { ParticipacaoConsultaPublicaResponseDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class ConsultarParticipacaoPublicaUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    async execute(
        query: ParticipacaoConsultaPublicaQueryDTO
    ): Promise<ParticipacaoConsultaPublicaResponseDTO> {
        return await this.repository.consultarPublico(query);
    }
}
