import type { BlogCategoriaQtdPostagemGetResponse } from "@/application/dto/BlogCategoria/BlogCategoriaQtdPostagemGetResponse";
import type { BlogCategoriaPostRequestDTO } from "@/application/dto/BlogCategoria/BlogCategoriaPostRequestDTO";
import type { BlogCategoriaListagemResponseDTO } from "@/application/dto/BlogCategoria/BlogCategoriaListagemResponseDTO";
import type { BlogCategoriaUpdateRequestDTO } from "@/application/dto/BlogCategoria/BlogCategoriaUpdateRequestDTO";
import type { BlogCategoria } from "../entities/BlogCategoria";

export interface IBlogCategoriaRepository {
    findAll(page: number, per_page: number, nome?: string): Promise<Array<BlogCategoria>>;
    findById(id: number): Promise<BlogCategoria>;
    create(dto: BlogCategoriaPostRequestDTO): Promise<BlogCategoria>;
    update(id: number, dto: BlogCategoriaUpdateRequestDTO): Promise<BlogCategoria>;
    delete(id: number): Promise<void>;
    listPaginated(params?: {
        page?: number;
        per_page?: number;
    }): Promise<BlogCategoriaListagemResponseDTO>;
    findQtdPostagem(): Promise<Array<BlogCategoriaQtdPostagemGetResponse>>
}
