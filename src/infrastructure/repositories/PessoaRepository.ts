import type { AxiosInstance } from "axios";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { Pessoa } from "@/domain/entities/Pessoa";

export class PessoaRepository implements IPessoaRepository {
    constructor(
        private api: AxiosInstance
    ) {}
    async persist(pessoa: Pessoa): Promise<Pessoa> {
        const res = await this.api.post('/pessoa', {
            nome: pessoa.nome,
            cpf: pessoa.cpf,
            dataNascimento: pessoa.dataNascimento,
            email: pessoa.email,
            celular: pessoa.celular
        })
        const data = res.data;
        return new Pessoa(
            data.id,
            data.nome,
            data.cpf,
            new Date(data.dataNascimento),
            data.email,
            data.celular
        )
    }
}
