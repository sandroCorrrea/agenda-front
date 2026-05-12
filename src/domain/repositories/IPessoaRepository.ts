import type { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";
import type { PessoaContatoUpdateDTO } from "@/application/dto/Pessoa/PessoaContatoUpdateDTO";
import type { PessoaAdministradorDTO } from "@/application/dto/Pessoa/PessoaAdministradorDTO";
import type { PessoaListagemResponseDTO } from "@/application/dto/Pessoa/PessoaListagemResponseDTO";
import type { PessoaPerfilDTO } from "@/application/dto/Pessoa/PessoaPerfilDTO";
import type { Pessoa } from "../entities/Pessoa";

export interface IPessoaRepository {
    persist(pessoa: PessoaPostRequestDTO): Promise<Pessoa>;
    findById(pessoaId: number): Promise<PessoaPerfilDTO>;
    atualizarContato(
        pessoaId: number,
        dto: PessoaContatoUpdateDTO
    ): Promise<PessoaPerfilDTO>;
    listarAdministradores(): Promise<PessoaAdministradorDTO[]>;
    listarPessoas(params?: {
        page?: number;
        per_page?: number;
    }): Promise<PessoaListagemResponseDTO>;
    atualizarStatusAdministrador(
        usuarioId: number,
        status: "ativo" | "inativo" | "bloqueado"
    ): Promise<void>;
}
