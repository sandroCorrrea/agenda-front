import type { ParticipacaoRelatorioPdfDTO } from "@/application/dto/Participacao/ParticipacaoRelatorioPdfDTO";
import type { ParticipacaoRelatorioRequestDTO } from "@/application/dto/Participacao/ParticipacaoRelatorioRequestDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";

export class GerarRelatorioParticipacaoPdfUseCase {
    constructor(private repository: IParticipacaoRepository) {}

    async execute(dto: ParticipacaoRelatorioRequestDTO): Promise<ParticipacaoRelatorioPdfDTO> {
        return await this.repository.gerarRelatorioPdf(dto);
    }
}
