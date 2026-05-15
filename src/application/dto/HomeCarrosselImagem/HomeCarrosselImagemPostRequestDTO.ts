/**
 * Payload de criação de imagem do carrossel.
 * É sempre enviado como multipart/form-data porque a `imagem` é obrigatória.
 */
export class HomeCarrosselImagemPostRequestDTO {
    constructor(
        public titulo: string,
        public imagem: File,
        public ordem: number = 0,
        public ativo: boolean = true,
        public abrirEmNovaAba: boolean = false,
        public altText: string | null = null,
        public linkUrl: string | null = null
    ) {}
}
