export interface ErroResponseDTO {
    message: string;
    errors: {
        email?: string[];
        mensagem?: string[];
        nome?: string[];
        cpf?: string[];
        data_nascimento?: string[];
        celular?: string[];
        senha?: string[];
        'usuario.senha'?: string[];
        'usuario.senha_confirmation'?: string[];
        'usuario.tipo_usuario'?: string[];
    };
}
