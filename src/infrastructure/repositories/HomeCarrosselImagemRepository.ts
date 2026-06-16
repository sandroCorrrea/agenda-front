import axios, { type AxiosInstance } from "axios";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";
import { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";
import { HomeCarrosselImagemListagemResponseDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemListagemResponseDTO";
import type { HomeCarrosselImagemPublicDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemPublicDTO";
import type { HomeCarrosselImagemAdminDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemAdminDTO";
import type { HomeCarrosselImagemPostRequestDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemPostRequestDTO";
import type { HomeCarrosselImagemUpdateRequestDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemUpdateRequestDTO";
import { resolvePublicAssetUrl } from "@/shared/utils/mediaUrl";
import { fileToBase64DataUrl } from "@/shared/utils/fileToBase64";

/**
 * Acima deste tamanho o multipart tende a falhar (limites do PHP no servidor
 * — `upload_max_filesize` / `post_max_size` ou regra Laravel `max:5120`).
 * Para esses arquivos, o repositório pula direto para o fluxo JSON + Base64
 * em vez de gastar bandwidth com uma tentativa fadada ao 422.
 */
const LIMITE_MULTIPART_BYTES = 5 * 1024 * 1024;

type PublicListResponse = { data: HomeCarrosselImagemPublicDTO[] };

type AdminListResponse = {
    data: HomeCarrosselImagemAdminDTO[];
    total: number;
    pagina: number;
    porPagina: number;
};

type AdminMutationResponse = {
    message: string;
    data: HomeCarrosselImagemAdminDTO;
};

/** Resposta de GET /admin/home/carrossel/upload-config (diagnóstico PHP/storage). */
export type HomeCarrosselUploadConfigDTO = Record<string, unknown>;

type HomeCarrosselImagemApiMedia = {
    src?: string | null;
    imagem_url?: string | null;
    imagem_path?: string | null;
};

export class HomeCarrosselImagemRepository implements IHomeCarrosselImagemRepository {
    constructor(private readonly api: AxiosInstance) {}

    async listPublic(limit?: number): Promise<HomeCarrosselImagem[]> {
        const resp = await this.api.get<PublicListResponse>("/home/carrossel", {
            params: limit && limit > 0 ? { limit } : undefined
        });
        const items = Array.isArray(resp.data?.data) ? resp.data.data : [];
        return items.map((it) => this.mapPublic(it));
    }

    async listAdmin(params?: {
        page?: number;
        per_page?: number;
        ativo?: boolean | null;
        titulo?: string | null;
    }): Promise<HomeCarrosselImagemListagemResponseDTO> {
        const query: Record<string, string | number | boolean> = {};
        if (params?.page) query.page = params.page;
        if (params?.per_page) query.per_page = params.per_page;
        if (params?.ativo !== undefined && params?.ativo !== null) {
            query.ativo = params.ativo;
        }
        if (params?.titulo && params.titulo.trim().length > 0) {
            query.titulo = params.titulo.trim();
        }

        const resp = await this.api.get<AdminListResponse>(
            "/admin/home/carrossel",
            { params: query }
        );

        const list = Array.isArray(resp.data?.data) ? resp.data.data : [];
        return new HomeCarrosselImagemListagemResponseDTO(
            list.map((it) => this.mapAdmin(it)),
            Number(resp.data?.total ?? 0),
            Number(resp.data?.pagina ?? 1),
            Number(resp.data?.porPagina ?? 10)
        );
    }

    async findById(id: number): Promise<HomeCarrosselImagem> {
        const resp = await this.api.get<HomeCarrosselImagemAdminDTO>(
            `/admin/home/carrossel/${id}`
        );
        return this.mapAdmin(resp.data);
    }

    async create(dto: HomeCarrosselImagemPostRequestDTO): Promise<HomeCarrosselImagem> {
        // Para arquivos acima do limite seguro do multipart, vamos direto ao
        // fluxo JSON + Base64 (evita uma tentativa fadada ao 422 do PHP).
        if (dto.imagem.size > LIMITE_MULTIPART_BYTES) {
            return this.createComBase64(dto);
        }

        try {
            return await this.createComMultipart(dto);
        } catch (err: unknown) {
            if (!this.deveTentarBase64(err)) throw err;
            return this.createComBase64(dto);
        }
    }

    async update(
        id: number,
        dto: HomeCarrosselImagemUpdateRequestDTO
    ): Promise<HomeCarrosselImagem> {
        // Sem troca de imagem: PUT simples em JSON.
        if (!(dto.imagem instanceof File)) {
            return this.updateMetadados(id, dto);
        }

        // Trocando imagem por arquivo grande: vai direto ao Base64.
        if (dto.imagem.size > LIMITE_MULTIPART_BYTES) {
            return this.updateComBase64(id, dto);
        }

        try {
            return await this.updateComMultipart(id, dto);
        } catch (err: unknown) {
            if (!this.deveTentarBase64(err)) throw err;
            return this.updateComBase64(id, dto);
        }
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(`/admin/home/carrossel/${id}`);
    }

    /** Diagnóstico de limites PHP e storage (admin). */
    async obterUploadConfig(): Promise<HomeCarrosselUploadConfigDTO> {
        const resp = await this.api.get<HomeCarrosselUploadConfigDTO>(
            "/admin/home/carrossel/upload-config"
        );
        return resp.data ?? {};
    }

    private async createComMultipart(
        dto: HomeCarrosselImagemPostRequestDTO
    ): Promise<HomeCarrosselImagem> {
        const form = new FormData();
        form.append("titulo", dto.titulo.trim());
        form.append("imagem", dto.imagem, dto.imagem.name || "imagem");
        form.append("ordem", String(dto.ordem ?? 0));
        form.append("ativo", dto.ativo ? "1" : "0");
        form.append("abrir_em_nova_aba", dto.abrirEmNovaAba ? "1" : "0");
        if (dto.altText !== null && dto.altText !== undefined) {
            form.append("alt_text", dto.altText);
        }
        if (dto.linkUrl !== null && dto.linkUrl !== undefined && dto.linkUrl !== "") {
            form.append("link_url", dto.linkUrl);
        }

        const resp = await this.api.post<AdminMutationResponse>(
            "/admin/home/carrossel",
            form
        );
        return this.mapAdmin(resp.data.data);
    }

    private async createComBase64(
        dto: HomeCarrosselImagemPostRequestDTO
    ): Promise<HomeCarrosselImagem> {
        const imagemBase64 = await fileToBase64DataUrl(dto.imagem);
        const body: Record<string, unknown> = {
            titulo: dto.titulo.trim(),
            imagem_base64: imagemBase64,
            ordem: dto.ordem ?? 0,
            ativo: dto.ativo,
            abrir_em_nova_aba: dto.abrirEmNovaAba
        };
        if (dto.altText !== null && dto.altText !== undefined) {
            body.alt_text = dto.altText;
        }
        if (dto.linkUrl !== null && dto.linkUrl !== undefined && dto.linkUrl !== "") {
            body.link_url = dto.linkUrl;
        }

        const resp = await this.api.post<AdminMutationResponse>(
            "/admin/home/carrossel",
            body
        );
        return this.mapAdmin(resp.data.data);
    }

    private async updateComMultipart(
        id: number,
        dto: HomeCarrosselImagemUpdateRequestDTO
    ): Promise<HomeCarrosselImagem> {
        // Troca de arquivo: usar POST /{id} + _method=PUT (multipart)
        const form = new FormData();
        form.append("_method", "PUT");
        form.append("titulo", dto.titulo);
        if (dto.imagem instanceof File) {
            form.append("imagem", dto.imagem, dto.imagem.name || "imagem");
        }
        if (dto.ordem !== undefined) form.append("ordem", String(dto.ordem));
        if (dto.ativo !== undefined) form.append("ativo", dto.ativo ? "1" : "0");
        if (dto.abrirEmNovaAba !== undefined) {
            form.append("abrir_em_nova_aba", dto.abrirEmNovaAba ? "1" : "0");
        }
        if (dto.altText !== undefined) {
            form.append("alt_text", dto.altText ?? "");
        }
        if (dto.linkUrl !== undefined) {
            form.append("link_url", dto.linkUrl ?? "");
        }
        const resp = await this.api.post<AdminMutationResponse>(
            `/admin/home/carrossel/${id}`,
            form
        );
        return this.mapAdmin(resp.data.data);
    }

    private async updateComBase64(
        id: number,
        dto: HomeCarrosselImagemUpdateRequestDTO
    ): Promise<HomeCarrosselImagem> {
        if (!(dto.imagem instanceof File)) {
            return this.updateMetadados(id, dto);
        }

        const imagemBase64 = await fileToBase64DataUrl(dto.imagem);
        const body: Record<string, unknown> = {
            titulo: dto.titulo,
            imagem_base64: imagemBase64
        };
        if (dto.ordem !== undefined) body.ordem = dto.ordem;
        if (dto.ativo !== undefined) body.ativo = dto.ativo;
        if (dto.abrirEmNovaAba !== undefined) body.abrir_em_nova_aba = dto.abrirEmNovaAba;
        if (dto.altText !== undefined) body.alt_text = dto.altText;
        if (dto.linkUrl !== undefined) body.link_url = dto.linkUrl;

        const resp = await this.api.put<AdminMutationResponse>(
            `/admin/home/carrossel/${id}`,
            body
        );
        return this.mapAdmin(resp.data.data);
    }

    private async updateMetadados(
        id: number,
        dto: HomeCarrosselImagemUpdateRequestDTO
    ): Promise<HomeCarrosselImagem> {
        const body: Record<string, unknown> = { titulo: dto.titulo };
        if (dto.ordem !== undefined) body.ordem = dto.ordem;
        if (dto.ativo !== undefined) body.ativo = dto.ativo;
        if (dto.abrirEmNovaAba !== undefined) body.abrir_em_nova_aba = dto.abrirEmNovaAba;
        if (dto.altText !== undefined) body.alt_text = dto.altText;
        if (dto.linkUrl !== undefined) body.link_url = dto.linkUrl;

        const resp = await this.api.put<AdminMutationResponse>(
            `/admin/home/carrossel/${id}`,
            body
        );
        return this.mapAdmin(resp.data.data);
    }

    /**
     * Indica se vale reenviar a imagem em JSON + `imagem_base64` após falha no multipart.
     *
     * Cobre:
     *  - 413 / 500 (limite PHP, bug no handler multipart em produção)
     *  - 422 com mensagens de upload (`uploaded`, `failed to upload`, `max`, etc.)
     */
    private deveTentarBase64(err: unknown): boolean {
        if (!axios.isAxiosError(err)) return false;
        const status = err.response?.status;
        if (status === 413 || status === 500) return true;
        if (status !== 422) return false;

        const data = err.response?.data as
            | { errors?: { imagem?: string[] }; message?: string }
            | undefined;
        const msgs = [
            ...(data?.errors?.imagem ?? []),
            data?.message ?? ""
        ]
            .map((s) => (s ?? "").toLowerCase())
            .join(" | ");

        if (!msgs.trim()) return false;
        return /uploaded|failed to upload|greater than|kilobytes|post[_ ]max[_ ]size|upload[_ ]max[_ ]filesize|server error/.test(
            msgs
        );
    }

    private mapPublic(item: HomeCarrosselImagemPublicDTO): HomeCarrosselImagem {
        const imagemUrl = this.resolveImagemUrl(item);

        return new HomeCarrosselImagem(
            Number(item.id),
            String(item.titulo ?? ""),
            String(item.alt_text ?? item.titulo ?? ""),
            imagemUrl,
            imagemUrl,
            Number(item.ordem ?? 0),
            Boolean(item.ativo ?? true),
            item.link_url ?? null,
            Boolean(item.abrir_em_nova_aba ?? false)
        );
    }

    private mapAdmin(item: HomeCarrosselImagemAdminDTO): HomeCarrosselImagem {
        const imagemUrl = this.resolveImagemUrl(item);

        return new HomeCarrosselImagem(
            Number(item.id),
            String(item.titulo ?? ""),
            String(item.alt_text ?? item.titulo ?? ""),
            imagemUrl,
            imagemUrl,
            Number(item.ordem ?? 0),
            Boolean(item.ativo ?? false),
            item.link_url ?? null,
            Boolean(item.abrir_em_nova_aba ?? false),
            item.imagem_path ?? null,
            item.created_at ?? null,
            item.updated_at ?? null
        );
    }

    /**
     * Monta a URL final da imagem usando o storage base do front
     * (`VITE_STORAGE_BASE_URL`).
     *
     * Estratégia:
     * 1. Prioriza `imagem_path` (caminho relativo do storage), que é o caminho
     *    canônico e nunca contém o host quebrado.
     * 2. Se vier apenas uma URL absoluta (ex.: `http://localhost/storage/...`)
     *    quando o `APP_URL` do backend está apontando para um host diferente
     *    do que serve o storage de verdade, extrai o trecho após `/storage/`
     *    e reconstrói a URL usando o storage base do front.
     * 3. Caminhos relativos são resolvidos diretamente por `resolvePublicAssetUrl`.
     */
    private resolveImagemUrl(item: HomeCarrosselImagemApiMedia): string {
        const candidatos = [item.imagem_path, item.src, item.imagem_url];

        for (const candidato of candidatos) {
            const raw = (candidato ?? "").trim();
            if (!raw) continue;

            if (/^https?:\/\//i.test(raw)) {
                const matchStorage = raw.match(/\/storage\/(.+)$/i);
                if (matchStorage) {
                    const resolvido = resolvePublicAssetUrl(matchStorage[1]);
                    if (resolvido) return resolvido;
                }
                return raw;
            }

            const resolvido = resolvePublicAssetUrl(raw);
            if (resolvido) return resolvido;
        }

        return "";
    }
}
