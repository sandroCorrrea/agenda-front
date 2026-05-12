import type { AxiosInstance } from "axios";
import type { IUsuarioRepository } from "@/domain/repositories/IUsuarioRepository";
import type { UsuarioSenhaUpdateDTO } from "@/application/dto/Usuario/UsuarioSenhaUpdateDTO";
import { UsuarioPerfilDTO } from "@/application/dto/Usuario/UsuarioPerfilDTO";

type UsuarioApiJson = {
    id: number;
    pessoa_id?: number;
    pessoaId?: number;
    tipo_usuario?: string;
    tipoUsuario?: string;
    status?: string;
    img?: string | null;
};

export class UsuarioRepository implements IUsuarioRepository {
    constructor(private api: AxiosInstance) {}

    async atualizarSenha(
        usuarioId: number,
        dto: UsuarioSenhaUpdateDTO
    ): Promise<UsuarioPerfilDTO> {
        const res = await this.api.put<UsuarioApiJson>(`/usuario/senha/${usuarioId}`, {
            senha_atual: dto.senha_atual,
            nova_senha: dto.nova_senha,
            nova_senha_confirmation: dto.nova_senha_confirmation
        });
        const d = res.data;
        return new UsuarioPerfilDTO(
            d.id,
            Number(d.pessoa_id ?? d.pessoaId ?? 0),
            String(d.tipo_usuario ?? d.tipoUsuario ?? ""),
            String(d.status ?? ""),
            d.img ?? null
        );
    }

    async atualizarImagem(
        usuarioId: number,
        arquivo: File
    ): Promise<string | null> {
        const corpo = new FormData();
        corpo.append("_method", "PUT");
        corpo.append("imagem", arquivo);
        const res = await this.api.post<{
            img?: string | null;
            photo?: string | null;
            imagem?: string | null;
            usuario?: { img?: string | null };
        }>(`/usuario/photo/${usuarioId}`, corpo);
        const d = res.data;
        if (d.img !== undefined) return d.img ?? null;
        if (d.photo !== undefined) return d.photo ?? null;
        if (d.imagem !== undefined) return d.imagem ?? null;
        if (d.usuario?.img !== undefined) return d.usuario.img ?? null;
        return null;
    }
}
