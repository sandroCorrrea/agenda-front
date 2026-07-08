import type { ParticipacaoFormularioLinkDTO } from "@/application/dto/Participacao/ParticipacaoFormularioLinkDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class ObterLinkFormularioParticipacaoUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    execute(): Promise<ParticipacaoFormularioLinkDTO> {
        return this.repository.obterLinkFormulario();
    }
}
