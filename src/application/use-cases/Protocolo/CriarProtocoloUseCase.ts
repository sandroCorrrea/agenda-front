import type { ProtocoloPayloadDTO } from "@/application/dto/Protocolo/ProtocoloPayloadDTO";
import type { Protocolo } from "@/domain/entities/Protocolo";
import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";

export class CriarProtocoloUseCase {
    constructor(private repository: IProtocoloRepository) {}

    execute(dto: ProtocoloPayloadDTO): Promise<Protocolo> {
        return this.repository.create(dto);
    }
}
