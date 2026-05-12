import { inject, ref } from "vue";
import type { IEnderecoRepository } from "@/domain/repositories/IEnderecoRepository";
import { AtualizarEnderecoPorUsuarioUseCase } from "@/application/use-cases/Endereco/AtualizarEnderecoPorUsuarioUseCase";
import { CriarEnderecoUseCase } from "@/application/use-cases/Endereco/CriarEnderecoUseCase";
import { ObterEnderecoPorUsuarioUseCase } from "@/application/use-cases/Endereco/ObterEnderecoPorUsuarioUseCase";
import { EnderecoCreateDTO } from "@/application/dto/Endereco/EnderecoCreateDTO";
import type { EnderecoResponseDTO } from "@/application/dto/Endereco/EnderecoResponseDTO";
import { EnderecoUpdateDTO } from "@/application/dto/Endereco/EnderecoUpdateDTO";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export type ViaCepResponse = {
    cep: string;
    logradouro: string;
    complemento: string;
    unidade: string;
    bairro: string;
    localidade: string;
    uf: string;
    estado: string;
    regiao: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
};

export function useEnderecoUsuario() {
    const repo = inject<IEnderecoRepository | null>("IEnderecoRepository", null);
    if (!repo) throw new Error("IEnderecoRepository not provided");

    const casoUso = new CriarEnderecoUseCase(repo);
    const casoUsoAtualizar = new AtualizarEnderecoPorUsuarioUseCase(repo);
    const casoUsoObter = new ObterEnderecoPorUsuarioUseCase(repo);

    const carregandoCep = ref(false);
    const carregandoEndereco = ref(false);
    const salvandoEndereco = ref(false);
    const erroCep = ref<string | null>(null);
    const erroEndereco = ref<string | null>(null);
    const sucessoEndereco = ref(false);
    const endereco = ref<EnderecoResponseDTO | null>(null);

    function obterMensagemErroEndereco(e: unknown, fallback: string): string {
        if (axios.isAxiosError(e)) {
            const d = e.response?.data as ErroResponseDTO & {
                errors?: Record<string, string[]>;
            };
            if (e.response?.status === 403) {
                return d?.message ?? "Você não tem permissão para alterar este endereço.";
            }
            return (
                d?.errors?.cep?.[0] ||
                d?.errors?.logradouro?.[0] ||
                d?.errors?.bairro?.[0] ||
                d?.errors?.localidade?.[0] ||
                d?.errors?.uf?.[0] ||
                d?.message ||
                fallback
            );
        }
        return fallback;
    }

    async function buscarCep(cepLimpo: string): Promise<ViaCepResponse | null> {
        carregandoCep.value = true;
        erroCep.value = null;
        try {
            const numeroCep = cepLimpo.replace(/\D/g, "");
            const resposta = await fetch(`https://viacep.com.br/ws/${numeroCep}/json/`);
            if (!resposta.ok) {
                throw new Error("Falha ao consultar CEP.");
            }
            const data = (await resposta.json()) as ViaCepResponse;
            if (data.erro) {
                erroCep.value = "CEP não encontrado.";
                return null;
            }
            return data;
        } catch (e: unknown) {
            erroCep.value =
                e instanceof Error ? e.message : "Não foi possível consultar o CEP.";
            return null;
        } finally {
            carregandoCep.value = false;
        }
    }

    async function salvarEndereco(dto: EnderecoCreateDTO): Promise<void> {
        salvandoEndereco.value = true;
        erroEndereco.value = null;
        sucessoEndereco.value = false;
        try {
            await casoUso.execute(dto);
            sucessoEndereco.value = true;
        } catch (e: unknown) {
            erroEndereco.value = obterMensagemErroEndereco(
                e,
                "Não foi possível salvar o endereço."
            );
            throw e;
        } finally {
            salvandoEndereco.value = false;
        }
    }

    async function atualizarEnderecoUsuario(
        usuarioId: number,
        dto: EnderecoUpdateDTO
    ): Promise<void> {
        salvandoEndereco.value = true;
        erroEndereco.value = null;
        sucessoEndereco.value = false;
        try {
            await casoUsoAtualizar.execute(usuarioId, dto);
            sucessoEndereco.value = true;
        } catch (e: unknown) {
            erroEndereco.value = obterMensagemErroEndereco(
                e,
                "Não foi possível atualizar o endereço."
            );
            throw e;
        } finally {
            salvandoEndereco.value = false;
        }
    }

    async function carregarEnderecoUsuario(
        usuarioId: number
    ): Promise<EnderecoResponseDTO | null> {
        carregandoEndereco.value = true;
        erroEndereco.value = null;
        try {
            endereco.value = await casoUsoObter.execute(usuarioId);
            return endereco.value;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO;
                if (e.response?.status === 403) {
                    erroEndereco.value =
                        d?.message ??
                        "Você não tem permissão para consultar este endereço.";
                } else {
                    erroEndereco.value =
                        d?.message ?? "Não foi possível carregar o endereço.";
                }
            } else {
                erroEndereco.value = "Não foi possível carregar o endereço.";
            }
            throw e;
        } finally {
            carregandoEndereco.value = false;
        }
    }

    return {
        buscarCep,
        salvarEndereco,
        atualizarEnderecoUsuario,
        carregarEnderecoUsuario,
        carregandoCep,
        carregandoEndereco,
        salvandoEndereco,
        erroCep,
        erroEndereco,
        sucessoEndereco,
        endereco
    };
}
