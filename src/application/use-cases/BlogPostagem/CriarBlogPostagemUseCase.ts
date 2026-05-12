import type { BlogPostagemPostRequestDTO } from "@/application/dto/BlogPostagem/BlogPostagemPostRequestDTO";
import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";

export class CriarBlogPostagemUseCase {
    constructor(private repository: IBlogPostagemRepository) {}

    execute(dto: BlogPostagemPostRequestDTO): Promise<BlogPostagem> {
        return this.repository.create(dto);
    }
}
