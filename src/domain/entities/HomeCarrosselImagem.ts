/**
 * Imagem do carrossel da página inicial.
 * Representa um slide cadastrado pelo administrador e exibido em /home.
 */
export class HomeCarrosselImagem {
    constructor(
        public id: number,
        public titulo: string,
        public altText: string,
        public imagemUrl: string,
        public src: string,
        public ordem: number,
        public ativo: boolean,
        public linkUrl: string | null,
        public abrirEmNovaAba: boolean,
        public imagemPath: string | null = null,
        public createdAt: string | null = null,
        public updatedAt: string | null = null
    ) {}
}
