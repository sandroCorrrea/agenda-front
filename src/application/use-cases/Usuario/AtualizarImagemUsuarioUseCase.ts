import type { IUsuarioRepository } from "@/domain/repositories/IUsuarioRepository";

export class AtualizarImagemUsuarioUseCase {
    constructor(private repository: IUsuarioRepository) {}

    execute(usuarioId: number, arquivo: File): Promise<string | null> {
        return this.repository.atualizarImagem(usuarioId, arquivo);
    }
}
