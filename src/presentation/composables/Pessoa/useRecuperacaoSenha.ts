import { inject, ref } from "vue";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { SolicitarRecuperacaoSenhaUseCase } from "@/application/use-cases/Auth/SolicitarRecuperacaoSenhaUseCase";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

const MSG_THROTTLE =
    "Muitas tentativas; tente novamente em instantes.";

export function useRecuperacaoSenha() {
    const repositorio = inject<IAuthRepository | null>("IAuthRepository", null);
    if (!repositorio) throw new Error("IAuthRepository not provided");

    const casoUso = new SolicitarRecuperacaoSenhaUseCase(repositorio);

    const carregando = ref(false);
    const erroGeral = ref<string | null>(null);
    const erroEmail = ref<string | null>(null);
    const mensagemNeutra = ref<string | null>(null);

    function limparMensagens() {
        erroGeral.value = null;
        erroEmail.value = null;
    }

    async function solicitar(email: string) {
        carregando.value = true;
        limparMensagens();
        mensagemNeutra.value = null;
        try {
            const resposta = await casoUso.execute(email.trim());
            mensagemNeutra.value = resposta.message;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const dados = err.response?.data as
                    | (Partial<ErroResponseDTO> & {
                          message?: string;
                          errors?: Record<string, string[]>;
                      })
                    | undefined;
                if (status === 429) {
                    erroGeral.value = MSG_THROTTLE;
                } else if (status === 422) {
                    erroEmail.value =
                        dados?.errors?.email?.[0] ??
                        dados?.message ??
                        "Nao foi possivel processar o pedido.";
                } else {
                    erroGeral.value =
                        dados?.message ??
                        "Nao foi possivel enviar o pedido. Tente novamente.";
                }
            } else {
                erroGeral.value =
                    err instanceof Error
                        ? err.message
                        : "Erro inesperado. Tente novamente.";
            }
            throw err;
        } finally {
            carregando.value = false;
        }
    }

    function redefinirFormulario() {
        mensagemNeutra.value = null;
        limparMensagens();
    }

    return {
        solicitar,
        carregando,
        erroGeral,
        erroEmail,
        mensagemNeutra,
        redefinirFormulario
    };
}
