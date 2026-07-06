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
