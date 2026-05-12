import { inject, ref } from "vue";
import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import { ObterServicoPorIdUseCase } from "@/application/use-cases/Servico/ObterServicoPorIdUseCase";
import { AtualizarServicoUseCase } from "@/application/use-cases/Servico/AtualizarServicoUseCase";
import { ServicoUpdateRequestDTO } from "@/application/dto/Servico/ServicoUpdateRequestDTO";
import type { Servico } from "@/domain/entities/Servico";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useEditarServico() {
    const repo = inject<IServicoRepository>("IServicoRepository");
    if (!repo) throw new Error("IServicoRepository not provided");

    const obterCaso = new ObterServicoPorIdUseCase(repo);
    const atualizarCaso = new AtualizarServicoUseCase(repo);

    const servicoAtual = ref<Servico | null>(null);
    const carregando = ref(false);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const naoEncontrado = ref(false);
    const erroCampos = ref<Record<string, string>>({});

    async function carregar(id: number) {
        carregando.value = true;
        erro.value = null;
        naoEncontrado.value = false;
        try {
            const data = await obterCaso.execute(id);
            servicoAtual.value = data;
            return data;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Serviço não encontrado.";
                } else {
                    erro.value = d?.message ?? "Não foi possível carregar o serviço.";
                }
            } else {
                erro.value = "Não foi possível carregar o serviço.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function salvar(
        id: number,
        payload: {
            nome: string;
            descricao: string | null;
            status?: "ativo" | "inativo";
        }
    ) {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const atualizado = await atualizarCaso.execute(
                id,
                new ServicoUpdateRequestDTO(
                    payload.nome,
                    payload.descricao,
                    payload.status
                )
            );
            servicoAtual.value = atualizado;
            sucesso.value = "Serviço atualizado com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                const errors = (d?.errors ?? {}) as Record<string, string[] | undefined>;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Serviço não encontrado.";
                } else if (status === 422) {
                    erroCampos.value = {
                        nome: errors.nome?.[0] ?? "",
                        descricao: errors.descricao?.[0] ?? "",
                        status: errors.status?.[0] ?? ""
                    };
                    erro.value = d?.message ?? "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível salvar agora. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível atualizar o serviço.";
                }
            } else {
                erro.value = "Não foi possível atualizar o serviço.";
            }
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    return {
        servicoAtual,
        carregando,
        salvando,
        erro,
        sucesso,
        naoEncontrado,
        erroCampos,
        carregar,
        salvar
    };
}
