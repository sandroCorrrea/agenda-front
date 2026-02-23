import type { AxiosInstance } from "axios";
import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import { Servico } from "@/domain/entities/Servico";

export class ServicoRepository implements IServicoRepository {
    constructor(
        private api: AxiosInstance
    ) {}
    async findAll(page: number, per_page: number): Promise<Array<Servico>> {
        const res = await this.api.get(`/servico?page=${page}&per_page=${per_page}`);
        const data = res.data;
        return data.servico.map((item: any) => new Servico(
            item.id,
            item.nome,
            item.descricao,
            item.status
        ));
    }
}
