import { computed, inject, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { ObterAvisoPorIdUseCase } from "@/application/use-cases/Aviso/ObterAvisoPorIdUseCase";
import { AtualizarAvisoUseCase } from "@/application/use-cases/Aviso/AtualizarAvisoUseCase";
import { AvisoUpdateRequestDTO } from "@/application/dto/Aviso/AvisoUpdateRequestDTO";
import type { AvisoListagemDTO } from "@/application/dto/Aviso/AvisoListagemDTO";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { useAuthStore } from "@/presentation/store/useAuthStore";

export function useEditarAviso() {
    const route = useRoute();
    const auth = useAuthStore();
    const repo = inject<IAvisoRepository>("IAvisoRepository");
    if (!repo) throw new Error("IAvisoRepository not provided");

    const obterCaso = new ObterAvisoPorIdUseCase(repo);
    const atualizarCaso = new AtualizarAvisoUseCase(repo);

    const avisoId = computed(() => Number(route.params.id));
    const carregando = ref(false);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const naoEncontrado = ref(false);
    const erroCampos = ref<Record<string, string>>({});
    const avisoAtual = ref<AvisoListagemDTO | null>(null);

    const form = reactive({
        nome: "",
        descricao: ""
    });

    /** ID do usuário vinculado ao aviso (não exibido no formulário). */
    const usuarioIdEnvio = ref<number | null>(null);

    async function carregar() {
        carregando.value = true;
        erro.value = null;
        naoEncontrado.value = false;
        try {
            const id = avisoId.value;
            if (!id || Number.isNaN(id)) {
                naoEncontrado.value = true;
                return;
            }
            const data = await obterCaso.execute(id);
            avisoAtual.value = data;
            form.nome = data.nome ?? "";
            form.descricao = data.descricao ?? "";
            usuarioIdEnvio.value =
                data.usuario?.id ?? auth.usuario?.id ?? null;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Aviso não encontrado ou expirado.";
                } else {
                    erro.value = d?.message ?? "Não foi possível carregar o aviso.";
                }
            } else {
                erro.value = "Não foi possível carregar o aviso.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function salvar() {
        const id = avisoId.value;
        if (!id || Number.isNaN(id)) return;
        const uid =
            usuarioIdEnvio.value ?? avisoAtual.value?.usuario?.id ?? auth.usuario?.id;
        if (!uid) {
            erro.value =
                "Não foi possível identificar o usuário vinculado ao aviso.";
            return;
        }
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const atualizado = await atualizarCaso.execute(
                id,
                new AvisoUpdateRequestDTO(
                    form.nome.trim(),
                    form.descricao.trim(),
                    uid
                )
            );
            avisoAtual.value = atualizado;
            usuarioIdEnvio.value =
                atualizado.usuario?.id ?? uid;
            sucesso.value = "Aviso atualizado com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    erro.value = "Aviso não encontrado ou expirado.";
                    naoEncontrado.value = true;
                } else if (status === 422) {
                    const msgUsuario = d?.errors?.usuario_id?.[0] ?? "";
                    erroCampos.value = {
                        nome: d?.errors?.nome?.[0] ?? "",
                        descricao:
                            d?.errors?.descricao?.[0] ??
                            d?.errors?.mensagem?.[0] ??
                            ""
                    };
                    erro.value =
                        d?.message?.trim() ||
                        msgUsuario ||
                        "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível atualizar o aviso. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível atualizar o aviso.";
                }
            } else {
                erro.value = "Não foi possível atualizar o aviso.";
            }
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    return {
        avisoId,
        form,
        avisoAtual,
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
