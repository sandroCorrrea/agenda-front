import type { UsuarioSenhaUpdateDTO } from "@/application/dto/Usuario/UsuarioSenhaUpdateDTO";
import type { UsuarioPerfilDTO } from "@/application/dto/Usuario/UsuarioPerfilDTO";

export interface IUsuarioRepository {
    atualizarSenha(
        usuarioId: number,
        dto: UsuarioSenhaUpdateDTO
    ): Promise<UsuarioPerfilDTO>;
    /** Envia arquivo no campo `img` (multipart). Retorna URL ou path da imagem após upload. */
    atualizarImagem(usuarioId: number, arquivo: File): Promise<string | null>;
}
