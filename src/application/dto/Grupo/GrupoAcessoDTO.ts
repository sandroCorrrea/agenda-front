export type GrupoEscopo = "cliente" | "admin" | null;

export type GrupoListagemItemDTO = {
    id: number;
    nome: string;
    descricao: string | null;
    ativo: boolean;
    escopo?: GrupoEscopo;
    total_membros: number;
    total_permissoes: number;
    created_at: string;
    updated_at: string;
};

export type GrupoPaginacaoMetaDTO = {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
};

export type GrupoListagemResponseDTO = {
    data: GrupoListagemItemDTO[];
    meta: GrupoPaginacaoMetaDTO;
};

export type GrupoMembroDTO = {
    usuario_id: number;
    pessoa_id: number;
    nome: string;
    cpf?: string;
    email?: string;
    tipo_usuario: string;
    perfil_administrador: string | null;
};

export type GrupoPermissaoDTO = {
    menu_opcao_id: number;
    codigo: string;
    label: string;
    escopo: "publico" | "cliente" | "admin";
    pode_visualizar: boolean;
    pode_inserir: boolean;
    pode_atualizar: boolean;
    pode_excluir: boolean;
};

export type GrupoDetalheDTO = {
    id: number;
    nome: string;
    descricao: string | null;
    ativo: boolean;
    escopo?: GrupoEscopo;
    membros: GrupoMembroDTO[];
    permissoes: GrupoPermissaoDTO[];
};

export type GrupoUpsertRequestDTO = {
    nome: string;
    descricao?: string | null;
    ativo: boolean;
};

export type GrupoPermissaoSyncItemDTO = {
    menu_opcao_id: number;
    pode_visualizar: boolean;
    pode_inserir: boolean;
    pode_atualizar: boolean;
    pode_excluir: boolean;
};

export type UsuarioElegivelDTO = {
    usuario_id: number;
    pessoa_id: number;
    nome: string;
    cpf: string;
    email: string;
    tipo_usuario: string;
    perfil_administrador: string | null;
    grupo_id: number | null;
    grupo_nome: string | null;
};

export type UsuariosElegiveisResponseDTO = {
    data: UsuarioElegivelDTO[];
    meta: GrupoPaginacaoMetaDTO;
};
