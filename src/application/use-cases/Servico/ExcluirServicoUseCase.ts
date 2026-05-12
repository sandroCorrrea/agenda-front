import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";

export class ExcluirServicoUseCase {
    constructor(private repository: IServicoRepository) {}

    execute(id: number): Promise<void> {
        return this.repository.delete(id);
    }
}
