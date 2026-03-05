import type { NewsletterPostResponseDTO } from "@/application/dto/Newsletter/NewsletterPostResponseDTO";
import type { Newsletter } from "@/domain/entities/Newsletter";
import type { INewsletterRepository } from "@/domain/repositories/INewsletterRepository";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { inject, ref } from "vue";
import axios from "axios";

export function usePersistNewsletter() {
    const repoInject = inject<INewsletterRepository | null>('INewsletterRepository');

    if (!repoInject) {
        throw new Error('INewsletterRepository not found');
    }

    const repo: INewsletterRepository = repoInject;

    const loading = ref(false);
    const error = ref<string | null>(null);
    const responseNewsletter = ref<NewsletterPostResponseDTO | null>(null);

    async function persistNewsletter(newsletter: Newsletter) {
        loading.value = true;
        error.value = null;
        responseNewsletter.value = null;

        try {
            const result = await repo.persist(newsletter);
            responseNewsletter.value = result;
            return result;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data as ErroResponseDTO;
                error.value =
                    data?.errors?.email?.[0] ||
                    data?.message ||
                    'Erro ao cadastrar newsletter';

            } else {
                error.value = err?.message ?? 'Erro inesperado';
            }
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        error,
        responseNewsletter,
        persistNewsletter
    };
}