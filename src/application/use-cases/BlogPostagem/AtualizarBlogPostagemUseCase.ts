import type { BlogPostagemUpdateRequestDTO } from "@/application/dto/BlogPostagem/BlogPostagemUpdateRequestDTO";
import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";

export class AtualizarBlogPostagemUseCase {
    constructor(private repository: IBlogPostagemRepository) {}

    execute(id: number, dto: BlogPostagemUpdateRequestDTO): Promise<BlogPostagem> {
        return this.repository.update(id, dto);
    }
}
