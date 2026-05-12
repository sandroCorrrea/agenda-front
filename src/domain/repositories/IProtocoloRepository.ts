import type { ProtocoloPayloadDTO } from "@/application/dto/Protocolo/ProtocoloPayloadDTO";
import type { ProtocoloListagemResponseDTO } from "@/application/dto/Protocolo/ProtocoloListagemResponseDTO";
import type {
    ConsultaAssinaturaProtocoloDTO,
    RegistrarAssinaturaResponseDTO
} from "@/application/dto/Protocolo/ProtocoloAssinaturaDTO";
import type {
    ClienteOption,
    EmpresaOption,
    EnderecoDestinatarioResponse,
    Protocolo
} from "../entities/Protocolo";

export interface IProtocoloRepository {
    listPaginated(params?: {
        page?: number;
        per_page?: number;
        titulo?: string;
        ano?: number;
        destinatario_tipo?: "fisica" | "juridica";
    }): Promise<ProtocoloListagemResponseDTO>;
    /** GET /protocolo/usuario/{usuarioId} — protocolos em que o usuario e destinatario ou administrador */
    listPaginatedByUsuarioId(
        usuarioId: number,
        params?: {
            page?: number;
            per_page?: number;
            titulo?: string;
            ano?: number;
            destinatario_tipo?: "fisica" | "juridica";
        },
        signal?: AbortSignal
    ): Promise<ProtocoloListagemResponseDTO>;
    findById(id: number): Promise<Protocolo>;
    create(dto: ProtocoloPayloadDTO): Promise<Protocolo>;
    update(id: number, dto: ProtocoloPayloadDTO): Promise<Protocolo>;
    delete(id: number): Promise<void>;
    listDestinatarioEmpresas(): Promise<EmpresaOption[]>;
    listDestinatarioClientes(): Promise<ClienteOption[]>;
    getEnderecoDestinatarioByEmpresaId(empresaId: number): Promise<EnderecoDestinatarioResponse>;
    getEnderecoDestinatarioByUsuarioId(usuarioId: number): Promise<EnderecoDestinatarioResponse>;
    /** GET /protocolo/{id}/pdf — autenticado (perfil conforme backend) */
    downloadPdf(id: number): Promise<{ blob: Blob; filename: string }>;
    /** GET /protocolo/assinatura/{token} — público */
    consultarAssinaturaPorToken(token: string): Promise<ConsultaAssinaturaProtocoloDTO>;
    /** POST /protocolo/assinatura/{token} — público */
    registrarAssinaturaPorToken(
        token: string,
        payload: {
            nome_responsavel_recebimento: string;
            cpf_responsavel_recebimento: string;
        }
    ): Promise<RegistrarAssinaturaResponseDTO>;
}
