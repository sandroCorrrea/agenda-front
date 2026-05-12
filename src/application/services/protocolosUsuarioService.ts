import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type { ProtocoloListagemResponseDTO } from "@/application/dto/Protocolo/ProtocoloListagemResponseDTO";
import type { ProtocoloUsuarioListQuery } from "@/application/dto/Protocolo/ProtocoloUsuarioListagemQuery";
import { sanitizeProtocoloUsuarioQuery } from "@/shared/utils/protocoloUsuarioQuery";

/**
 * Listagem de protocolos por usuário (destinatário ou administrador).
 * Centraliza sanitização e chamada ao repositório.
 */
export async function listarProtocolosPorUsuario(
    repo: IProtocoloRepository,
    usuarioId: number,
    query: Partial<ProtocoloUsuarioListQuery>,
    signal?: AbortSignal
): Promise<ProtocoloListagemResponseDTO> {
    const params = sanitizeProtocoloUsuarioQuery(query);
    return repo.listPaginatedByUsuarioId(usuarioId, params, signal);
}
