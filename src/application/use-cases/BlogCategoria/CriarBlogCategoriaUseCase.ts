import type { BlogCategoriaPostRequestDTO } from "@/application/dto/BlogCategoria/BlogCategoriaPostRequestDTO";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import type { BlogCategoria } from "@/domain/entities/BlogCategoria";

export class CriarBlogCategoriaUseCase {
    constructor(private repository: IBlogCategoriaRepository) {}

    execute(dto: BlogCategoriaPostRequestDTO): Promise<BlogCategoria> {
        return this.repository.create(dto);
    }
}
