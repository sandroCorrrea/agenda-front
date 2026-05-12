import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";

export class ExcluirAvisoUseCase {
    constructor(private repository: IAvisoRepository) {}

    execute(id: number): Promise<void> {
        return this.repository.delete(id);
    }
}
