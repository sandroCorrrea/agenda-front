import type { AxiosInstance } from "axios";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import { BlogCategoria } from "@/domain/entities/BlogCategoria";
import { BlogCategoriaQtdPostagemGetResponse } from "@/application/dto/BlogCategoria/BlogCategoriaQtdPostagemGetResponse";

export class BlogCategoriaRepository implements IBlogCategoriaRepository {
    constructor(
        private api: AxiosInstance
    ) {}

    async findAll(page: number, per_page: number, nome?: string): Promise<Array<BlogCategoria>>
    {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('per_page', String(per_page));
        if (nome && nome.trim().length > 0) params.set('nome', nome);

        const resp = await this.api.get(`/blog/categoria?${params.toString()}`);
        const data = resp.data;
        const items = Array.isArray(data) ? data : (data.blogCategoria ?? data.data ?? []);
        return items.map((item: any) => new BlogCategoria(
            item.id,
            item.nome,
            item.descricao,
            item.status
        ));
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
}
