import { inject } from "vue";
import type { IReceitaOrcamentariaRepository } from "@/domain/repositories/IReceitaOrcamentariaRepository";

export function useReceitaOrcamentariaRepository(): IReceitaOrcamentariaRepository {
    const repo = inject<IReceitaOrcamentariaRepository>("IReceitaOrcamentariaRepository");
    if (!repo) throw new Error("IReceitaOrcamentariaRepository not provided");
    return repo;
}
