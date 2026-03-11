import type { AxiosInstance } from "axios";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { Pessoa } from "@/domain/entities/Pessoa";
import type { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";

export class PessoaRepository implements IPessoaRepository {
    constructor(
        private api: AxiosInstance
    ) {}
    async persist(pessoa: PessoaPostRequestDTO): Promise<Pessoa> {
        const res = await this.api.post<Pessoa>(
            '/pessoa',
            pessoa
        );
        const data = res.data;
        return new Pessoa(
            data.id,
            data.nome,
            data.cpf,
            new Date(data.dataNascimento),
            data.email,
            data.celular,
            data.senha
        )
    }
}

