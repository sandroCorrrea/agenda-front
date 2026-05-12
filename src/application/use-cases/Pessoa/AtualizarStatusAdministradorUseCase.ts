import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";

export class AtualizarStatusAdministradorUseCase {
    constructor(private repository: IPessoaRepository) {}

    execute(
        usuarioId: number,
        status: "ativo" | "inativo" | "bloqueado"
    ): Promise<void> {
        return this.repository.atualizarStatusAdministrador(usuarioId, status);
    }
}
