import type { BlogCategoria } from "@/domain/entities/BlogCategoria";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import type { BlogCategoriaUpdateRequestDTO } from "@/application/dto/BlogCategoria/BlogCategoriaUpdateRequestDTO";

export class AtualizarBlogCategoriaUseCase {
    constructor(private repository: IBlogCategoriaRepository) {}

    execute(id: number, dto: BlogCategoriaUpdateRequestDTO): Promise<BlogCategoria> {
        return this.repository.update(id, dto);
    }
}
