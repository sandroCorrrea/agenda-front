import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";

export class FindBlogPostagemByNomeUseCase {
    constructor (
        private repository: IBlogPostagemRepository
    ) {}

    async execute(nome: string) {
        return this.repository.findByNome(nome)
    }
}
