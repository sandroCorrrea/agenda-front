import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";

export class ExcluirBlogPostagemUseCase {
    constructor(private repository: IBlogPostagemRepository) {}

    execute(id: number): Promise<void> {
        return this.repository.delete(id);
    }
}
