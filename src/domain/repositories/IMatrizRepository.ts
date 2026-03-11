import type { Matriz } from "../entities/Matriz";

export interface IMatrizRepository {
    find(): Promise<Matriz>;
}
