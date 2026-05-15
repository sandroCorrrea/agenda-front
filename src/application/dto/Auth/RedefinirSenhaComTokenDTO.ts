export class RedefinirSenhaComTokenDTO {
    constructor(
        public readonly token: string,
        public readonly nova_senha: string,
        public readonly nova_senha_confirmation: string
    ) {}
}
