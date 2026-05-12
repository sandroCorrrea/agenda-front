import type { IUsuarioRepository } from "@/domain/repositories/IUsuarioRepository";
import type { UsuarioSenhaUpdateDTO } from "@/application/dto/Usuario/UsuarioSenhaUpdateDTO";
import type { UsuarioPerfilDTO } from "@/application/dto/Usuario/UsuarioPerfilDTO";

export class AtualizarSenhaUsuarioUseCase {
    constructor(private repository: IUsuarioRepository) {}

    execute(
        usuarioId: number,
        dto: UsuarioSenhaUpdateDTO
    ): Promise<UsuarioPerfilDTO> {
        return this.repository.atualizarSenha(usuarioId, dto);
    }
}
