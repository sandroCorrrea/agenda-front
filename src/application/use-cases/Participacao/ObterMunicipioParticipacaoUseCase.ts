import type { ParticipacaoMunicipioDTO } from "@/application/dto/Participacao/ParticipacaoMunicipioDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class ObterMunicipioParticipacaoUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    execute(municipioToken: string): Promise<ParticipacaoMunicipioDTO> {
        return this.repository.obterMunicipio(municipioToken);
    }
}
