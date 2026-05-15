/**
 * Payload de atualização de imagem do carrossel.
 *
 * Semântica:
 * - `titulo` é sempre enviado (obrigatório no backend).
 * - Os demais campos só são serializados se forem diferentes de `undefined`;
 *   `null` é enviado quando o usuário quer "limpar" (link_url, alt_text).
 * - `imagem`:
 *    - `undefined` → mantém o arquivo atual e o repositório envia JSON via PUT.
 *    - `File`      → envia multipart via POST/{id} para trocar o arquivo.
 */
export class HomeCarrosselImagemUpdateRequestDTO {
    constructor(
        public titulo: string,
        public ordem?: number,
        public ativo?: boolean,
        public abrirEmNovaAba?: boolean,
        public altText?: string | null,
        public linkUrl?: string | null,
        public imagem?: File
    ) {}
}
