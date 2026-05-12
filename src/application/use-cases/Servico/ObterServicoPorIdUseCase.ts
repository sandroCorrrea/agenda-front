import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import type { Servico } from "@/domain/entities/Servico";

export class ObterServicoPorIdUseCase {
    constructor(private repository: IServicoRepository) {}

    execute(id: number): Promise<Servico> {
        return this.repository.findById(id);
    }
}
