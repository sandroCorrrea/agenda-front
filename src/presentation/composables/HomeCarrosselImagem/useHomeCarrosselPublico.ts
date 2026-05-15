import { computed, inject, onMounted, ref } from "vue";
import axios from "axios";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";
import { ListarHomeCarrosselPublicoUseCase } from "@/application/use-cases/HomeCarrosselImagem/ListarHomeCarrosselPublicoUseCase";
import type { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";

interface Options {
    /** Se true, dispara a chamada em `onMounted`. Default: true. */
    autoCarregar?: boolean;
    /** Limita a quantidade de itens retornados pelo backend (1..100). */
    limite?: number;
}

/**
 * Composable usado pela Home pública para consumir GET /home/carrossel.
 * Não exige autenticação; trata silenciosamente erros para não quebrar a página.
 */
export function useHomeCarrosselPublico(options: Options = {}) {
    const repo = inject<IHomeCarrosselImagemRepository>(
        "IHomeCarrosselImagemRepository"
    );
    if (!repo) throw new Error("IHomeCarrosselImagemRepository not provided");

    const listarCaso = new ListarHomeCarrosselPublicoUseCase(repo);

    const imagens = ref<HomeCarrosselImagem[]>([]);
    const carregando = ref(false);
    const erro = ref<string | null>(null);

    // Para que a animação de marquise não fique vazia com poucos itens, duplica
    // a trilha quando há ao menos um slide retornado pela API.
    const trilha = computed(() =>
        imagens.value.length > 0
            ? [...imagens.value, ...imagens.value]
            : []
    );

    /** Indica se a seção do carrossel deve aparecer na Home. */
    const possuiSlides = computed(() => imagens.value.length > 0);

    async function carregar() {
        carregando.value = true;
        erro.value = null;
        try {
            imagens.value = await listarCaso.execute(options.limite);
        } catch (e: unknown) {
            imagens.value = [];
            if (axios.isAxiosError(e)) {
                erro.value =
                    e.response?.data?.message ??
                    "Não foi possível carregar o carrossel.";
            } else {
                erro.value = "Não foi possível carregar o carrossel.";
            }
        } finally {
            carregando.value = false;
        }
    }

    if (options.autoCarregar !== false) {
        onMounted(() => {
            void carregar();
        });
    }

    return {
        imagens,
        trilha,
        possuiSlides,
        carregando,
        erro,
        carregar
    };
}
