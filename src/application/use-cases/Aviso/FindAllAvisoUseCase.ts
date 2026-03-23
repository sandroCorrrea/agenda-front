import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";

export class FindAllAvisoUseCase {
    constructor(
        private repository: IAvisoRepository
    ) {}

    async execute(
        page: number,
        per_page: number,
        nome?: string
    ) {
        return this.repository.findAll(page, per_page, nome);
    }
}
