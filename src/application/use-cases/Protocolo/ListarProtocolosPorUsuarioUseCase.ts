import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type { ProtocoloListagemResponseDTO } from "@/application/dto/Protocolo/ProtocoloListagemResponseDTO";
import type { ProtocoloUsuarioListQuery } from "@/application/dto/Protocolo/ProtocoloUsuarioListagemQuery";
import { listarProtocolosPorUsuario } from "@/application/services/protocolosUsuarioService";

export class ListarProtocolosPorUsuarioUseCase {
    constructor(private repository: IProtocoloRepository) {}

    execute(
        usuarioId: number,
        query: Partial<ProtocoloUsuarioListQuery>,
        signal?: AbortSignal
    ): Promise<ProtocoloListagemResponseDTO> {
        return listarProtocolosPorUsuario(this.repository, usuarioId, query, signal);
    }
}
