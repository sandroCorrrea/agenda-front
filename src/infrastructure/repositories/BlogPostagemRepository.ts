import type { AxiosInstance } from "axios";
import { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { PaginatedResult } from "@/domain/types/PaginatedResult";

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
                item?.arquivo
            )
        );

        const total = data.total ?? 0;
        const currentPage = data.pagina ?? 1;
        const perPage = data.porPagina ?? per_page;

        return {
            data: mapped,
            total: data.total,
            pagina: data.pagina ?? 1,
            porPagina: data.porPagina,
            lastPage: Math.ceil(data.total / data.porPagina)
        }
    }
}
