import { inject } from "vue";
import type { ISicomRepository } from "@/domain/repositories/ISicomRepository";

export function useSicomRepository(): ISicomRepository {
    const repo = inject<ISicomRepository>("ISicomRepository");
    if (!repo) throw new Error("ISicomRepository not provided");
    return repo;
}
