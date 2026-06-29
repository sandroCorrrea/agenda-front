import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type { ProtocoloListagemResponseDTO } from "@/application/dto/Protocolo/ProtocoloListagemResponseDTO";
import type { ProtocoloUsuarioListQuery } from "@/application/dto/Protocolo/ProtocoloUsuarioListagemQuery";
import type { ProtocoloUsuarioQuerySanitizado } from "@/shared/utils/protocoloUsuarioQuery";

export class ListarProtocolosPaginadoUseCase {
    constructor(private repository: IProtocoloRepository) {}

    execute(
        params?: Partial<ProtocoloUsuarioListQuery> | ProtocoloUsuarioQuerySanitizado
    ): Promise<ProtocoloListagemResponseDTO> {
        return this.repository.listPaginated(params);
    }
}
