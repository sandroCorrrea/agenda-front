import type { Servico } from "../entities/Servico";

export interface IServicoRepository {
    findAll(page: number, per_page: number): Promise<Array<Servico>>;
}
