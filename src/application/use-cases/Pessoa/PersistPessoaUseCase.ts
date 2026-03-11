import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { Pessoa } from "@/domain/entities/Pessoa";
import type { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";

export class PersistPessoaUseCase {
    constructor(
        private repository: IPessoaRepository
    ) {}

    async execute(dto: PessoaPostRequestDTO): Promise<Pessoa>{
        return this.repository.persist(dto);
    }
}
