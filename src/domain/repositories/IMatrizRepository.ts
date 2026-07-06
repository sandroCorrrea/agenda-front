import type { Matriz } from "../entities/Matriz";
import type { EmpresaUpsertDTO } from "@/application/dto/Empresa/EmpresaUpsertDTO";
import type { EmpresaListagemAtividadeDTO } from "@/application/dto/Empresa/EmpresaListagemAtividadeDTO";
import type { EmpresaListagemQsaDTO } from "@/application/dto/Empresa/EmpresaListagemQsaDTO";

export type ListarEmpresasParams = {
    page?: number;
    /** Filtro parcial em nome ou apelido (trim no cliente). */
    nome?: string | null;
    /** CNPJ com ou sem máscara (14 dígitos) — busca exata no banco local. Obrigatório para cliente. */
    cnpj?: string | null;
};

/** Resposta paginada de `GET /api/empresa` (`por_pagina` fixo no backend, ex.: 6). */
export type EmpresasPaginadasResultado = {
    data: EmpresaListagemDTO[];
    total: number;
    pagina: number;
    por_pagina: number;
};

/** Item de `data` em `GET /api/empresa` (ordenado por nome). */
export type EmpresaListagemDTO = {
    id: number;
    nome: string;
    apelido?: string | null;
    cnpj: string;
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    telefone?: string | null;
    celular?: string | null;
    email: string;
    inscricao_estadual?: string | null;
    tipo_empresa?: string | null;
    data_situacao_uf?: string | null;
    situacao_cnpj?: string | null;
    situacao_ie?: string | null;
    cnae?: string | null;
    atividades_principais: EmpresaListagemAtividadeDTO[];
    atividades_secundarias: EmpresaListagemAtividadeDTO[];
    qsa: EmpresaListagemQsaDTO[];
    created_at: string;
    updated_at: string;
};

export interface IMatrizRepository {
    find(): Promise<Matriz>;
    listarEmpresasPaginado(
        params?: ListarEmpresasParams
    ): Promise<EmpresasPaginadasResultado>;
    /** Busca empresa cadastrada pelo CNPJ (14 dígitos) no banco local. */
    buscarEmpresaPorCnpj(cnpjSemMascara: string): Promise<EmpresaListagemDTO | null>;
    criarEmpresa(dto: EmpresaUpsertDTO): Promise<EmpresaListagemDTO>;
    atualizarEmpresa(
        id: number,
        dto: EmpresaUpsertDTO
    ): Promise<EmpresaListagemDTO>;
    upsert(dto: EmpresaUpsertDTO): Promise<void>;
}
