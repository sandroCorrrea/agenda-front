import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { EmpresaVinculoDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";

export const useVinculosPendentesStore = defineStore("vinculosPendentes", () => {
    const totalPendentes = ref(0);
    const preview = ref<EmpresaVinculoDTO[]>([]);
    const carregando = ref(false);

    const temPendentes = computed(() => totalPendentes.value > 0);

    function definir(total: number, itens: EmpresaVinculoDTO[]) {
        totalPendentes.value = total;
        preview.value = itens;
    }

    function setCarregando(valor: boolean) {
        carregando.value = valor;
    }

    return {
        totalPendentes,
        preview,
        carregando,
        temPendentes,
        definir,
        setCarregando
    };
});
