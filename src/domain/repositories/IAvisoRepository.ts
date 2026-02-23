import type { Aviso } from "../entities/Aviso";

export interface IAvisoRepository {
    findAll(page: number, per_page: number, nome?: string): Promise<Array<Aviso>>;
}