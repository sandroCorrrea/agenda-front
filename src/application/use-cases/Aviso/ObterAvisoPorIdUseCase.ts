import type { AvisoListagemDTO } from "@/application/dto/Aviso/AvisoListagemDTO";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";

export class ObterAvisoPorIdUseCase {
    constructor(private repository: IAvisoRepository) {}

    execute(id: number): Promise<AvisoListagemDTO> {
        return this.repository.findById(id);
    }
}
