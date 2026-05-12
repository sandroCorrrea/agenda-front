import type { DestinatarioTipo } from "@/domain/entities/Protocolo";

export class ProtocoloPayloadDTO {
    constructor(
        public destinatario_tipo: DestinatarioTipo,
        public destinatario_usuario_id: number | null,
        public destinatario_empresa_id: number | null,
        public administrador_usuario_id: number,
        public titulo: string | null,
        public descricao: string,
        public ano: number,
        public data_para_entrega: string,
        public cep_destinatario: string,
        public rua_destinatario: string,
        public bairro_destinatario: string,
        public cidade_destinatario: string
    ) {}
}
