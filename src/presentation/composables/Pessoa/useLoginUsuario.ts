import { inject, ref } from "vue";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import type { IAuthMenuRepository } from "@/domain/repositories/IAuthMenuRepository";
import { LoginUsuarioUseCase } from "@/application/use-cases/Auth/LoginUsuarioUseCase";
import { ObterMenuSessaoUseCase } from "@/application/use-cases/Menu/ObterMenuSessaoUseCase";
import { LoginPostRequestDTO } from "@/application/dto/Auth/LoginPostRequestDTO";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useMenuStore } from "@/presentation/store/useMenuStore";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useLoginUsuario() {
    const repositorio = inject<IAuthRepository | null>("IAuthRepository", null);
    if (!repositorio) throw new Error("IAuthRepository not provided");

    const menuRepo = inject<IAuthMenuRepository | null>(
        "IAuthMenuRepository",
        null
    );
    if (!menuRepo) throw new Error("IAuthMenuRepository not provided");

    const casoUso = new LoginUsuarioUseCase(repositorio);
    const menuCasoUso = new ObterMenuSessaoUseCase(menuRepo);
    const authStore = useAuthStore();
    const menuStore = useMenuStore();

    const carregando = ref(false);
    const erro = ref<string | null>(null);

    async function entrar(cpf: string, senha: string) {
        carregando.value = true;
        erro.value = null;
        try {
            const dto = new LoginPostRequestDTO(cpf, senha);
            const resposta = await casoUso.execute(dto);
            authStore.definirSessao(resposta.token, resposta.usuario);
            const menu = await menuCasoUso.execute();
            menuStore.definirMenu(menu);
            return { ...resposta, menu };
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
