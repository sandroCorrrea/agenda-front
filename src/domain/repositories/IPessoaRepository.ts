import type { Pessoa } from "../entities/Pessoa";

export interface IPessoaRepository {
    persist(pessoa: Pessoa): Promise<Pessoa>;
}