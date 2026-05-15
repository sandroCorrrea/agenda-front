/**
 * DTO bruto (raw) do backend para endpoints administrativos do carrossel.
 * Mantém os campos em snake_case porque a resposta vem nesse formato e
 * o mapeamento para a entity acontece no repositório.
 */
export interface HomeCarrosselImagemAdminDTO {
    id: number;
    titulo: string;
    alt_text: string;
    imagem_path: string;
    imagem_url: string;
    src: string;
    ordem: number;
    ativo: boolean;
    link_url: string | null;
    abrir_em_nova_aba: boolean;
    created_at: string;
    updated_at: string;
}
