/** Query GET /protocolo e GET /protocolo/usuario/{usuarioId} — valores antes da sanitização. */
export type DestinatarioTipoProtocoloUsuario = "fisica" | "juridica";

export interface ProtocoloUsuarioListQuery {
    page?: number;
    per_page?: number;
    titulo?: string;
    ano?: number;
    destinatario_tipo?: DestinatarioTipoProtocoloUsuario;
    /** CNPJ do destinatário jurídico (com ou sem máscara). */
    cnpj?: string;
    /** CPF do destinatário pessoa física (com ou sem máscara). */
    cpf?: string;
    /** Busca em título ou descrição (case-insensitive). */
    descricao?: string;
}
