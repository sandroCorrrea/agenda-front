import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";

export class ExcluirProtocoloUseCase {
    constructor(private repository: IProtocoloRepository) {}

    execute(id: number): Promise<void> {
        return this.repository.delete(id);
    }
}
