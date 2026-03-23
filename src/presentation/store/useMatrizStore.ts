import { defineStore } from "pinia";
import { ref } from "vue";
import type { Matriz } from "@/domain/entities/Matriz";
import { FindMatrizUseCase } from "@/application/use-cases/Matriz/FindMatrizUseCase";
import type { IMatrizRepository } from "@/domain/repositories/IMatrizRepository";

export const useMatrizStore = defineStore('matriz', () => {
    const matriz = ref<Matriz | null>(null);
    const loading = ref(false);

    async function load(repository: IMatrizRepository) {
        if (matriz.value) return;

        loading.value = true;

        try {
            const useCase = new FindMatrizUseCase(repository);

            matriz.value = await useCase.execute();
        } finally {
            loading.value = false;
        }
    }

    return {
        matriz,
        loading,
        load
    }
});
