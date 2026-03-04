import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";

export class FindCategoriaByIdBlogPostagemUseCase {
    constructor (
        private repository: IBlogPostagemRepository
    ) {}

    async execute(id: number) {
        return this.repository.findByCategoriaId(id);
    }
}
