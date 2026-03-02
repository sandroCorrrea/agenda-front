import type { BlogCategoria } from "../entities/BlogCategoria";

export interface IBlogCategoriaRepository {
    findAll(page: number, per_page: number, nome?: string): Promise<Array<BlogCategoria>>;
}
