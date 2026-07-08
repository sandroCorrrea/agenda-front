import type { AxiosInstance } from "axios";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { Pessoa } from "@/domain/entities/Pessoa";
import type { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";
import type { PessoaContatoUpdateDTO } from "@/application/dto/Pessoa/PessoaContatoUpdateDTO";
import { PessoaAdministradorDTO } from "@/application/dto/Pessoa/PessoaAdministradorDTO";
import { PessoaListagemDTO } from "@/application/dto/Pessoa/PessoaListagemDTO";
import { PessoaListagemResponseDTO } from "@/application/dto/Pessoa/PessoaListagemResponseDTO";
import { PessoaPerfilDTO } from "@/application/dto/Pessoa/PessoaPerfilDTO";
import type { CertificadoDigitalPostResponseDTO } from "@/application/dto/EmpresaVinculo/CertificadoDigitalPostResponseDTO";
import { UsuarioPerfilDTO } from "@/application/dto/Usuario/UsuarioPerfilDTO";
import type { PerfilAdministradorOpcaoDTO } from "@/application/dto/Pessoa/PerfilAdministradorOpcaoDTO";
import type { PerfilAdministrador } from "@/domain/types/PerfilAdministrador";

type UsuarioApiJson = {
    id: number;
    pessoaId?: number;
    pessoa_id?: number;
    senha?: string;
    tipoUsuario?: string;
    tipo_usuario?: string;
    status?: string;
    img?: string | null;
    perfilAdministrador?: string | null;
    perfil_administrador?: string | null;
};

type PessoaApiJson = {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    celular: string;
    dataNascimento?: string;
    data_nascimento?: string;
    senha?: string;
    usuario?: UsuarioApiJson | null;
    tem_certificado?: boolean;
    temCertificado?: boolean;
    certificado_enviado_em?: string | null;
    certificadoEnviadoEm?: string | null;
};

type PessoaListagemApiJson = {
    pessoa: PessoaApiJson[];
    total: number;
    pagina: number;
    porPagina: number;
};

export class PessoaRepository implements IPessoaRepository {
    constructor(private api: AxiosInstance) {}

    async persist(pessoa: PessoaPostRequestDTO): Promise<Pessoa> {
        const res = await this.api.post<PessoaApiJson>("/pessoa", pessoa, {
            skipAuth: true
        });
        const data = res.data;
        return new Pessoa(
            data.id,
            data.nome,
            data.cpf,
            new Date(
                data.dataNascimento ?? data.data_nascimento ?? Date.now()
            ),
            data.email,
            data.celular,
            data.senha ?? ""
        );
    }

    async findById(pessoaId: number): Promise<PessoaPerfilDTO> {
        const res = await this.api.get<PessoaApiJson>(`/pessoa/${pessoaId}`);
        return this.mapearPerfil(res.data);
    }

    async atualizarContato(
        pessoaId: number,
        dto: PessoaContatoUpdateDTO
    ): Promise<PessoaPerfilDTO> {
        const res = await this.api.put<PessoaApiJson>(`/pessoa/${pessoaId}`, {
            email: dto.email,
            celular: dto.celular
        });
        return this.mapearPerfil(res.data);
    }

    async listarAdministradores(): Promise<PessoaAdministradorDTO[]> {
        const res = await this.api.get<PessoaApiJson[]>("/pessoa/administradores");
        return res.data
            .filter(
                (item) => item.usuario && typeof item.usuario.id === "number"
            )
            .map((item) => {
                const usuario = this.mapearUsuario(item.usuario as UsuarioApiJson);
                const raw =
                    item.dataNascimento ??
                    item.data_nascimento ??
                    new Date().toISOString();
                return new PessoaAdministradorDTO(
                    item.id,
                    item.nome,
                    item.cpf,
                    new Date(raw),
                    item.email,
                    item.celular,
                    usuario
                );
            });
    }

    async listarPessoas(params?: {
        page?: number;
        per_page?: number;
    }): Promise<PessoaListagemResponseDTO> {
        const res = await this.api.get<PessoaListagemApiJson>("/pessoa", {
            params: {
                page: params?.page,
                per_page: params?.per_page
            }
        });
        return new PessoaListagemResponseDTO(
            res.data.pessoa.map((item) => {
                const raw =
                    item.dataNascimento ??
                    item.data_nascimento ??
                    new Date().toISOString();
                const usuario =
                    item.usuario && typeof item.usuario.id === "number"
                        ? this.mapearUsuario(item.usuario)
                        : null;
                return new PessoaListagemDTO(
                    item.id,
                    item.nome,
                    item.cpf,
                    new Date(raw),
                    item.email,
                    item.celular,
                    usuario
                );
            }),
            Number(res.data.total ?? 0),
            Number(res.data.pagina ?? 1),
            Number(res.data.porPagina ?? 10)
        );
    }

    async atualizarStatusAdministrador(
        usuarioId: number,
        status: "ativo" | "inativo" | "bloqueado"
    ): Promise<void> {
        await this.api.put(`/pessoa/administradores/${usuarioId}/status`, {
            status
        });
    }

    async listarPerfisAdministrador(): Promise<PerfilAdministradorOpcaoDTO[]> {
        const res = await this.api.get<{ perfis: PerfilAdministradorOpcaoDTO[] }>(
            "/pessoa/administrador-perfis"
        );
        return res.data.perfis ?? [];
    }

    async atualizarPerfilAdministrador(
        usuarioId: number,
        perfil: PerfilAdministrador
    ): Promise<void> {
        await this.api.put(`/pessoa/administradores/${usuarioId}/perfil`, {
            perfil_administrador: perfil
        });
    }

    async enviarCertificadoDigital(
        pessoaId: number,
        certificado: File,
        senhaCertificado: string
    ): Promise<CertificadoDigitalPostResponseDTO> {
        const form = new FormData();
        form.append("certificado", certificado);
        form.append("senha_certificado", senhaCertificado);

        const resp = await this.api.post<{ message?: string }>(
            `/pessoa/${pessoaId}/certificado`,
            form
        );

        return {
            message:
                resp.data.message ?? "Certificado digital enviado com sucesso."
        };
    }

    private mapearUsuario(u: UsuarioApiJson): UsuarioPerfilDTO {
        return new UsuarioPerfilDTO(
            u.id,
            Number(u.pessoaId ?? u.pessoa_id ?? 0),
            String(u.tipoUsuario ?? u.tipo_usuario ?? ""),
            String(u.status ?? ""),
            u.img ?? null,
            u.perfilAdministrador ?? u.perfil_administrador ?? null
        );
    }

    private mapearPerfil(data: PessoaApiJson): PessoaPerfilDTO {
        const raw =
            data.dataNascimento ?? data.data_nascimento ?? new Date().toISOString();
        const usuario =
            data.usuario && typeof data.usuario.id === "number"
                ? this.mapearUsuario(data.usuario)
                : null;
        return new PessoaPerfilDTO(
            data.id,
            data.nome,
            data.cpf,
            new Date(raw),
            data.email,
            data.celular,
            usuario,
            Boolean(data.tem_certificado ?? data.temCertificado),
            data.certificado_enviado_em ?? data.certificadoEnviadoEm ?? null
        );
    }
}

