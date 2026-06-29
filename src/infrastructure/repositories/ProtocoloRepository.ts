import type { AxiosInstance } from "axios";
import axios from "axios";
import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type {
    ConsultaAssinaturaProtocoloDTO,
    RegistrarAssinaturaResponseDTO
} from "@/application/dto/Protocolo/ProtocoloAssinaturaDTO";
import {
    Protocolo,
    type ClienteOption,
    type DestinatarioTipo,
    type EnderecoDestinatarioResponse,
    type EmpresaOption,
    type ProtocoloEntregaResumo
} from "@/domain/entities/Protocolo";
import type { ProtocoloPayloadDTO } from "@/application/dto/Protocolo/ProtocoloPayloadDTO";
import { ProtocoloListagemResponseDTO } from "@/application/dto/Protocolo/ProtocoloListagemResponseDTO";

type ProtocoloApi = {
    id: number;
    destinatarioUsuarioId: number | null;
    destinatarioEmpresaId: number | null;
    administradorUsuarioId: number;
    destinatarioTipo: DestinatarioTipo;
    destinatarioNome?: string | null;
    destinatario_nome?: string | null;
    titulo: string | null;
    descricao: string;
    ano: number;
    dataParaEntrega: string;
    cepDestinatario: string;
    ruaDestinatario: string;
    bairroDestinatario: string;
    cidadeDestinatario: string;
    qrcodeToken: string;
    entregue?: boolean;
    jaEntregue?: boolean;
    ja_entregue?: boolean;
    entrega?: Record<string, unknown> | null;
};

export class ProtocoloRepository implements IProtocoloRepository {
    constructor(private api: AxiosInstance) {}

    async listPaginated(params?: {
        page?: number;
        per_page?: number;
        titulo?: string;
        ano?: number;
        destinatario_tipo?: "fisica" | "juridica";
        cnpj?: string;
        descricao?: string;
    }): Promise<ProtocoloListagemResponseDTO> {
        const resp = await this.api.get("/protocolo", { params });
        const data = resp.data;
        const items = (data.protocolo ?? []).map((item: ProtocoloApi) => this.map(item));
        return new ProtocoloListagemResponseDTO(
            items,
            Number(data.total ?? 0),
            Number(data.pagina ?? 1),
            Number(data.porPagina ?? params?.per_page ?? 10)
        );
    }

    async listPaginatedByUsuarioId(
        usuarioId: number,
        params?: {
            page?: number;
            per_page?: number;
            titulo?: string;
            ano?: number;
            destinatario_tipo?: "fisica" | "juridica";
            cnpj?: string;
            descricao?: string;
        },
        signal?: AbortSignal
    ): Promise<ProtocoloListagemResponseDTO> {
        const resp = await this.api.get(`/protocolo/usuario/${usuarioId}`, {
            params,
            signal
        });
        const data = resp.data;
        const items = (data.protocolo ?? []).map((item: ProtocoloApi) => this.map(item));
        return new ProtocoloListagemResponseDTO(
            items,
            Number(data.total ?? 0),
            Number(data.pagina ?? 1),
            Number(data.porPagina ?? params?.per_page ?? 10)
        );
    }

    async findById(id: number): Promise<Protocolo> {
        const resp = await this.api.get(`/protocolo/${id}`);
        return this.map(resp.data as ProtocoloApi);
    }

    async create(dto: ProtocoloPayloadDTO): Promise<Protocolo> {
        const resp = await this.api.post("/protocolo", dto);
        return this.map(resp.data as ProtocoloApi);
    }

    async update(id: number, dto: ProtocoloPayloadDTO): Promise<Protocolo> {
        const resp = await this.api.put(`/protocolo/${id}`, dto);
        return this.map(resp.data as ProtocoloApi);
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(`/protocolo/${id}`);
    }

    async listDestinatarioEmpresas(): Promise<EmpresaOption[]> {
        const resp = await this.api.get("/protocolo/destinatarios/empresas");
        const items = resp.data?.empresas ?? [];
        return items.map((item: any) => ({
            id: Number(item.id),
            nome: String(item.nome ?? `Empresa #${item.id}`)
        }));
    }

    async listDestinatarioClientes(): Promise<ClienteOption[]> {
        const resp = await this.api.get("/protocolo/destinatarios/clientes");
        const items = resp.data?.clientes ?? [];
        return items.map((item: any) => ({
            usuarioId: Number(item.usuarioId),
            pessoaId: Number(item.pessoaId),
            nome: String(item.nome ?? `Usuário #${item.usuarioId}`)
        }));
    }

    async getEnderecoDestinatarioByEmpresaId(empresaId: number): Promise<EnderecoDestinatarioResponse> {
        const resp = await this.api.get(`/protocolo/destinatarios/empresas/${empresaId}/endereco`);
        return {
            cepDestinatario: String(resp.data?.cepDestinatario ?? ""),
            ruaDestinatario: String(resp.data?.ruaDestinatario ?? ""),
            bairroDestinatario: String(resp.data?.bairroDestinatario ?? ""),
            cidadeDestinatario: String(resp.data?.cidadeDestinatario ?? "")
        };
    }

    async getEnderecoDestinatarioByUsuarioId(usuarioId: number): Promise<EnderecoDestinatarioResponse> {
        const resp = await this.api.get(`/protocolo/destinatarios/usuarios/${usuarioId}/endereco`);
        return {
            cepDestinatario: String(resp.data?.cepDestinatario ?? ""),
            ruaDestinatario: String(resp.data?.ruaDestinatario ?? ""),
            bairroDestinatario: String(resp.data?.bairroDestinatario ?? ""),
            cidadeDestinatario: String(resp.data?.cidadeDestinatario ?? "")
        };
    }

    async downloadPdf(id: number): Promise<{ blob: Blob; filename: string }> {
        const parseNomeArquivo = (cd: string | undefined, fallback: string): string => {
            if (!cd) return fallback;
            const m =
                /filename\*=UTF-8''([^;\n]+)|filename="([^"]+)"|filename=([^;\s]+)/i.exec(
                    cd
                );
            const raw = m?.[1] ?? m?.[2] ?? m?.[3];
            if (!raw) return fallback;
            try {
                return decodeURIComponent(raw.replace(/"/g, "").trim());
            } catch {
                return raw.replace(/"/g, "").trim();
            }
        };

        try {
            const resp = await this.api.get(`/protocolo/${id}/pdf`, {
                responseType: "blob",
                headers: {
                    Accept: "application/pdf, application/json"
                }
            });
            const blob = resp.data as Blob;
            const ct = String(resp.headers["content-type"] ?? "");
            if (ct.includes("application/pdf")) {
                const filename = parseNomeArquivo(
                    resp.headers["content-disposition"] as string | undefined,
                    `protocolo_${id}.pdf`
                );
                return { blob, filename };
            }
            const text = await blob.text();
            try {
                const j = JSON.parse(text) as { message?: string };
                throw new Error(j.message ?? "Não foi possível gerar o PDF.");
            } catch (e) {
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                    throw e;
                }
                throw new Error("Não foi possível gerar o PDF.");
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.data instanceof Blob) {
                const text = await e.response.data.text();
                try {
                    const j = JSON.parse(text) as { message?: string };
                    throw new Error(
                        j.message ??
                            (e.response.status === 403
                                ? "Sem permissão para gerar o PDF."
                                : e.response.status === 404
                                  ? "Protocolo não encontrado."
                                  : "Não foi possível gerar o PDF.")
                    );
                } catch (inner) {
                    if (inner instanceof Error && inner.message !== "Unexpected end of JSON input") {
                        throw inner;
                    }
                    throw new Error("Não foi possível gerar o PDF.");
                }
            }
            throw e;
        }
    }

    async consultarAssinaturaPorToken(token: string): Promise<ConsultaAssinaturaProtocoloDTO> {
        const encoded = encodeURIComponent(token);
        const resp = await this.api.get<Record<string, unknown>>(
            `/protocolo/assinatura/${encoded}`,
            { skipAuth: true }
        );
        return this.mapConsultaAssinatura(resp.data);
    }

    async registrarAssinaturaPorToken(
        token: string,
        payload: {
            nome_responsavel_recebimento: string;
            cpf_responsavel_recebimento: string;
        }
    ): Promise<RegistrarAssinaturaResponseDTO> {
        const encoded = encodeURIComponent(token);
        const resp = await this.api.post<Record<string, unknown>>(
            `/protocolo/assinatura/${encoded}`,
            payload,
            { skipAuth: true }
        );
        return this.mapRegistrarAssinatura(resp.data);
    }

    /** Normaliza JSON da API (camelCase ou snake_case) para o DTO interno. */
    private mapConsultaAssinatura(raw: Record<string, unknown>): ConsultaAssinaturaProtocoloDTO {
        const protocoloRaw = (raw.protocolo ?? {}) as Record<string, unknown>;
        const entregaRaw = raw.entrega as Record<string, unknown> | null | undefined;

        const str = (obj: Record<string, unknown>, ...keys: string[]): string =>
            String(keys.map((k) => obj[k]).find((v) => v != null && v !== "") ?? "");

        const protocolo = {
            destinatario_tipo: str(protocoloRaw, "destinatario_tipo", "destinatarioTipo") || "fisica",
            destinatario_nome:
                str(protocoloRaw, "destinatario_nome", "destinatarioNome") || null,
            administrador_nome:
                str(protocoloRaw, "administrador_nome", "administradorNome") || null,
            titulo: (protocoloRaw.titulo as string | null) ?? null,
            descricao: str(protocoloRaw, "descricao"),
            ano: Number(protocoloRaw.ano ?? 0),
            data_para_entrega: str(
                protocoloRaw,
                "data_para_entrega",
                "dataParaEntrega"
            ),
            cep_destinatario: str(
                protocoloRaw,
                "cep_destinatario",
                "cepDestinatario"
            ),
            rua_destinatario: str(
                protocoloRaw,
                "rua_destinatario",
                "ruaDestinatario"
            ),
            bairro_destinatario: str(
                protocoloRaw,
                "bairro_destinatario",
                "bairroDestinatario"
            ),
            cidade_destinatario: str(
                protocoloRaw,
                "cidade_destinatario",
                "cidadeDestinatario"
            )
        };

        let entrega: ConsultaAssinaturaProtocoloDTO["entrega"] = null;
        if (entregaRaw && typeof entregaRaw === "object") {
            entrega = {
                nome_responsavel_recebimento: str(
                    entregaRaw,
                    "nome_responsavel_recebimento",
                    "nomeResponsavelRecebimento"
                ),
                cpf_responsavel_recebimento: str(
                    entregaRaw,
                    "cpf_responsavel_recebimento",
                    "cpfResponsavelRecebimento"
                ),
                data_entrega: str(entregaRaw, "data_entrega", "dataEntrega")
            };
        }

        return {
            jaAssinado: Boolean(raw.jaAssinado),
            protocolo,
            entrega
        };
    }

    private mapRegistrarAssinatura(
        raw: Record<string, unknown>
    ): RegistrarAssinaturaResponseDTO {
        const entregaRaw = (raw.entrega ?? {}) as Record<string, unknown>;
        const str = (obj: Record<string, unknown>, ...keys: string[]): string =>
            String(keys.map((k) => obj[k]).find((v) => v != null && v !== "") ?? "");

        return {
            message: String(raw.message ?? "Assinatura registrada com sucesso."),
            entrega: {
                id:
                    entregaRaw.id != null ? Number(entregaRaw.id) : undefined,
                nome_responsavel_recebimento: str(
                    entregaRaw,
                    "nome_responsavel_recebimento",
                    "nomeResponsavelRecebimento"
                ),
                cpf_responsavel_recebimento: str(
                    entregaRaw,
                    "cpf_responsavel_recebimento",
                    "cpfResponsavelRecebimento"
                ),
                data_entrega: str(entregaRaw, "data_entrega", "dataEntrega")
            }
        };
    }

    private mapEntregaResumo(
        raw: Record<string, unknown> | null | undefined
    ): ProtocoloEntregaResumo | null {
        if (!raw || typeof raw !== "object") return null;
        const pick = (...keys: string[]): string => {
            for (const k of keys) {
                const v = raw[k];
                if (v != null && String(v).trim() !== "") return String(v).trim();
            }
            return "";
        };
        const nome = pick(
            "nome_responsavel_recebimento",
            "nomeResponsavelRecebimento"
        );
        const cpf = pick(
            "cpf_responsavel_recebimento",
            "cpfResponsavelRecebimento"
        );
        const data = pick("data_entrega", "dataEntrega");
        if (!nome && !cpf) return null;
        return {
            nomeResponsavelRecebimento: nome,
            cpfResponsavelRecebimento: cpf,
            dataEntrega: data || null
        };
    }

    private map(item: ProtocoloApi): Protocolo {
        const entrega = this.mapEntregaResumo(item.entrega ?? null);
        const entregue = Boolean(
            item.entregue ?? item.jaEntregue ?? item.ja_entregue ?? entrega
        );

        return new Protocolo(
            Number(item.id),
            item.destinatarioUsuarioId != null ? Number(item.destinatarioUsuarioId) : null,
            item.destinatarioEmpresaId != null ? Number(item.destinatarioEmpresaId) : null,
            Number(item.administradorUsuarioId),
            item.destinatarioTipo,
            (() => {
                const bruto =
                    item.destinatarioNome ?? item.destinatario_nome ?? "";
                const limpo = String(bruto).trim();
                return limpo.length > 0 ? limpo : null;
            })(),
            item.titulo ?? null,
            String(item.descricao ?? ""),
            Number(item.ano),
            String(item.dataParaEntrega ?? ""),
            String(item.cepDestinatario ?? ""),
            String(item.ruaDestinatario ?? ""),
            String(item.bairroDestinatario ?? ""),
            String(item.cidadeDestinatario ?? ""),
            String(item.qrcodeToken ?? ""),
            entregue,
            entrega
        );
    }
}
