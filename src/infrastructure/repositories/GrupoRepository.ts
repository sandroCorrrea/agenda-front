import type { AxiosInstance } from "axios";
import type {
    IGrupoRepository,
    ListarGruposParams,
    ListarUsuariosElegiveisParams
} from "@/domain/repositories/IGrupoRepository";
import type {
    GrupoDetalheDTO,
    GrupoListagemResponseDTO,
    GrupoMembroDTO,
    GrupoPermissaoDTO,
    GrupoPermissaoSyncItemDTO,
    GrupoUpsertRequestDTO,
    UsuariosElegiveisResponseDTO
} from "@/application/dto/Grupo/GrupoAcessoDTO";

type DataWrapper<T> = { data: T };

export class GrupoRepository implements IGrupoRepository {
    constructor(private api: AxiosInstance) {}

    async listar(params?: ListarGruposParams): Promise<GrupoListagemResponseDTO> {
        const res = await this.api.get<GrupoListagemResponseDTO>("/grupos", {
            params: {
                page: params?.page ?? 1,
                per_page: params?.per_page ?? 15
            }
        });
        return res.data;
    }

    async obter(id: number): Promise<GrupoDetalheDTO> {
        const res = await this.api.get<DataWrapper<GrupoDetalheDTO>>(`/grupos/${id}`);
        return res.data.data;
    }

    async criar(dto: GrupoUpsertRequestDTO): Promise<GrupoDetalheDTO> {
        const res = await this.api.post<DataWrapper<GrupoDetalheDTO>>("/grupos", dto);
        return res.data.data;
    }

    async atualizar(
        id: number,
        dto: GrupoUpsertRequestDTO
    ): Promise<GrupoDetalheDTO> {
        const res = await this.api.put<DataWrapper<GrupoDetalheDTO>>(
            `/grupos/${id}`,
            dto
        );
        return res.data.data;
    }

    async excluir(id: number): Promise<void> {
        await this.api.delete(`/grupos/${id}`);
    }

    async sincronizarPermissoes(
        id: number,
        permissoes: GrupoPermissaoSyncItemDTO[]
    ): Promise<GrupoPermissaoDTO[]> {
        const res = await this.api.put<
            DataWrapper<GrupoPermissaoDTO[]> | GrupoPermissaoDTO[]
        >(`/grupos/${id}/permissoes`, { permissoes });
        const body = res.data;
        if (Array.isArray(body)) return body;
        return body.data ?? [];
    }

    async listarMembros(id: number): Promise<GrupoMembroDTO[]> {
        const res = await this.api.get<
            DataWrapper<GrupoMembroDTO[]> | GrupoMembroDTO[]
        >(`/grupos/${id}/membros`);
        const body = res.data;
        if (Array.isArray(body)) return body;
        return body.data ?? [];
    }

    async adicionarMembros(
        id: number,
        usuarioIds: number[]
    ): Promise<GrupoMembroDTO[]> {
        const res = await this.api.post<DataWrapper<GrupoMembroDTO[]>>(
            `/grupos/${id}/membros`,
            { usuario_ids: usuarioIds }
        );
        return res.data.data ?? [];
    }

    async removerMembro(grupoId: number, usuarioId: number): Promise<void> {
        await this.api.delete(`/grupos/${grupoId}/membros/${usuarioId}`);
    }

    async listarUsuariosElegiveis(
        params?: ListarUsuariosElegiveisParams
    ): Promise<UsuariosElegiveisResponseDTO> {
        const res = await this.api.get<UsuariosElegiveisResponseDTO>(
            "/grupos/usuarios-elegiveis",
            {
                params: {
                    q: params?.q,
                    tipo: params?.tipo ?? "todos",
                    somente_sem_grupo: params?.somente_sem_grupo ?? 1,
                    page: params?.page ?? 1,
                    per_page: params?.per_page ?? 20
                }
            }
        );
        return res.data;
    }
}
