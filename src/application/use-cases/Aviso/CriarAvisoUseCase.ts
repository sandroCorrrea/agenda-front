import type { AvisoListagemDTO } from "@/application/dto/Aviso/AvisoListagemDTO";
import type { AvisoPostRequestDTO } from "@/application/dto/Aviso/AvisoPostRequestDTO";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";

export class CriarAvisoUseCase {
    constructor(private repository: IAvisoRepository) {}

    execute(dto: AvisoPostRequestDTO): Promise<AvisoListagemDTO> {
        return this.repository.create(dto);
    }
}
