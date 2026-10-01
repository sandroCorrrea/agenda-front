import type { RouteLocationRaw } from "vue-router";

type OpcaoMenu = {
    rota_nome: string;
    rota_nome_cadastro?: string | null;
    rota_nome_editar?: string | null;
};

/**
 * O item Resultados do menu usa uma rota com :id.
 * Sem uma pesquisa escolhida, a entrada é a lista de pesquisas.
 */
export function destinoOpcaoMenu(opcao: OpcaoMenu): RouteLocationRaw {
    if (opcao.rota_nome === "AdministradorPoliticaResultados") {
        return { name: "AdministradorPoliticaPesquisas", query: { ver: "resultados" } };
    }
    return { name: opcao.rota_nome };
}

/** Só a opção da rota atual fica marcada. Pesquisa e Resultados não acendem juntas. */
export function opcaoMenuAtiva(opcao: OpcaoMenu, rotaAtual: string | null, verResultados = false): boolean {
    if (!rotaAtual) return false;

    if (opcao.rota_nome === "AdministradorPoliticaResultados") {
        return (
            rotaAtual === "AdministradorPoliticaResultados" ||
            (rotaAtual === "AdministradorPoliticaPesquisas" && verResultados)
        );
    }

    if (opcao.rota_nome === "AdministradorPoliticaPesquisas" && verResultados && rotaAtual === "AdministradorPoliticaPesquisas") {
        return false;
    }

    return (
        rotaAtual === opcao.rota_nome ||
        rotaAtual === opcao.rota_nome_cadastro ||
        rotaAtual === opcao.rota_nome_editar
    );
}
