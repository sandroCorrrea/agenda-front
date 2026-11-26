import type { RouteLocationRaw } from "vue-router";

type OpcaoMenu = {
    rota_nome: string;
    rota_nome_cadastro?: string | null;
    rota_nome_editar?: string | null;
};

/** Telas filhas sem código próprio usam a opção pai no guard e no item ativo. */
const ROTAS_SOB_OPCAO: Record<string, string> = {
    AdministradorCaspHistorico: "AdministradorCaspRemessa"
};

/** A API ainda pode devolver esta rota até o menu ser atualizado no servidor. */
const ROTAS_FORA_DO_MENU = new Set(["AdministradorCaspRelatorios"]);

export function opcaoForaDoMenu(rotaNome: string | null | undefined): boolean {
    return Boolean(rotaNome && ROTAS_FORA_DO_MENU.has(rotaNome));
}

/** O menu da API ainda pode dizer Histórico. Na tela essa entrada envia a remessa. */
export function rotuloOpcaoMenu(opcao: { rota_nome: string; label: string }): string {
    if (opcao.rota_nome === "AdministradorCaspHistorico") return "Enviar Remessa";
    return opcao.label;
}

export function rotaMenuDaTela(rotaAtual: string | null | undefined): string {
    if (!rotaAtual) return "";
    return ROTAS_SOB_OPCAO[rotaAtual] ?? rotaAtual;
}

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

    const pai = rotaMenuDaTela(rotaAtual);
    if (pai !== rotaAtual && pai === opcao.rota_nome) return true;

    return (
        rotaAtual === opcao.rota_nome ||
        rotaAtual === opcao.rota_nome_cadastro ||
        rotaAtual === opcao.rota_nome_editar
    );
}
