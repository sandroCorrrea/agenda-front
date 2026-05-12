import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";

export class ExcluirBlogCategoriaUseCase {
    constructor(private repository: IBlogCategoriaRepository) {}

    execute(id: number): Promise<void> {
        return this.repository.delete(id);
    }
}
