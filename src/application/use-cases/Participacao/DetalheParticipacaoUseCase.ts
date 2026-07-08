import type { ParticipacaoPostResponseDTO } from "@/application/dto/Participacao/ParticipacaoPostResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class DetalheParticipacaoUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    async execute(id: number): Promise<ParticipacaoPostResponseDTO> {
        return await this.repository.detalhe(id);
    }
}
