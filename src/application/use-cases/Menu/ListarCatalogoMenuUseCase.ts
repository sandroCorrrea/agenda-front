import type { IMenuRepository } from "@/domain/repositories/IMenuRepository";

export class ListarCatalogoMenuUseCase {
    constructor(private repository: IMenuRepository) {}

    async execute(atribuivel?: boolean) {
        return this.repository.listarCatalogo(atribuivel);
    }
}
