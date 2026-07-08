import type { ParticipacaoAnaliseRequestDTO } from "@/application/dto/Participacao/ParticipacaoAnaliseRequestDTO";
import type { ParticipacaoPostResponseDTO } from "@/application/dto/Participacao/ParticipacaoPostResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class SalvarAnaliseParticipacaoUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    async execute(
        id: number,
        dto: ParticipacaoAnaliseRequestDTO
    ): Promise<ParticipacaoPostResponseDTO> {
        return await this.repository.salvarAnalise(id, dto);
    }
}
