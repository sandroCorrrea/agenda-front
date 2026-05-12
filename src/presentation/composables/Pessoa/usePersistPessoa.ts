import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { PersistPessoaUseCase } from "@/application/use-cases/Pessoa/PersistPessoaUseCase";
import { LoginUsuarioUseCase } from "@/application/use-cases/Auth/LoginUsuarioUseCase";
import type { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";
import { LoginPostRequestDTO } from "@/application/dto/Auth/LoginPostRequestDTO";
import type { Pessoa } from "@/domain/entities/Pessoa";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { TipoUsuario } from "@/domain/types/TipoUsuario";
import { onlyNumbers } from "@/shared/utils/masks";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function usePersistPessoa() {
    const repo = inject<IPessoaRepository>("IPessoaRepository");
    const authRepo = inject<IAuthRepository>("IAuthRepository");
    if (!repo) throw new Error("IPessoaRepository not provided");
    if (!authRepo) throw new Error("IAuthRepository not provided");

    const router = useRouter();
    const authStore = useAuthStore();
    const useCase = new PersistPessoaUseCase(repo);
    const loginUseCase = new LoginUsuarioUseCase(authRepo);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const pessoaEntity = ref<Pessoa | null>(null);

    async function persit(dto: PessoaPostRequestDTO) {
        loading.value = true;
        error.value = null;
        try {
            pessoaEntity.value = await useCase.execute(dto);

            const cpfLogin = onlyNumbers(dto.cpf);
            const senhaLogin = dto.usuario.senha;
            try {
                const loginRes = await loginUseCase.execute(
                    new LoginPostRequestDTO(cpfLogin, senhaLogin)
                );
                authStore.definirSessao(loginRes.token, loginRes.usuario);
                if (
                    loginRes.usuario.tipo_usuario === TipoUsuario.ADMINISTRADOR
                ) {
                    await router.push({ name: "AdministradorPainel" });
                } else {
                    await router.push({ name: "AreaCliente" });
                }
            } catch {
                /* cadastro ok; login automático falhou — usuário pode entrar manualmente */
            }
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data as ErroResponseDTO;
                error.value = 
                    data?.errors?.mensagem?.[0] ||
                    data?.errors?.email?.[0] ||
                    data?.errors?.nome?.[0] ||
                    data?.errors?.cpf?.[0] ||
                    data?.errors?.data_nascimento?.[0] ||
                    data?.errors?.celular?.[0] ||
                    data?.errors?.['usuario.senha']?.[0] ||
                    data?.errors?.['usuario.senha_confirmation']?.[0] ||
                    data?.errors?.['usuario.tipo_usuario']?.[0] ||
                    data?.errors?.senha?.[0] ||
                    data?.message ||
                    'Erro ao enviar mensagem de contato';

            } else {
                error.value = err?.message || 'Erro ao persistir pessoa';
            }
        } finally {
            loading.value = false;
        }
    };

    return {
        persit,
        loading,
        error,
        pessoaEntity
    };
}
