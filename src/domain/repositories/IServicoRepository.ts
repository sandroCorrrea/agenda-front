import type { ServicoPostRequestDTO } from "@/application/dto/Servico/ServicoPostRequestDTO";
import type { ServicoUpdateRequestDTO } from "@/application/dto/Servico/ServicoUpdateRequestDTO";
import type { Servico } from "../entities/Servico";
import type { PaginatedResult } from "../types/PaginatedResult";

export interface IServicoRepository {
    /** Listagem pública (apenas ativos no backend) — retorna só os itens da página. */
    findAll(page: number, per_page: number): Promise<Array<Servico>>;
    listPaginated(page: number, per_page: number, nome?: string): Promise<PaginatedResult<Servico>>;
    findById(id: number): Promise<Servico>;
    create(dto: ServicoPostRequestDTO): Promise<Servico>;
    update(id: number, dto: ServicoUpdateRequestDTO): Promise<Servico>;
    delete(id: number): Promise<void>;
}
