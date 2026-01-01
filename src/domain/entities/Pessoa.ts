export class Pessoa {
    constructor(
        public id: number,
        public nome: string,
        public cpf: string,
        public dataNascimento: Date,
        public email: string,
        public celular: string
    ) {}
}
