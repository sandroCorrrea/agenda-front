export type MenuDestinoSugeridoDTO = {
    rota_nome: string;
    path: string;
};

export type MenuGrupoResumoDTO = {
    id: number;
    nome: string;
};

export type MenuOpcaoSessaoDTO = {
    id: number;
    codigo: string;
    label: string;
    rota_nome: string;
    path: string;
    rota_nome_cadastro: string | null;
    path_cadastro: string | null;
    rota_nome_editar: string | null;
    path_editar: string | null;
    ordem: number;
    pode_visualizar: boolean;
    pode_inserir: boolean;
    pode_atualizar: boolean;
    pode_excluir: boolean;
};

export type MenuModuloSessaoDTO = {
    codigo: string;
    label: string | null;
    ordem: number;
    escopo: "publico" | "cliente" | "admin";
    opcoes: MenuOpcaoSessaoDTO[];
};

export type MenuSessaoDTO = {
    destino_sugerido: MenuDestinoSugeridoDTO | null;
    grupo: MenuGrupoResumoDTO | null;
    eh_master: boolean;
    modulos: MenuModuloSessaoDTO[];
};

export type MenuOpcaoCatalogoDTO = {
    id: number;
    codigo: string;
    label: string;
    rota_nome: string;
    path: string;
    escopo: "publico" | "cliente" | "admin";
    atribuivel: boolean;
    suporta_inserir: boolean;
    suporta_atualizar: boolean;
    suporta_excluir: boolean;
    ordem: number;
};

export type MenuModuloCatalogoDTO = {
    id: number;
    codigo: string;
    label: string | null;
    ordem: number;
    escopo: "publico" | "cliente" | "admin";
    opcoes: MenuOpcaoCatalogoDTO[];
};
