import type { BlogCategoria } from "@/domain/entities/BlogCategoria";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";

export class ObterBlogCategoriaPorIdUseCase {
    constructor(private repository: IBlogCategoriaRepository) {}

    execute(id: number): Promise<BlogCategoria> {
        return this.repository.findById(id);
    }
}
