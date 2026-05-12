import type { UsuarioPerfilDTO } from "../Usuario/UsuarioPerfilDTO";

export class PessoaListagemDTO {
    constructor(
        public id: number,
        public nome: string,
        public cpf: string,
        public dataNascimento: Date,
        public email: string,
        public celular: string,
        public usuario: UsuarioPerfilDTO | null
    ) {}
}
