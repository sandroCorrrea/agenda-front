import type { ParticipacaoOpcoesResponseDTO } from "@/application/dto/Participacao/ParticipacaoOpcoesResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class GetParticipacaoOpcoesUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    async execute(): Promise<ParticipacaoOpcoesResponseDTO> {
        return await this.repository.getOpcoes();
    }
}
