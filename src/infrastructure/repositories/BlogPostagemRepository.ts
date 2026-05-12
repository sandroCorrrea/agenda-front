import type { AxiosInstance } from "axios";
import { BlogPostagem, type BlogPostagemUsuarioResumo } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { PaginatedResult } from "@/domain/types/PaginatedResult";
import { BlogPostagemTagGetResponse } from "@/application/dto/BlogPostagem/BlogPostagemTagGetResponse";
import type { BlogPostagemPostRequestDTO } from "@/application/dto/BlogPostagem/BlogPostagemPostRequestDTO";
import type { BlogPostagemUpdateRequestDTO } from "@/application/dto/BlogPostagem/BlogPostagemUpdateRequestDTO";

export class BlogPostagemRepository implements IBlogPostagemRepository {
    constructor(private api: AxiosInstance) {}

    async create(dto: BlogPostagemPostRequestDTO): Promise<BlogPostagem> {
        const form = new FormData();
        form.append("nome", dto.nome);
        form.append("descricao", dto.descricao);
        form.append("categoria_id", String(dto.categoria_id));
        form.append("usuario_id", String(dto.usuario_id));
        if (dto.imagem) form.append("imagem", dto.imagem);
        if (dto.arquivo) form.append("arquivo", dto.arquivo);

        const resp = await this.api.post("/blog/postagem", form);
        return this.mapPostagem(resp.data);
    }

    async update(id: number, dto: BlogPostagemUpdateRequestDTO): Promise<BlogPostagem> {
        const form = new FormData();
        form.append("nome", dto.nome);
        form.append("descricao", dto.descricao);
        form.append("categoria_id", String(dto.categoria_id));
        form.append("usuario_id", String(dto.usuario_id));
        if (dto.status) form.append("status", dto.status);
        if (dto.imagem) form.append("imagem", dto.imagem);
        if (dto.arquivo) form.append("arquivo", dto.arquivo);

        const resp = await this.api.put(`/blog/postagem/${id}`, form);
        return this.mapPostagem(resp.data);
    }

    async findAll(
        page: number,
        per_page: number,
        nome?: string
    ): Promise<PaginatedResult<BlogPostagem>> {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("per_page", String(per_page));
        if (nome && nome.trim().length > 0) params.set("nome", nome);

        const resp = await this.api.get(`/blog/postagem?${params.toString()}`);
        const data = resp.data;
        const items = data.blogPostagem ?? [];
        const mapped = items.map((item: any) => this.mapPostagem(item));
        return {
            data: mapped,
            total: data.total,
            pagina: data.pagina ?? 1,
            porPagina: data.porPagina,
            lastPage: Math.ceil(data.total / data.porPagina)
        };
    }

    async findTag(): Promise<Array<BlogPostagemTagGetResponse>> {
        const resp = await this.api.get("/blog/postagem/tag");
        const data = resp.data;
        const items = data ?? [];
        return items.map((item: any) => new BlogPostagemTagGetResponse(item.nome));
    }

    async findById(id: number): Promise<BlogPostagem> {
        const resp = await this.api.get(`/blog/postagem/${id}`);
        return this.mapPostagem(resp.data);
    }

    async findByCategoriaId(id: number): Promise<Array<BlogPostagem>> {
        const resp = await this.api.get(`/blog/postagem/categoria/${id}`);
        const items = resp.data ?? [];
        return items.map((item: any) => this.mapPostagem(item));
    }

    async findByNome(nome: string): Promise<Array<BlogPostagem>> {
        const resp = await this.api.get(`/blog/postagem/slug?nome=${nome}`);
        const items = resp.data ?? [];
        return items.map((item: any) => this.mapPostagem(item));
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(`/blog/postagem/${id}`);
    }

    private mapUsuarioBlog(u: any): BlogPostagemUsuarioResumo | null {
        if (!u || u.id == null) return null;
        const id = typeof u.id === "number" ? u.id : Number(u.id);
        if (Number.isNaN(id)) return null;

        const rawP = u.pessoa;
        const pessoa =
            rawP && rawP.id != null
                ? {
                      id: Number(rawP.id),
                      nome: rawP.nome != null ? String(rawP.nome) : null,
                      cpf: rawP.cpf != null ? String(rawP.cpf) : null,
                      data_nascimento:
                          rawP.data_nascimento != null ? String(rawP.data_nascimento) : null,
                      email: rawP.email != null ? String(rawP.email) : null,
                      celular: rawP.celular != null ? String(rawP.celular) : null
                  }
                : null;

        return {
            id,
            pessoa_id: u.pessoa_id,
            tipo_usuario: u.tipo_usuario,
            status: u.status,
            img: u.img ?? null,
            pessoa
        };
    }

    private mapPostagem(item: any): BlogPostagem {
        return new BlogPostagem(
            Number(item.id),
            String(item.nome ?? ""),
            String(item.descricao ?? ""),
            item.categoria,
            String(item.status ?? ""),
            item?.imagem ?? null,
            item?.arquivo ?? null,
            item?.dataCriacao ? new Date(item.dataCriacao) : null,
            item?.dataAlteracao ? new Date(item.dataAlteracao) : null,
            this.mapUsuarioBlog(item?.usuario)
        );
    }
}
