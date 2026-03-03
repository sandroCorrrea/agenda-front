import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";

export class FindBlogPostagemByIdUseCase {
    constructor(private repository: IBlogPostagemRepository) {}

    async execute(id: number) {
        return this.repository.findById(id);
    }
}
