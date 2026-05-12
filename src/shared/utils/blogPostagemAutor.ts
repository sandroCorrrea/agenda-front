import type { BlogPostagemUsuarioResumo } from "@/domain/entities/BlogPostagem";
import { resolvePublicAssetUrl } from "@/shared/utils/mediaUrl";

/** Objeto mínimo com `usuario` como nas entidades de postagem (lista, detalhe, recentes). */
export type PostagemComAutor = {
    usuario?: BlogPostagemUsuarioResumo | null;
};

/** Nome amigável do autor (pessoa vinculada ou tipo de usuário). */
export function nomeAutorPostagem(post: PostagemComAutor): string {
    const p = post.usuario?.pessoa;
    const n = p?.nome?.trim();
    if (n) return n;
    const t = post.usuario?.tipo_usuario?.trim();
    if (t) return t;
    return "—";
}

/** URL da foto do usuário da postagem, ou null para usar placeholder. */
export function urlAvatarAutorPostagem(
    usuario: BlogPostagemUsuarioResumo | null | undefined
): string | null {
    const img = usuario?.img?.trim();
    if (!img) return null;
    return resolvePublicAssetUrl(img);
}
