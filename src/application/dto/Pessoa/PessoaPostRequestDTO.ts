import type { UsuarioPostRequestDTO } from "../Usuario/UsuarioPostRequestDTO";

export class PessoaPostRequestDTO {
    constructor (
        public nome: string,
        public cpf: string,
        public data_nascimento: string,
        public email: string,
        public celular: string,
        public usuario: UsuarioPostRequestDTO
    ) {}
}
