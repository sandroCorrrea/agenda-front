import type { AvisoListagemResponseDTO } from "@/application/dto/Aviso/AvisoListagemResponseDTO";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";

export class ListarAvisosPaginadoUseCase {
    constructor(private repository: IAvisoRepository) {}

    execute(params?: {
        page?: number;
        per_page?: number;
        usuario_id?: number;
    }): Promise<AvisoListagemResponseDTO> {
        return this.repository.listPaginated(params);
    }
}
