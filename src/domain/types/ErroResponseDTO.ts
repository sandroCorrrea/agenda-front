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
    };
}
