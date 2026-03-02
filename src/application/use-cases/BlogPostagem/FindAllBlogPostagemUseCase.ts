import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";

export class FindAllBlogPostagemUseCase {
    constructor (
        private repository: IBlogPostagemRepository
    ) {}

    async execute(page: number, per_page: number, nome?: string) {
        return this.repository.findAll(page, per_page, nome);
    }
}
