export class UsuarioSenhaUpdateDTO {
    constructor(
        public senha_atual: string,
        public nova_senha: string,
        public nova_senha_confirmation: string
    ) {}
}
