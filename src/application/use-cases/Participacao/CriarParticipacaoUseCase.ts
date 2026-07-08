import type { ParticipacaoPostRequestDTO } from "@/application/dto/Participacao/ParticipacaoPostRequestDTO";
import type { ParticipacaoPostResponseDTO } from "@/application/dto/Participacao/ParticipacaoPostResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class CriarParticipacaoUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    async execute(dto: ParticipacaoPostRequestDTO): Promise<ParticipacaoPostResponseDTO> {
        return await this.repository.criar(dto);
    }
}
