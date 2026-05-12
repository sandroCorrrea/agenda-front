import type { AxiosInstance } from "axios";
import axios from "axios";
import type { EnderecoCreateDTO } from "@/application/dto/Endereco/EnderecoCreateDTO";
import type { EnderecoUpdateDTO } from "@/application/dto/Endereco/EnderecoUpdateDTO";
import { EnderecoResponseDTO } from "@/application/dto/Endereco/EnderecoResponseDTO";
import type { IEnderecoRepository } from "@/domain/repositories/IEnderecoRepository";

type EnderecoApiJson = {
    id: number;
    usuarioId?: number;
    usuario_id?: number;
    cep: string;
    logradouro: string;
    numero?: string | null;
    complemento?: string | null;
    unidade?: string | null;
    bairro: string;
    localidade: string;
    uf: string;
    estado: string;
    regiao: string;
    ibge: string;
    gia?: string | null;
    ddd: string;
    siafi: string;
    createdAt?: string;
    created_at?: string;
};

export class EnderecoRepository implements IEnderecoRepository {
    constructor(private api: AxiosInstance) {}

    async criar(dto: EnderecoCreateDTO): Promise<void> {
        await this.api.post("/endereco", {
            usuario_id: dto.usuario_id,
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            complemento: dto.complemento,
            unidade: dto.unidade,
            bairro: dto.bairro,
            localidade: dto.localidade,
            uf: dto.uf,
            estado: dto.estado,
            regiao: dto.regiao,
            ibge: dto.ibge,
            gia: dto.gia,
            ddd: dto.ddd,
            siafi: dto.siafi
        });
    }

    async atualizarPorUsuario(
        usuarioId: number,
        dto: EnderecoUpdateDTO
    ): Promise<void> {
        await this.api.put(`/endereco/usuario/${usuarioId}`, {
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            complemento: dto.complemento,
            unidade: dto.unidade,
            bairro: dto.bairro,
            localidade: dto.localidade,
            uf: dto.uf,
            estado: dto.estado,
            regiao: dto.regiao,
            ibge: dto.ibge,
            gia: dto.gia,
            ddd: dto.ddd,
            siafi: dto.siafi
        });
    }

    async obterPorUsuario(usuarioId: number): Promise<EnderecoResponseDTO | null> {
        try {
            const res = await this.api.get<EnderecoApiJson>(
                `/endereco/usuario/${usuarioId}`
            );
            const d = res.data;
            return new EnderecoResponseDTO(
                d.id,
                Number(d.usuarioId ?? d.usuario_id ?? usuarioId),
                d.cep,
                d.logradouro,
                d.numero ?? "",
                d.complemento ?? "",
                d.unidade ?? "",
                d.bairro,
                d.localidade,
                d.uf,
                d.estado,
                d.regiao,
                d.ibge,
                d.gia ?? "",
                d.ddd,
                d.siafi,
                d.createdAt ?? d.created_at ?? ""
            );
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 404) {
                return null;
            }
            throw e;
        }
    }
}
