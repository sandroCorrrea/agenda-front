export type DestinatarioTipo = "fisica" | "juridica";

export type EmpresaOption = {
    id: number;
    nome: string;
};

export type ClienteOption = {
    usuarioId: number;
    pessoaId: number;
    nome: string;
};

export type EnderecoDestinatarioResponse = {
    cepDestinatario: string;
    ruaDestinatario: string;
    bairroDestinatario: string;
    cidadeDestinatario: string;
};

/** Resumo da assinatura/entrega (`protocolo_entrega`), quando existir. */
export type ProtocoloEntregaResumo = {
    nomeResponsavelRecebimento: string;
    cpfResponsavelRecebimento: string;
    dataEntrega: string | null;
};

export class Protocolo {
    constructor(
        public id: number,
        public destinatarioUsuarioId: number | null,
        public destinatarioEmpresaId: number | null,
        public administradorUsuarioId: number,
        public destinatarioTipo: DestinatarioTipo,
        /** Nome da pessoa (PF) ou da empresa (PJ); preenchido quando a API enviar `destinatarioNome`. */
        public destinatarioNome: string | null,
        public titulo: string | null,
        public descricao: string,
        public ano: number,
        public dataParaEntrega: string,
        public cepDestinatario: string,
        public ruaDestinatario: string,
        public bairroDestinatario: string,
        public cidadeDestinatario: string,
        public qrcodeToken: string,
        /** `true` quando há registro em `protocolo_entrega` (assinatura concluída). */
        public entregue: boolean = false,
        public entrega: ProtocoloEntregaResumo | null = null
    ) {}
}
