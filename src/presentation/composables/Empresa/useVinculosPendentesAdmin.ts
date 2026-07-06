import { inject } from "vue";
import type { EmpresaVinculoDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import { ListarVinculosAdminUseCase } from "@/application/use-cases/EmpresaVinculo/ListarVinculosAdminUseCase";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";
import { useVinculosPendentesStore } from "@/presentation/store/useVinculosPendentesStore";

const PREVIEW_MAX = 3;
let requestSeq = 0;

export function useVinculosPendentesAdmin() {
    const store = useVinculosPendentesStore();

    async function atualizarPendentes() {
        const repo = inject<IEmpresaVinculoRepository>("IEmpresaVinculoRepository");
        if (!repo) return;

        const seq = ++requestSeq;
        store.setCarregando(true);

        try {
            const caso = new ListarVinculosAdminUseCase(repo);
            const resp = await caso.execute({ page: 1, status: "pendente" });
            if (seq !== requestSeq) return;

            store.definir(
                resp.total,
                resp.vinculos.slice(0, PREVIEW_MAX) as EmpresaVinculoDTO[]
            );
        } catch {
            if (seq !== requestSeq) return;
            store.definir(0, []);
        } finally {
            if (seq === requestSeq) {
                store.setCarregando(false);
            }
        }
    }

    return {
        store,
        atualizarPendentes
    };
}
