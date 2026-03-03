import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";

export class FindTagBlogPostagemUseCase {
    constructor (
        private repository: IBlogPostagemRepository
    ) {}

    async execute() {
        return this.repository.findTag();
    }
}
