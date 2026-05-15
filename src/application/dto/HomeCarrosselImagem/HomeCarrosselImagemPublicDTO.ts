/**
 * DTO de leitura do endpoint público GET /home/carrossel.
 * Mantém os campos exatamente como o backend devolve (snake_case),
 * pois é usado direto na renderização do carrossel da Home.
 */
export interface HomeCarrosselImagemPublicDTO {
    id: number;
    titulo: string;
    alt_text: string;
    imagem_url: string;
    src: string;
    ordem: number;
    ativo: boolean;
    link_url: string | null;
    abrir_em_nova_aba: boolean;
}
