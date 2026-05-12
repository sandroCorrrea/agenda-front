import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import type { PaginatedResult } from "@/domain/types/PaginatedResult";
import type { Servico } from "@/domain/entities/Servico";

export class ListarServicosPaginadoUseCase {
    constructor(private repository: IServicoRepository) {}

    execute(params: {
        page: number;
        per_page: number;
        nome?: string;
    }): Promise<PaginatedResult<Servico>> {
        return this.repository.listPaginated(params.page, params.per_page, params.nome);
    }
}
