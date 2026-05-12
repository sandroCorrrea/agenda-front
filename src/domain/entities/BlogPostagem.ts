import type { BlogCategoria } from "./BlogCategoria";

/** Dados da pessoa quando o backend inclui `usuario.pessoa` na postagem (blog). */
export type BlogPostagemPessoaResumo = {
    id: number;
    nome?: string | null;
    cpf?: string | null;
    data_nascimento?: string | null;
    email?: string | null;
    celular?: string | null;
};

export type BlogPostagemUsuarioResumo = {
    id: number;
    pessoa_id?: number;
    tipo_usuario?: string;
    status?: string;
    img?: string | null;
    /** Presente nas respostas de blog postagem quando o usuário tem pessoa carregada. */
    pessoa?: BlogPostagemPessoaResumo | null;
};

export class BlogPostagem {
    constructor(
        public id: number,
        public nome: string,
        public descricao: string,
        public categoria: BlogCategoria,
        public status: string,
        public imagem: string | null,
        public arquivo: string | null,
        public dataCriacao: Date | null,
        public dataAlteracao: Date | null,
        public usuario: BlogPostagemUsuarioResumo | null = null
    ) {}
}
