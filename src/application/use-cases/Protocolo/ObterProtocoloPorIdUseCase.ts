import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type { Protocolo } from "@/domain/entities/Protocolo";

export class ObterProtocoloPorIdUseCase {
    constructor(private repository: IProtocoloRepository) {}

    execute(id: number): Promise<Protocolo> {
        return this.repository.findById(id);
    }
}
