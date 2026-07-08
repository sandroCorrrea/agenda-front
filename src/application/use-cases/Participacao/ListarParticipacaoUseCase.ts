import type { ParticipacaoListagemQueryDTO } from "@/application/dto/Participacao/ParticipacaoListagemQueryDTO";
import type { ParticipacaoListagemResponseDTO } from "@/application/dto/Participacao/ParticipacaoListagemResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class ListarParticipacaoUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    async execute(
        params?: ParticipacaoListagemQueryDTO
    ): Promise<ParticipacaoListagemResponseDTO> {
        return await this.repository.listar(params);
    }
}
