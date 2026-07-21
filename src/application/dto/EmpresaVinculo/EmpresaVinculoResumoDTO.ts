import type { EmpresaVinculoStatus } from "@/domain/types/EmpresaVinculoStatus";

export type EmpresaResumoVinculoDTO = {
    id: number;
    nome: string;
    apelido: string | null;
    cnpj: string;
};

export type UsuarioResumoVinculoDTO = {
    id: number;
    nome: string;
    email: string;
};

export type EmpresaVinculoDTO = {
    id: number;
    empresa_id: number;
    usuario_id: number;
    status: EmpresaVinculoStatus;
    justificativa: string | null;
    empresa: EmpresaResumoVinculoDTO;
    usuario: UsuarioResumoVinculoDTO;
    created_at: string;
    updated_at: string;
    tem_certificado: boolean;
    certificado_enviado_em: string | null;
};

export type EmpresaVinculoListagemResponseDTO = {
    vinculos: EmpresaVinculoDTO[];
    total: number;
    pagina: number;
    por_pagina: number;
};

export type EmpresaVinculoPostResponseDTO = {
    message: string;
    vinculo: EmpresaVinculoDTO;
};

export type EmpresaVinculoStatusUpdateResponseDTO = {
    message: string;
    vinculo: EmpresaVinculoDTO;
};

export type ListarVinculosAdminParams = {
    page: number;
    status?: EmpresaVinculoStatus | "";
};

/** Item de `GET /empresa/vinculo/admin/empresas` — opção do select de PJ. */
export type EmpresaOpcaoVinculoAdminDTO = {
    id: number;
    nome: string;
    apelido: string | null;
    cnpj: string;
};

/** Item de `GET /empresa/vinculo/admin/clientes` — opção do select de PF. */
export type ClienteOpcaoVinculoAdminDTO = {
    usuario_id: number;
    pessoa_id: number;
    nome: string;
    cpf: string;
    email: string;
};

/** Payload de `POST /empresa/vinculo/admin` — vínculo criado pelo administrador. */
export type CriarVinculoAdminRequestDTO = {
    usuario_id: number;
    empresa_id: number;
    /** Se omitido, o backend grava como `aprovado`. */
    status?: EmpresaVinculoStatus;
};
