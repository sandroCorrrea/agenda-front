import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
    MenuModuloSessaoDTO,
    MenuOpcaoSessaoDTO,
    MenuSessaoDTO
} from "@/application/dto/Menu/MenuSessaoDTO";

const chaveMenu = "agenda_auth_menu";

function flatOpcoes(modulos: MenuModuloSessaoDTO[]): MenuOpcaoSessaoDTO[] {
    return modulos.flatMap((m) => m.opcoes ?? []);
}

export const useMenuStore = defineStore("menu", () => {
    const carregado = ref(false);
    const carregando = ref(false);
    const ehMaster = ref(false);
    const grupo = ref<MenuSessaoDTO["grupo"]>(null);
    const destinoSugerido = ref<MenuSessaoDTO["destino_sugerido"]>(null);
    const modulos = ref<MenuModuloSessaoDTO[]>([]);

    const opcoes = computed(() => flatOpcoes(modulos.value));

    const opcoesPorCodigo = computed(() => {
        const map = new Map<string, MenuOpcaoSessaoDTO>();
        for (const op of opcoes.value) {
            map.set(op.codigo, op);
        }
        return map;
    });

    const opcoesPorRota = computed(() => {
        const map = new Map<string, MenuOpcaoSessaoDTO>();
        for (const op of opcoes.value) {
            if (op.rota_nome) map.set(op.rota_nome, op);
            if (op.rota_nome_cadastro) map.set(op.rota_nome_cadastro, op);
            if (op.rota_nome_editar) map.set(op.rota_nome_editar, op);
        }
        return map;
    });

    const temAlgumaOpcao = computed(() => opcoes.value.length > 0);

    function definirMenu(menu: MenuSessaoDTO) {
        ehMaster.value = Boolean(menu.eh_master);
        grupo.value = menu.grupo ?? null;
        destinoSugerido.value = menu.destino_sugerido ?? null;
        modulos.value = Array.isArray(menu.modulos) ? menu.modulos : [];
        carregado.value = true;
        try {
            localStorage.setItem(chaveMenu, JSON.stringify(menu));
        } catch {
            /* ignore quota */
        }
    }

    function recuperarMenuLocal() {
        const raw = localStorage.getItem(chaveMenu);
        if (!raw) return;
        try {
            definirMenu(JSON.parse(raw) as MenuSessaoDTO);
        } catch {
            localStorage.removeItem(chaveMenu);
        }
    }

    function limparMenu() {
        carregado.value = false;
        carregando.value = false;
        ehMaster.value = false;
        grupo.value = null;
        destinoSugerido.value = null;
        modulos.value = [];
        localStorage.removeItem(chaveMenu);
    }

    function obterPorCodigo(codigo: string): MenuOpcaoSessaoDTO | undefined {
        return opcoesPorCodigo.value.get(codigo);
    }

    function obterPorRota(rotaNome: string): MenuOpcaoSessaoDTO | undefined {
        return opcoesPorRota.value.get(rotaNome);
    }

    function podeVisualizarCodigo(codigo: string): boolean {
        if (ehMaster.value) return true;
        return Boolean(obterPorCodigo(codigo)?.pode_visualizar);
    }

    function podeInserirCodigo(codigo: string): boolean {
        if (ehMaster.value) return true;
        return Boolean(obterPorCodigo(codigo)?.pode_inserir);
    }

    function podeAtualizarCodigo(codigo: string): boolean {
        if (ehMaster.value) return true;
        return Boolean(obterPorCodigo(codigo)?.pode_atualizar);
    }

    function podeExcluirCodigo(codigo: string): boolean {
        if (ehMaster.value) return true;
        return Boolean(obterPorCodigo(codigo)?.pode_excluir);
    }

    function podeAcessarRota(rotaNome: string): boolean {
        if (ehMaster.value) return true;
        const op = obterPorRota(rotaNome);
        if (!op || !op.pode_visualizar) return false;
        if (op.rota_nome_cadastro === rotaNome) return op.pode_inserir;
        if (op.rota_nome_editar === rotaNome) return op.pode_atualizar;
        return true;
    }

    return {
        carregado,
        carregando,
        ehMaster,
        grupo,
        destinoSugerido,
        modulos,
        opcoes,
        temAlgumaOpcao,
        definirMenu,
        recuperarMenuLocal,
        limparMenu,
        obterPorCodigo,
        obterPorRota,
        podeVisualizarCodigo,
        podeInserirCodigo,
        podeAtualizarCodigo,
        podeExcluirCodigo,
        podeAcessarRota
    };
});
