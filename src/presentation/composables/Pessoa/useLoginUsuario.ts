import { inject, ref } from "vue";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { LoginUsuarioUseCase } from "@/application/use-cases/Auth/LoginUsuarioUseCase";
import { LoginPostRequestDTO } from "@/application/dto/Auth/LoginPostRequestDTO";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useLoginUsuario() {
    const repositorio = inject<IAuthRepository | null>("IAuthRepository", null);
    if (!repositorio) throw new Error("IAuthRepository not provided");

    const casoUso = new LoginUsuarioUseCase(repositorio);
    const authStore = useAuthStore();

    const carregando = ref(false);
    const erro = ref<string | null>(null);

    async function entrar(cpf: string, senha: string) {
        carregando.value = true;
        erro.value = null;
        try {
            const dto = new LoginPostRequestDTO(cpf, senha);
            const resposta = await casoUso.execute(dto);
            authStore.definirSessao(resposta.token, resposta.usuario);
            return resposta;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const dados = err.response?.data as ErroResponseDTO & {
                    errors?: Record<string, string[]>;
                };
                erro.value =
                    dados?.errors?.cpf?.[0] ||
                    dados?.errors?.senha?.[0] ||
                    dados?.message ||
                    "Nao foi possivel entrar. Verifique CPF e senha.";
            } else {
                erro.value =
                    err instanceof Error
                        ? err.message
                        : "Erro inesperado ao entrar.";
            }
            throw err;
        } finally {
            carregando.value = false;
        }
    }

    return {
        entrar,
        carregando,
        erro
    };
}
