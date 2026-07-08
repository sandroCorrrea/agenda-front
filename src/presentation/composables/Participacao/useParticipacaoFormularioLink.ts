import { ObterLinkFormularioParticipacaoUseCase } from "@/application/use-cases/Participacao/ObterLinkFormularioParticipacaoUseCase";
import type { ParticipacaoFormularioLinkDTO } from "@/application/dto/Participacao/ParticipacaoFormularioLinkDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";
import axios from "axios";
import { inject, ref } from "vue";

export function useParticipacaoFormularioLink() {
    const repo = inject<IParticipacaoRepository | null>("IParticipacaoRepository", null);
    if (!repo) throw new Error("IParticipacaoRepository not found");

    const caso = new ObterLinkFormularioParticipacaoUseCase(repo);

    const dados = ref<ParticipacaoFormularioLinkDTO | null>(null);
    const carregando = ref(false);
    const erro = ref<string | null>(null);
    const copiado = ref(false);

    async function carregar() {
        carregando.value = true;
        erro.value = null;
        copiado.value = false;
        try {
            dados.value = await caso.execute();
        } catch (e: unknown) {
            dados.value = null;
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const data = e.response?.data as { message?: string } | undefined;
                if (status === 422) {
                    erro.value =
                        data?.message ??
                        "Cadastre o endereço do administrador com código IBGE para gerar o link do formulário.";
                } else if (status === 403) {
                    erro.value =
                        data?.message ??
                        "O link exclusivo do formulário está disponível apenas para administradores da prefeitura.";
                } else {
                    erro.value =
                        data?.message ?? "Não foi possível carregar o link do formulário.";
                }
            } else {
                erro.value = "Não foi possível carregar o link do formulário.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function copiarLink() {
        if (!dados.value?.linkFormulario) return false;
        try {
            await navigator.clipboard.writeText(dados.value.linkFormulario);
            copiado.value = true;
            window.setTimeout(() => {
                copiado.value = false;
            }, 2500);
            return true;
        } catch {
            return false;
        }
    }

    return {
        dados,
        carregando,
        erro,
        copiado,
        carregar,
        copiarLink
    };
}
