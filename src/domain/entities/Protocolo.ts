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
        public qrcodeToken: string
    ) {}
}
