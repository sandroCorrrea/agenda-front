import type { BlogPostagemTagGetResponse } from "@/application/dto/BlogPostagem/BlogPostagemTagGetResponse";
import type { BlogPostagem } from "../entities/BlogPostagem";
import type { PaginatedResult } from "../types/PaginatedResult";

export interface IBlogPostagemRepository {
    findAll(page: number, per_page: number, nome?: string): Promise<PaginatedResult<BlogPostagem>>;
    findTag(): Promise<Array<BlogPostagemTagGetResponse>>;
    findById(id: number): Promise<BlogPostagem>;
    findByCategoriaId(id: number): Promise<Array<BlogPostagem>>
    findByNome(nome: string): Promise<Array<BlogPostagem>>
}
