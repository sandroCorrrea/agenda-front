import { ConsultarParticipacaoPublicaUseCase } from "@/application/use-cases/Participacao/ConsultarParticipacaoPublicaUseCase";
import { GetParticipacaoOpcoesUseCase } from "@/application/use-cases/Participacao/GetParticipacaoOpcoesUseCase";
import type { ParticipacaoConsultaPublicaItemDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaItemDTO";
import type { ParticipacaoOpcoesResponseDTO } from "@/application/dto/Participacao/ParticipacaoOpcoesResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";
import axios from "axios";
import { inject, ref } from "vue";

export function useParticipacaoConsultaPublica() {
    const repo = inject<IParticipacaoRepository | null>("IParticipacaoRepository", null);
    if (!repo) throw new Error("IParticipacaoRepository not found");

    const consultarCaso = new ConsultarParticipacaoPublicaUseCase(repo);
    const opcoesCaso = new GetParticipacaoOpcoesUseCase(repo);

    const opcoes = ref<ParticipacaoOpcoesResponseDTO | null>(null);
    const resultados = ref<ParticipacaoConsultaPublicaItemDTO[]>([]);
    const carregando = ref(false);
    const carregandoOpcoes = ref(false);
    const consultou = ref(false);
    const erro = ref<string | null>(null);

    async function carregarOpcoes() {
        carregandoOpcoes.value = true;
        try {
            opcoes.value = await opcoesCaso.execute();
        } catch {
            /* labels usam fallback do value */
        } finally {
            carregandoOpcoes.value = false;
        }
    }

    async function consultar(params: { protocolo?: string; email?: string }) {
        const protocoloTexto = (params.protocolo ?? "").trim();
        const emailTexto = (params.email ?? "").trim().toLowerCase();

        erro.value = null;
        resultados.value = [];
        consultou.value = false;

        const temProtocolo = protocoloTexto.length > 0;
        const temEmail = emailTexto.length > 0;

        if (!temProtocolo && !temEmail) {
            erro.value = "Informe o número do protocolo ou o e-mail usado no envio.";
            return;
        }

        let protocoloNum: number | undefined;
        if (temProtocolo) {
            protocoloNum = Number(protocoloTexto.replace(/\D/g, ""));
            if (!Number.isFinite(protocoloNum) || protocoloNum <= 0) {
                erro.value = "Informe um número de protocolo válido.";
                return;
            }
        }

        if (temEmail && !/\S+@\S+\.\S+/.test(emailTexto)) {
            erro.value = "Informe um e-mail válido.";
            return;
        }

        carregando.value = true;
        try {
            const resp = await consultarCaso.execute({
                protocolo: protocoloNum,
                email: temEmail ? emailTexto : undefined
            });
            resultados.value = resp.participacao;
            consultou.value = true;
            if (resp.participacao.length === 0) {
                erro.value =
                    "Nenhuma contribuição encontrada com os dados informados. Confira o protocolo ou o e-mail.";
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const data = e.response?.data as { message?: string } | undefined;
                if (status === 404) {
                    erro.value =
                        data?.message ??
                        "Nenhuma contribuição encontrada com os dados informados.";
                    consultou.value = true;
                } else if (status === 422) {
                    erro.value =
                        data?.message ?? "Dados inválidos. Revise protocolo ou e-mail.";
                } else if (status === 429) {
                    erro.value =
                        "Muitas consultas em pouco tempo. Aguarde um minuto e tente novamente.";
                } else {
                    erro.value =
                        data?.message ??
                        "Não foi possível consultar o status agora. Tente novamente em instantes.";
                }
            } else {
                erro.value = "Não foi possível consultar o status agora.";
            }
        } finally {
            carregando.value = false;
        }
    }

    function limpar() {
        resultados.value = [];
        consultou.value = false;
        erro.value = null;
    }

    return {
        opcoes,
        resultados,
        carregando,
        carregandoOpcoes,
        consultou,
        erro,
        carregarOpcoes,
        consultar,
        limpar
    };
}
