import type { ServicoUpdateRequestDTO } from "@/application/dto/Servico/ServicoUpdateRequestDTO";
import type { Servico } from "@/domain/entities/Servico";
import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";

export class AtualizarServicoUseCase {
    constructor(private repository: IServicoRepository) {}

    execute(id: number, dto: ServicoUpdateRequestDTO): Promise<Servico> {
        return this.repository.update(id, dto);
    }
}
