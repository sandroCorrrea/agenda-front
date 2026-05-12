import type { AxiosInstance } from "axios";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import { BlogCategoria } from "@/domain/entities/BlogCategoria";
import { BlogCategoriaQtdPostagemGetResponse } from "@/application/dto/BlogCategoria/BlogCategoriaQtdPostagemGetResponse";
import type { BlogCategoriaPostRequestDTO } from "@/application/dto/BlogCategoria/BlogCategoriaPostRequestDTO";
import { BlogCategoriaListagemResponseDTO } from "@/application/dto/BlogCategoria/BlogCategoriaListagemResponseDTO";
import type { BlogCategoriaUpdateRequestDTO } from "@/application/dto/BlogCategoria/BlogCategoriaUpdateRequestDTO";

export class BlogCategoriaRepository implements IBlogCategoriaRepository {
    constructor(
        private api: AxiosInstance
    ) {}

    async create(dto: BlogCategoriaPostRequestDTO): Promise<BlogCategoria> {
        const resp = await this.api.post('/blog/categoria', {
            nome: dto.nome,
            descricao: dto.descricao
        });
        return this.mapCategoria(resp.data);
    }

    async findById(id: number): Promise<BlogCategoria> {
        const resp = await this.api.get(`/blog/categoria/${id}`);
        return this.mapCategoria(resp.data);
    }

    async update(id: number, dto: BlogCategoriaUpdateRequestDTO): Promise<BlogCategoria> {
        const payload: {
            nome: string;
            descricao: string;
            status?: string;
        } = {
            nome: dto.nome,
            descricao: dto.descricao
        };
        if (dto.status) payload.status = dto.status;
        const resp = await this.api.put(`/blog/categoria/${id}`, payload);
        return this.mapCategoria(resp.data);
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(`/blog/categoria/${id}`);
    }

    async findAll(page: number, per_page: number, nome?: string): Promise<Array<BlogCategoria>>
    {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('per_page', String(per_page));
        if (nome && nome.trim().length > 0) params.set('nome', nome);

        const resp = await this.api.get(`/blog/categoria?${params.toString()}`);
        const data = resp.data;
        const items = Array.isArray(data)
            ? data
            : (data.categoria ?? data.blogCategoria ?? data.data ?? []);
        return items.map((item: any) => this.mapCategoria(item));
    }

    async findQtdPostagem(): Promise<Array<BlogCategoriaQtdPostagemGetResponse>>
    {
        const resp = await this.api.get('/blog/categoria/postagem');
        const data = resp.data;
        const items = Array.isArray(data) ? data : (data ?? []);

        return items.map((item: any) => new BlogCategoriaQtdPostagemGetResponse(
            item.id,
            item.nome,
            item.quantidade
        ));
    }

    async listPaginated(params?: {
        page?: number;
        per_page?: number;
    }): Promise<BlogCategoriaListagemResponseDTO> {
        const resp = await this.api.get('/blog/categoria', {
            params: {
                page: params?.page,
                per_page: params?.per_page
            }
        });
        const data = resp.data ?? {};
        const itens = Array.isArray(data.categoria)
            ? data.categoria
            : Array.isArray(data.blogCategoria)
                ? data.blogCategoria
                : [];

        return new BlogCategoriaListagemResponseDTO(
            itens.map((item: any) => this.mapCategoria(item)),
            Number(data.total ?? 0),
            Number(data.pagina ?? params?.page ?? 1),
            Number(data.porPagina ?? params?.per_page ?? 10)
        );
    }

    private mapCategoria(item: any): BlogCategoria {
        return new BlogCategoria(
            Number(item.id),
            String(item.nome ?? ""),
            String(item.descricao ?? ""),
            String(item.status ?? "").toLowerCase() === "ativo" || Boolean(item.ativo)
        );
    }
}
