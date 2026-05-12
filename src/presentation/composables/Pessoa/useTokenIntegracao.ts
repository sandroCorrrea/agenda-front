import { inject, ref } from "vue";
import axios from "axios";
import { GerarTokenIntegracaoUseCase } from "@/application/use-cases/Auth/GerarTokenIntegracaoUseCase";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useTokenIntegracao() {
    const repositorio = inject<IAuthRepository | null>("IAuthRepository", null);
    if (!repositorio) throw new Error("IAuthRepository not provided");

    const casoUso = new GerarTokenIntegracaoUseCase(repositorio);

    const carregando = ref(false);
    const token = ref<string | null>(null);
    const tokenType = ref<string>("Bearer");
    const erro = ref<string | null>(null);
    const copiado = ref(false);

    async function gerarToken() {
        carregando.value = true;
        erro.value = null;
        copiado.value = false;
        try {
            const resposta = await casoUso.execute();
            token.value = resposta.token;
            tokenType.value = resposta.token_type || "Bearer";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const dados = e.response?.data as ErroResponseDTO;
                if (e.response?.status === 403) {
                    erro.value =
                        dados?.message ??
                        "Voce nao tem permissao para gerar token de integracao.";
                } else {
                    erro.value =
                        dados?.message ?? "Nao foi possivel gerar o token.";
                }
            } else {
                erro.value = "Nao foi possivel gerar o token.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function copiarTokenCompleto() {
        if (!token.value) return;
        const valor = `${tokenType.value} ${token.value}`;
        await navigator.clipboard.writeText(valor);
        copiado.value = true;
    }

    return {
        gerarToken,
        copiarTokenCompleto,
        carregando,
        token,
        tokenType,
        erro,
        copiado
    };
}
