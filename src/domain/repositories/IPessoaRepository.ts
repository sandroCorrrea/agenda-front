import type { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";
import type { Pessoa } from "../entities/Pessoa";

export interface IPessoaRepository {
    persist(pessoa: PessoaPostRequestDTO): Promise<Pessoa>;
}
