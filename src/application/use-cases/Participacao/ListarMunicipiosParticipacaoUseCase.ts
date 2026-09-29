import type { ParticipacaoValueLabelDTO } from "@/application/dto/Participacao/ParticipacaoValueLabelDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class ListarMunicipiosParticipacaoUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    async execute(): Promise<ParticipacaoValueLabelDTO[]> {
        return await this.repository.listarMunicipios();
    }
}
