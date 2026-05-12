/** Atualização de e-mail e celular (PUT /pessoa/{id}). */
export class PessoaContatoUpdateDTO {
    constructor(
        public email: string,
        public celular: string
    ) {}
}
