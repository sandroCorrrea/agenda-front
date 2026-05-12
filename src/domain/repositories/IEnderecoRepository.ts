import type { EnderecoCreateDTO } from "@/application/dto/Endereco/EnderecoCreateDTO";
import type { EnderecoResponseDTO } from "@/application/dto/Endereco/EnderecoResponseDTO";
import type { EnderecoUpdateDTO } from "@/application/dto/Endereco/EnderecoUpdateDTO";

export interface IEnderecoRepository {
    criar(dto: EnderecoCreateDTO): Promise<void>;
    obterPorUsuario(usuarioId: number): Promise<EnderecoResponseDTO | null>;
    atualizarPorUsuario(usuarioId: number, dto: EnderecoUpdateDTO): Promise<void>;
}
