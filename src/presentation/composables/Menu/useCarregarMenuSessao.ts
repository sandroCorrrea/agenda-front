import { inject } from "vue";
import type { IAuthMenuRepository } from "@/domain/repositories/IAuthMenuRepository";
import { ObterMenuSessaoUseCase } from "@/application/use-cases/Menu/ObterMenuSessaoUseCase";
import { useMenuStore } from "@/presentation/store/useMenuStore";

export function useCarregarMenuSessao() {
    const repo = inject<IAuthMenuRepository | null>("IAuthMenuRepository", null);
    if (!repo) throw new Error("IAuthMenuRepository not provided");

    const casoUso = new ObterMenuSessaoUseCase(repo);
    const menuStore = useMenuStore();

    async function carregarMenuSessao(): Promise<void> {
        menuStore.carregando = true;
        try {
            const menu = await casoUso.execute();
            menuStore.definirMenu(menu);
        } finally {
            menuStore.carregando = false;
        }
    }

    return { carregarMenuSessao, menuStore };
}
