import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";

export class FindAllBlogCategoriaQtdPostagemUseCase {
    constructor (
        private repository: IBlogCategoriaRepository
    ) {}

    async execute() {
        return this.repository.findQtdPostagem();
    }
}
