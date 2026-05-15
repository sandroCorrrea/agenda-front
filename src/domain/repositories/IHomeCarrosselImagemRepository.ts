import type { HomeCarrosselImagem } from "../entities/HomeCarrosselImagem";
import type { HomeCarrosselImagemListagemResponseDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemListagemResponseDTO";
import type { HomeCarrosselImagemPostRequestDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemPostRequestDTO";
import type { HomeCarrosselImagemUpdateRequestDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemUpdateRequestDTO";

export interface IHomeCarrosselImagemRepository {
    /** GET /home/carrossel — listagem pública, apenas itens ativos. */
    listPublic(limit?: number): Promise<HomeCarrosselImagem[]>;

    /** GET /admin/home/carrossel — listagem administrativa com paginação. */
    listAdmin(params?: {
        page?: number;
        per_page?: number;
        ativo?: boolean | null;
        titulo?: string | null;
    }): Promise<HomeCarrosselImagemListagemResponseDTO>;

    /** GET /admin/home/carrossel/{id} */
    findById(id: number): Promise<HomeCarrosselImagem>;

    /** POST /admin/home/carrossel — multipart, imagem obrigatória. */
    create(dto: HomeCarrosselImagemPostRequestDTO): Promise<HomeCarrosselImagem>;

    /**
     * PUT /admin/home/carrossel/{id} ou POST {id} (multipart com _method=PUT).
     * Se `dto.imagem` for `File`, envia multipart e troca o arquivo no backend.
     * Caso contrário, envia JSON e mantém a imagem atual.
     */
    update(
        id: number,
        dto: HomeCarrosselImagemUpdateRequestDTO
    ): Promise<HomeCarrosselImagem>;

    /** DELETE /admin/home/carrossel/{id} — soft delete. */
    delete(id: number): Promise<void>;
}
