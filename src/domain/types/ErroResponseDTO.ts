export interface ErroResponseDTO {
    message: string;
    errors: {
        email?: string[];
        mensagem?: string[];
        nome?: string[];
        descricao?: string[];
        cpf?: string[];
        usuario_id?: string[];
        senha?: string[];
        data_nascimento?: string[];
        celular?: string[];
        cep?: string[];
        logradouro?: string[];
        bairro?: string[];
        localidade?: string[];
        uf?: string[];
        imagem?: string[];
        'usuario.senha'?: string[];
        'usuario.senha_confirmation'?: string[];
        'usuario.tipo_usuario'?: string[];
        senha_atual?: string[];
        nova_senha?: string[];
        nova_senha_confirmation?: string[];
        status?: string[];
        destinatario_tipo?: string[];
        destinatario_usuario_id?: string[];
        destinatario_empresa_id?: string[];
        administrador_usuario_id?: string[];
        titulo?: string[];
        ano?: string[];
        data_para_entrega?: string[];
        cep_destinatario?: string[];
        rua_destinatario?: string[];
        bairro_destinatario?: string[];
        cidade_destinatario?: string[];
    };
}
