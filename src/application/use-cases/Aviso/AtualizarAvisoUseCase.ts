import type { AvisoListagemDTO } from "@/application/dto/Aviso/AvisoListagemDTO";
import type { AvisoUpdateRequestDTO } from "@/application/dto/Aviso/AvisoUpdateRequestDTO";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";

export class AtualizarAvisoUseCase {
    constructor(private repository: IAvisoRepository) {}

    execute(id: number, dto: AvisoUpdateRequestDTO): Promise<AvisoListagemDTO> {
        return this.repository.update(id, dto);
    }
}
