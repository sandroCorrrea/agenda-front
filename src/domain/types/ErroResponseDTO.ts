export interface ErroResponseDTO {
    message: string;
    errors: {
        email?: string[];
    };
}
