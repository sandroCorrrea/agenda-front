import type { BlogPostagemTagGetResponse } from "@/application/dto/BlogPostagem/BlogPostagemTagGetResponse";
import type { BlogPostagemPostRequestDTO } from "@/application/dto/BlogPostagem/BlogPostagemPostRequestDTO";
import type { BlogPostagemUpdateRequestDTO } from "@/application/dto/BlogPostagem/BlogPostagemUpdateRequestDTO";
import type { BlogPostagem } from "../entities/BlogPostagem";
import type { PaginatedResult } from "../types/PaginatedResult";

export interface IBlogPostagemRepository {
    findAll(page: number, per_page: number, nome?: string): Promise<PaginatedResult<BlogPostagem>>;
    create(dto: BlogPostagemPostRequestDTO): Promise<BlogPostagem>;
    update(id: number, dto: BlogPostagemUpdateRequestDTO): Promise<BlogPostagem>;
    findTag(): Promise<Array<BlogPostagemTagGetResponse>>;
    findById(id: number): Promise<BlogPostagem>;
    findByCategoriaId(id: number): Promise<Array<BlogPostagem>>
    findByNome(nome: string): Promise<Array<BlogPostagem>>
    /** DELETE /blog/postagem/{id} — sucesso HTTP 204 sem corpo. */
    delete(id: number): Promise<void>;
}
