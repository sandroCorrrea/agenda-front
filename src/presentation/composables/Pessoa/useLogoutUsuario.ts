import { inject } from "vue";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { LogoutUsuarioUseCase } from "@/application/use-cases/Auth/LogoutUsuarioUseCase";

export function useLogoutUsuario() {
    const repositorio = inject<IAuthRepository | null>("IAuthRepository", null);
    if (!repositorio) throw new Error("IAuthRepository not provided");

    const casoUso = new LogoutUsuarioUseCase(repositorio);

    async function sair(): Promise<void> {
        try {
            await casoUso.execute();
        } catch {
            /* rede ou rota indisponível — sessão local é encerrada mesmo assim */
        }
    }

    return { sair };
}
