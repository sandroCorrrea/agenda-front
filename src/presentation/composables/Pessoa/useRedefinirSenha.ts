import { inject, ref } from "vue";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { RedefinirSenhaComTokenUseCase } from "@/application/use-cases/Auth/RedefinirSenhaComTokenUseCase";
import { RedefinirSenhaComTokenDTO } from "@/application/dto/Auth/RedefinirSenhaComTokenDTO";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

const MSG_THROTTLE =
    "Muitas tentativas; tente novamente em instantes.";

export function useRedefinirSenha() {
    const repositorio = inject<IAuthRepository | null>("IAuthRepository", null);
    if (!repositorio) throw new Error("IAuthRepository not provided");

    const casoUso = new RedefinirSenhaComTokenUseCase(repositorio);

    const carregando = ref(false);
    const erroGeral = ref<string | null>(null);
    const erroNovaSenha = ref<string | null>(null);
    const erroConfirmacao = ref<string | null>(null);
    const mensagemSucesso = ref<string | null>(null);

    function limparErros() {
        erroGeral.value = null;
        erroNovaSenha.value = null;
        erroConfirmacao.value = null;
    }

    async function redefinir(
        token: string,
        novaSenha: string,
        confirmacao: string
    ) {
        carregando.value = true;
        limparErros();
        mensagemSucesso.value = null;
        try {
            const dto = new RedefinirSenhaComTokenDTO(
                token,
                novaSenha,
                confirmacao
            );
            const resposta = await casoUso.execute(dto);
            mensagemSucesso.value = resposta.message;
            return resposta;
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
                } else if (status === 403) {
                    erroGeral.value =
                        dados?.message ??
                        "Nao e possivel redefinir a senha desta conta no momento.";
                } else if (status === 422) {
                    const errs = dados?.errors;
                    if (errs && typeof errs === "object") {
                        erroNovaSenha.value =
                            errs.nova_senha?.[0] ?? null;
                        erroConfirmacao.value =
                            errs.nova_senha_confirmation?.[0] ?? null;
                        erroGeral.value = errs.token?.[0] ?? null;
                    }
                    if (
                        !erroNovaSenha.value &&
                        !erroConfirmacao.value &&
                        !erroGeral.value
                    ) {
                        erroGeral.value =
                            dados?.message ??
                            "Nao foi possivel redefinir a senha.";
                    }
                } else {
                    erroGeral.value =
                        dados?.message ??
                        "Nao foi possivel redefinir a senha. Tente novamente.";
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

    return {
        redefinir,
        carregando,
        erroGeral,
        erroNovaSenha,
        erroConfirmacao,
        mensagemSucesso
    };
}
