export interface ErroResponseDTO {
    message: string;
    errors: {
        email?: string[];
        mensagem?: string[];
        nome?: string[];
    };
}
