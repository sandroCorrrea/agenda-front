import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type { ProtocoloListagemResponseDTO } from "@/application/dto/Protocolo/ProtocoloListagemResponseDTO";

export class ListarProtocolosPaginadoUseCase {
    constructor(private repository: IProtocoloRepository) {}

    execute(params?: {
        page?: number;
        per_page?: number;
        titulo?: string;
        ano?: number;
        destinatario_tipo?: "fisica" | "juridica";
    }): Promise<ProtocoloListagemResponseDTO> {
        return this.repository.listPaginated(params);
    }
}
