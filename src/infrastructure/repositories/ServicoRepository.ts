import type { AxiosInstance } from "axios";
import type { ServicoPostRequestDTO } from "@/application/dto/Servico/ServicoPostRequestDTO";
import type { ServicoUpdateRequestDTO } from "@/application/dto/Servico/ServicoUpdateRequestDTO";
import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import { Servico } from "@/domain/entities/Servico";
import type { PaginatedResult } from "@/domain/types/PaginatedResult";

export class ServicoRepository implements IServicoRepository {
    constructor(private api: AxiosInstance) {}

    async findAll(page: number, per_page: number): Promise<Array<Servico>> {
        const r = await this.listPaginated(page, per_page);
        return r.data;
    }

    async listPaginated(
        page: number,
        per_page: number,
        nome?: string
    ): Promise<PaginatedResult<Servico>> {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("per_page", String(per_page));
        if (nome && nome.trim().length > 0) params.set("nome", nome.trim());

        const res = await this.api.get(`/servico?${params.toString()}`);
        const data = res.data;
        const items = (data.servico ?? []).map((item: any) => this.mapServico(item));
        const total = Number(data.total ?? 0);
        const pagina = Number(data.pagina ?? page);
        const porPagina = Number(data.porPagina ?? per_page);
        const lastPage = Math.max(1, Math.ceil(total / (porPagina || 1)));

        return {
            data: items,
            total,
            pagina,
            porPagina,
            lastPage
        };
    }

    async findById(id: number): Promise<Servico> {
        const resp = await this.api.get(`/servico/${id}`);
        return this.mapServico(resp.data);
    }

    async create(dto: ServicoPostRequestDTO): Promise<Servico> {
        const body: Record<string, unknown> = {
            nome: dto.nome,
            descricao: dto.descricao
        };
        if (dto.status) body.status = dto.status;
        const resp = await this.api.post("/servico", body);
        return this.mapServico(resp.data);
    }

    async update(id: number, dto: ServicoUpdateRequestDTO): Promise<Servico> {
        const body: Record<string, unknown> = {
            nome: dto.nome,
            descricao: dto.descricao
        };
        if (dto.status) body.status = dto.status;
        const resp = await this.api.put(`/servico/${id}`, body);
        return this.mapServico(resp.data);
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(`/servico/${id}`);
    }

    private mapServico(item: any): Servico {
        return new Servico(
            Number(item.id),
            String(item.nome ?? ""),
            item.descricao != null ? String(item.descricao) : "",
            String(item.status ?? "")
        );
    }
}
