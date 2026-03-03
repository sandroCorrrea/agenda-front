import type { AxiosInstance } from "axios";
import { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { PaginatedResult } from "@/domain/types/PaginatedResult";
import { BlogPostagemTagGetResponse } from "@/application/dto/BlogPostagem/BlogPostagemTagGetResponse";

export class BlogPostagemRepository implements IBlogPostagemRepository {
    constructor(
        private api: AxiosInstance
    ) { }

    async findAll(
        page: number,
        per_page: number,
        nome?: string
    ): Promise<PaginatedResult<BlogPostagem>> {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('per_page', String(per_page));
        if (nome && nome.trim().length > 0) params.set('nome', nome);

        const resp = await this.api.get(`/blog/postagem?${params.toString()}`);
        const data = resp.data;
        const items = data.blogPostagem ?? [];
        const mapped = items.map((item: any) =>
            new BlogPostagem(
                item.id,
                item.nome,
                item.descricao,
                item.categoria,
                item.status,
                item?.imagem,
                item?.arquivo,
                new Date(item?.dataCriacao),
                new Date(item?.dataAlteracao)
            )
        );
        return {
            data: mapped,
            total: data.total,
            pagina: data.pagina ?? 1,
            porPagina: data.porPagina,
            lastPage: Math.ceil(data.total / data.porPagina)
        }
    }

    async findTag(): Promise<Array<BlogPostagemTagGetResponse>> {
        const resp = await this.api.get("/blog/postagem/tag");
        const data = resp.data;
        const items = data ?? [];
        const mapped = items.map((item: any) =>
            new BlogPostagemTagGetResponse(item.nome)
        );
        return mapped;
    }

    async findById(id: number): Promise<BlogPostagem> {
        const resp = await this.api.get(`/blog/postagem/${id}`);
        const item = resp.data;
        return new BlogPostagem(
            item.id,
            item.nome,
            item.descricao,
            item.categoria,
            item.status,
            item?.imagem,
            item?.arquivo,
            new Date(item?.dataCriacao),
            new Date(item?.dataAlteracao)
        );
    }
}
