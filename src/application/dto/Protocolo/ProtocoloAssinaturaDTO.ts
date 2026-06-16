/** Resposta GET /api/protocolo/assinatura/{token} */
export type ProtocoloAssinaturaResumoDTO = {
    destinatario_tipo: string;
    destinatario_nome: string | null;
    administrador_nome: string | null;
    titulo: string | null;
    descricao: string;
    ano: number;
    data_para_entrega: string;
    cep_destinatario: string;
    rua_destinatario: string;
    bairro_destinatario: string;
    cidade_destinatario: string;
};

export type ProtocoloEntregaDTO = {
    nome_responsavel_recebimento: string;
    cpf_responsavel_recebimento: string;
    data_entrega: string;
};

export type ConsultaAssinaturaProtocoloDTO = {
    jaAssinado: boolean;
    protocolo: ProtocoloAssinaturaResumoDTO;
    entrega: ProtocoloEntregaDTO | null;
};

export type RegistrarAssinaturaResponseDTO = {
    message: string;
    entrega: ProtocoloEntregaDTO & { id?: number };
};
