import type {
    EmpresaVinculoDTO,
    EmpresaVinculoListagemResponseDTO,
    EmpresaVinculoPostResponseDTO,
    EmpresaVinculoStatusUpdateResponseDTO,
    ListarVinculosAdminParams
} from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { CertificadoDigitalPostResponseDTO } from "@/application/dto/EmpresaVinculo/CertificadoDigitalPostResponseDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";
import type { EmpresaVinculoStatus } from "@/domain/types/EmpresaVinculoStatus";
import type { AxiosInstance } from "axios";

type VinculoJson = {
    id: number;
    empresa_id: number;
    usuario_id: number;
    status: string;
    justificativa?: string | null;
    empresa?: {
        id: number;
        nome: string;
        apelido?: string | null;
        cnpj: string;
    };
    usuario?: {
        id: number;
        nome: string;
        email: string;
    };
    created_at?: string;
    updated_at?: string;
    tem_certificado?: boolean;
    certificado_enviado_em?: string | null;
};

export class EmpresaVinculoRepository implements IEmpresaVinculoRepository {
    constructor(private api: AxiosInstance) {}

    private mapVinculo(item: VinculoJson): EmpresaVinculoDTO {
        const empresa = item.empresa ?? {
            id: item.empresa_id,
            nome: "",
            apelido: null,
            cnpj: ""
        };
        const usuario = item.usuario ?? {
            id: item.usuario_id,
            nome: "",
            email: ""
        };
        return {
            id: item.id,
            empresa_id: item.empresa_id,
            usuario_id: item.usuario_id,
            status: item.status as EmpresaVinculoStatus,
            justificativa: item.justificativa ?? null,
            empresa: {
                id: empresa.id,
                nome: empresa.nome,
                apelido: empresa.apelido ?? null,
                cnpj: empresa.cnpj
            },
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            },
            created_at: item.created_at ?? "",
            updated_at: item.updated_at ?? "",
            tem_certificado: Boolean(item.tem_certificado),
            certificado_enviado_em: item.certificado_enviado_em ?? null
        };
    }

    async listarVinculosCliente(
        page: number
    ): Promise<EmpresaVinculoListagemResponseDTO> {
        const resp = await this.api.get<{
            vinculos?: VinculoJson[];
            total?: number;
            pagina?: number;
            por_pagina?: number;
        }>("/empresa/vinculo", { params: { page } });

        const body = resp.data;
        const arr = Array.isArray(body.vinculos) ? body.vinculos : [];
        return {
            vinculos: arr.map((v) => this.mapVinculo(v)),
            total: Number(body.total) || 0,
            pagina: Number(body.pagina) || page,
            por_pagina: Number(body.por_pagina) || 10
        };
    }

    async solicitarVinculo(
        empresaId: number
    ): Promise<EmpresaVinculoPostResponseDTO> {
        const resp = await this.api.post<{
            message?: string;
            vinculo: VinculoJson;
        }>("/empresa/vinculo", { empresa_id: empresaId });

        return {
            message:
                resp.data.message ??
                "Solicitação de vinculação enviada com sucesso.",
            vinculo: this.mapVinculo(resp.data.vinculo)
        };
    }

    private mapListagem(
        body: {
            vinculos?: VinculoJson[];
            total?: number;
            pagina?: number;
            por_pagina?: number;
        },
        page: number
    ): EmpresaVinculoListagemResponseDTO {
        const arr = Array.isArray(body.vinculos) ? body.vinculos : [];
        return {
            vinculos: arr.map((v) => this.mapVinculo(v)),
            total: Number(body.total) || 0,
            pagina: Number(body.pagina) || page,
            por_pagina: Number(body.por_pagina) || 10
        };
    }

    async listarVinculosAdmin(
        params: ListarVinculosAdminParams
    ): Promise<EmpresaVinculoListagemResponseDTO> {
        const query: Record<string, string | number> = { page: params.page };
        if (params.status) query.status = params.status;

        const resp = await this.api.get<{
            vinculos?: VinculoJson[];
            total?: number;
            pagina?: number;
            por_pagina?: number;
        }>("/empresa/vinculo/admin", { params: query });

        return this.mapListagem(resp.data, params.page);
    }

    async aprovarVinculo(
        vinculoId: number
    ): Promise<EmpresaVinculoStatusUpdateResponseDTO> {
        const resp = await this.api.put<{
            message?: string;
            vinculo: VinculoJson;
        }>(`/empresa/vinculo/${vinculoId}/status`, { status: "aprovado" });

        return {
            message: resp.data.message ?? "Vinculação aprovada com sucesso.",
            vinculo: this.mapVinculo(resp.data.vinculo)
        };
    }

    async rejeitarVinculo(
        vinculoId: number,
        justificativa: string
    ): Promise<EmpresaVinculoStatusUpdateResponseDTO> {
        const resp = await this.api.put<{
            message?: string;
            vinculo: VinculoJson;
        }>(`/empresa/vinculo/${vinculoId}/status`, {
            status: "rejeitado",
            justificativa
        });

        return {
            message: resp.data.message ?? "Vinculação rejeitada com sucesso.",
            vinculo: this.mapVinculo(resp.data.vinculo)
        };
    }

    async enviarCertificadoDigital(
        vinculoId: number,
        certificado: File,
        senhaCertificado: string
    ): Promise<CertificadoDigitalPostResponseDTO> {
        const form = new FormData();
        form.append("certificado", certificado);
        form.append("senha_certificado", senhaCertificado);

        const resp = await this.api.post<{ message?: string }>(
            `/empresa/vinculo/${vinculoId}/certificado`,
            form
        );

        return {
            message:
                resp.data.message ?? "Certificado digital enviado com sucesso."
        };
    }
}
