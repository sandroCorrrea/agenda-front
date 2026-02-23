import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";

export class FindAllServicoUseCase {
    constructor(
        private repository: IServicoRepository
    ) {}

    async execute(
        page: number,
        per_page: number
    ){
        return this.repository.findAll(page, per_page);
    }
}
