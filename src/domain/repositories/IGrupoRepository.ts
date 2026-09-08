import type {
    GrupoDetalheDTO,
    GrupoListagemResponseDTO,
    GrupoMembroDTO,
    GrupoPermissaoDTO,
    GrupoPermissaoSyncItemDTO,
    GrupoUpsertRequestDTO,
    UsuariosElegiveisResponseDTO
} from "@/application/dto/Grupo/GrupoAcessoDTO";

export type ListarGruposParams = {
    page?: number;
    per_page?: number;
};

export type ListarUsuariosElegiveisParams = {
    q?: string;
    tipo?: "cliente" | "prefeitura" | "todos";
    somente_sem_grupo?: 0 | 1;
    page?: number;
    per_page?: number;
};

export interface IGrupoRepository {
    listar(params?: ListarGruposParams): Promise<GrupoListagemResponseDTO>;
    obter(id: number): Promise<GrupoDetalheDTO>;
    criar(dto: GrupoUpsertRequestDTO): Promise<GrupoDetalheDTO>;
    atualizar(id: number, dto: GrupoUpsertRequestDTO): Promise<GrupoDetalheDTO>;
    excluir(id: number): Promise<void>;
    sincronizarPermissoes(
        id: number,
        permissoes: GrupoPermissaoSyncItemDTO[]
    ): Promise<GrupoPermissaoDTO[]>;
    listarMembros(id: number): Promise<GrupoMembroDTO[]>;
    adicionarMembros(id: number, usuarioIds: number[]): Promise<GrupoMembroDTO[]>;
    removerMembro(grupoId: number, usuarioId: number): Promise<void>;
    listarUsuariosElegiveis(
        params?: ListarUsuariosElegiveisParams
    ): Promise<UsuariosElegiveisResponseDTO>;
}
