import { inject, onMounted, ref } from "vue";
import axios from "axios";
import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type { ConsultaAssinaturaProtocoloDTO } from "@/application/dto/Protocolo/ProtocoloAssinaturaDTO";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useProtocoloAssinaturaPublica(tokenRef: () => string) {
    const repoInject = inject<IProtocoloRepository>("IProtocoloRepository");
    if (!repoInject) throw new Error("IProtocoloRepository not provided");
    const repo: IProtocoloRepository = repoInject;

    const carregando = ref(true);
    const dados = ref<ConsultaAssinaturaProtocoloDTO | null>(null);
    const erroConsulta = ref<string | null>(null);
    const enviando = ref(false);
    const erroEnvio = ref<string | null>(null);
    const errosCampo = ref<Record<string, string>>({});

    async function carregar() {
        const token = tokenRef().trim();
        if (!token) {
            erroConsulta.value = "Link inválido.";
            carregando.value = false;
            return;
        }
        carregando.value = true;
        erroConsulta.value = null;
        try {
            dados.value = await repo.consultarAssinaturaPorToken(token);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    erroConsulta.value =
                        "Este link não é válido ou o protocolo não foi encontrado.";
                } else if (status === 422) {
                    erroConsulta.value =
                        d?.message ?? "O link de assinatura está em formato inválido.";
                } else if (status === 429) {
                    erroConsulta.value =
                        "Muitas tentativas. Aguarde um momento e recarregue a página.";
                } else {
                    erroConsulta.value =
                        d?.message ?? "Não foi possível carregar os dados do protocolo.";
                }
            } else {
                erroConsulta.value = "Não foi possível carregar os dados do protocolo.";
            }
        } finally {
            carregando.value = false;
        }
    }

    onMounted(() => {
        void carregar();
    });

    async function enviarAssinatura(nome: string, cpfSomenteDigitos: string) {
        const token = tokenRef().trim();
        erroEnvio.value = null;
        errosCampo.value = {};
        enviando.value = true;
        try {
            await repo.registrarAssinaturaPorToken(token, {
                nome_responsavel_recebimento: nome.trim(),
                cpf_responsavel_recebimento: cpfSomenteDigitos
            });
            dados.value = await repo.consultarAssinaturaPorToken(token);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 409) {
                    erroEnvio.value =
                        d?.message ?? "Este protocolo já foi assinado.";
                    await carregar();
                } else if (status === 422) {
                    const errors = (d?.errors ?? {}) as Record<
                        string,
                        string[] | undefined
                    >;
                    errosCampo.value = {
                        nome_responsavel_recebimento:
                            errors.nome_responsavel_recebimento?.[0] ?? "",
                        cpf_responsavel_recebimento:
                            errors.cpf_responsavel_recebimento?.[0] ?? ""
                    };
                    erroEnvio.value = d?.message ?? "Verifique os dados informados.";
                } else if (status === 404) {
                    erroEnvio.value = "Link inválido ou protocolo não encontrado.";
                } else if (status === 429) {
                    erroEnvio.value =
                        "Muitas tentativas. Aguarde um momento e tente novamente.";
                } else {
                    erroEnvio.value =
                        d?.message ?? "Não foi possível registrar a assinatura.";
                }
            } else {
                erroEnvio.value = "Não foi possível registrar a assinatura.";
            }
        } finally {
            enviando.value = false;
        }
    }

    return {
        carregando,
        dados,
        erroConsulta,
        enviando,
        erroEnvio,
        errosCampo,
        recarregar: carregar,
        enviarAssinatura
    };
}
