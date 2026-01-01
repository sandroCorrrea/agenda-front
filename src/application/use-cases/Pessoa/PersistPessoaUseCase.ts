import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { Pessoa } from "@/domain/entities/Pessoa";

export class PersistPessoaUseCase {
    constructor(
        private repository: IPessoaRepository
    ) {}

    async execute(input: {
        id: number;
        nome: string;
        cpf: string;
        dataNascimento: Date;
        email: string;
        celular: string;
    }){
        const entity = new Pessoa(input.id, input.nome, input.cpf, input.dataNascimento, input.email, input.celular);
        return this.repository.persist(entity);
    }
}
