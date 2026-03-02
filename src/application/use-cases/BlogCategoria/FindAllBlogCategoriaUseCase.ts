import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";

export class FindAllBlogCategoriaUseCase {
    constructor (
        private repository: IBlogCategoriaRepository
    ) {}

    async execute(page: number, per_page: number, nome?: string) {
        return this.repository.findAll(page, per_page, nome);
    }
};
