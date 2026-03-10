import { Matriz } from "@/domain/entities/Matriz";
import type { IMatrizRepository } from "@/domain/repositories/IMatrizRepository";
import type { AxiosInstance } from "axios";

export class MatrizRepository implements IMatrizRepository
{
    constructor(
        private api: AxiosInstance
    ) {}

    async find(): Promise<Matriz> {
        const resp = await this.api.get('/matriz');

        const data = resp.data;

        return new Matriz(
            data.id,
            data.nome,
            data.apelido,
            data.cnpj,
            data.cep,
            data.rua,
            data.bairro,
            data.cidade,
            data.numero,
            data.uf,
            data.telefone,
            data.celular,
            data.email,
            data.inscricao_estadual,
            data.tipo_empresa,
            data.data_situacao_uf,
            data.situacao_cnpj,
            data.situacao_ie,
            data.cnae
        );
    }
}
