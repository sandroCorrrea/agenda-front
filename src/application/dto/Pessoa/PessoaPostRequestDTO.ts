export class PessoaPostRequestDTO {
    constructor (
        public nome: string,
        public cpf: string,
        public data_nascimento: string,
        public email: string,
        public celular: string,
        public senha: string,
        public senha_confirmation: string
    ) {}
}
