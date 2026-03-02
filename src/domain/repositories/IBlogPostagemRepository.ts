import type { BlogPostagem } from "../entities/BlogPostagem";
import type { PaginatedResult } from "../types/PaginatedResult";

export interface IBlogPostagemRepository {
    findAll(page: number, per_page: number, nome?: string): Promise<PaginatedResult<BlogPostagem>>;
}
