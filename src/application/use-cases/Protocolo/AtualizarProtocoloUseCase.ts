import type { ProtocoloPayloadDTO } from "@/application/dto/Protocolo/ProtocoloPayloadDTO";
import type { Protocolo } from "@/domain/entities/Protocolo";
import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";

export class AtualizarProtocoloUseCase {
    constructor(private repository: IProtocoloRepository) {}

    execute(id: number, dto: ProtocoloPayloadDTO): Promise<Protocolo> {
        return this.repository.update(id, dto);
    }
}
