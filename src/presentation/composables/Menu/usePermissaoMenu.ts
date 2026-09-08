import { computed } from "vue";
import { useMenuStore } from "@/presentation/store/useMenuStore";

/** Helpers de permissão por código de menu (ex.: `admin.servicos`). */
export function usePermissaoMenu(codigo: string) {
    const menu = useMenuStore();

    const podeVisualizar = computed(() => menu.podeVisualizarCodigo(codigo));
    const podeInserir = computed(() => menu.podeInserirCodigo(codigo));
    const podeAtualizar = computed(() => menu.podeAtualizarCodigo(codigo));
    const podeExcluir = computed(() => menu.podeExcluirCodigo(codigo));

    return {
        podeVisualizar,
        podeInserir,
        podeAtualizar,
        podeExcluir
    };
}
