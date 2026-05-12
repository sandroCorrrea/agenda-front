import type { AxiosInstance } from "axios";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";
import { Aviso } from "@/domain/entities/Aviso";
import type { AvisoPostRequestDTO } from "@/application/dto/Aviso/AvisoPostRequestDTO";
import type { AvisoUpdateRequestDTO } from "@/application/dto/Aviso/AvisoUpdateRequestDTO";
import { AvisoUsuarioDTO } from "@/application/dto/Aviso/AvisoUsuarioDTO";
import { AvisoListagemDTO } from "@/application/dto/Aviso/AvisoListagemDTO";
import { AvisoListagemResponseDTO } from "@/application/dto/Aviso/AvisoListagemResponseDTO";

type AvisoUsuarioApiJson = {
    id: number;
    pessoa_id?: number;
    tipo_usuario?: string;
    status?: string;
    img?: string | null;
};

type AvisoApiJson = {
    id: number;
    nome: string;
    descricao: string;
    expiracao: string;
    usuario?: AvisoUsuarioApiJson | null;
};

type AvisoListagemApiJson = {
    aviso: AvisoApiJson[];
    total: number;
    pagina: number;
    porPagina: number;
};

export class AvisoRepository implements IAvisoRepository {
    constructor(
        private api: AxiosInstance
    ) {}

    async findAll(page: number, per_page: number, nome?: string): Promise<Array<Aviso>>
    {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('per_page', String(per_page));
        if (nome && nome.trim().length > 0) params.set('nome', nome);

        const resp = await this.api.get(`/aviso?${params.toString()}`);
        const data = resp.data;
        const items = Array.isArray(data) ? data : (data.aviso ?? data.data ?? []);
        return items.map((item: any) => new Aviso(
            item.id,
            item.nome,
            item.descricao,
            item.expiracao ? (new Date(item.expiracao) as any) : (undefined as any)
        ));
    }

    async create(dto: AvisoPostRequestDTO): Promise<AvisoListagemDTO> {
        const resp = await this.api.post<AvisoApiJson>("/aviso", {
            nome: dto.nome,
            descricao: dto.descricao,
            usuario_id: dto.usuario_id
        });
        return this.mapAviso(resp.data);
    }

    async findById(id: number): Promise<AvisoListagemDTO> {
        const resp = await this.api.get<AvisoApiJson>(`/aviso/${id}`);
        return this.mapAviso(resp.data);
    }

    async update(id: number, dto: AvisoUpdateRequestDTO): Promise<AvisoListagemDTO> {
        const resp = await this.api.put<AvisoApiJson>(`/aviso/${id}`, {
            nome: dto.nome,
            descricao: dto.descricao,
            usuario_id: dto.usuario_id
        });
        return this.mapAviso(resp.data);
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(`/aviso/${id}`);
    }

    async listPaginated(params?: {
        page?: number;
        per_page?: number;
        usuario_id?: number;
    }): Promise<AvisoListagemResponseDTO> {
        const resp = await this.api.get<AvisoListagemApiJson>("/aviso", {
            params: {
                page: params?.page,
                per_page: params?.per_page,
                usuario_id: params?.usuario_id
            }
        });
        return new AvisoListagemResponseDTO(
            (resp.data.aviso ?? []).map((item) => this.mapAviso(item)),
            Number(resp.data.total ?? 0),
            Number(resp.data.pagina ?? 1),
            Number(resp.data.porPagina ?? 10)
        );
    }

    async downloadPdf(id: number): Promise<Blob> {
        const token = import.meta.env.VITE_TOKEN_API_AVISO;
        const response = await this.api.get(`/aviso/${id}/pdf`, {
            headers: {
                'X-AVISO-API-KEY': token
            },
            responseType: 'blob'
        });
        return response.data;
    }

    private mapAviso(item: AvisoApiJson): AvisoListagemDTO {
        const usuario = item.usuario
            ? new AvisoUsuarioDTO(
                  item.usuario.id,
                  Number(item.usuario.pessoa_id ?? 0),
                  String(item.usuario.tipo_usuario ?? ""),
                  String(item.usuario.status ?? ""),
                  item.usuario.img ?? null
              )
            : null;
        return new AvisoListagemDTO(
            item.id,
            item.nome,
            item.descricao,
            item.expiracao,
            usuario
        );
    }
}
