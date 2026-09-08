import type { IAuthMenuRepository } from "@/domain/repositories/IAuthMenuRepository";

export class ObterMenuSessaoUseCase {
    constructor(private repository: IAuthMenuRepository) {}

    async execute() {
        return this.repository.obterMenuSessao();
    }
}
