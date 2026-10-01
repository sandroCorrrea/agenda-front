import { inject } from "vue";
import type { IPoliticaRepository } from "@/domain/repositories/IPoliticaRepository";

export function usePoliticaRepository(): IPoliticaRepository {
    const repo = inject<IPoliticaRepository>("IPoliticaRepository");
    if (!repo) throw new Error("IPoliticaRepository not provided");
    return repo;
}
