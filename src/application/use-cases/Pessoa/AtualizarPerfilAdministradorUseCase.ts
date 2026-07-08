import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import type { PerfilAdministrador } from "@/domain/types/PerfilAdministrador";

export class AtualizarPerfilAdministradorUseCase {
    constructor(private repository: IPessoaRepository) {}

    execute(usuarioId: number, perfil: PerfilAdministrador): Promise<void> {
        return this.repository.atualizarPerfilAdministrador(usuarioId, perfil);
    }
}
