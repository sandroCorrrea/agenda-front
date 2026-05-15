import { computed, inject, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";
import type { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";
import { ObterHomeCarrosselImagemPorIdUseCase } from "@/application/use-cases/HomeCarrosselImagem/ObterHomeCarrosselImagemPorIdUseCase";
import { AtualizarHomeCarrosselImagemUseCase } from "@/application/use-cases/HomeCarrosselImagem/AtualizarHomeCarrosselImagemUseCase";
import { HomeCarrosselImagemUpdateRequestDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemUpdateRequestDTO";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { traduzirErroImagemCarrossel } from "./erroImagemCarrossel";

export function useEditarHomeCarrosselImagem() {
    const route = useRoute();
    const repo = inject<IHomeCarrosselImagemRepository>(
        "IHomeCarrosselImagemRepository"
    );
    if (!repo) throw new Error("IHomeCarrosselImagemRepository not provided");

    const obterCaso = new ObterHomeCarrosselImagemPorIdUseCase(repo);
    const atualizarCaso = new AtualizarHomeCarrosselImagemUseCase(repo);

    const imagemId = computed(() => Number(route.params.id));
    const carregando = ref(false);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const naoEncontrado = ref(false);
    const erroCampos = ref<Record<string, string>>({});

    const imagemAtual = ref<HomeCarrosselImagem | null>(null);

    const form = reactive({
        titulo: "",
        altText: "",
        ordem: 0,
        ativo: true,
        linkUrl: "",
        abrirEmNovaAba: false,
        novaImagem: null as File | null
    });

    async function carregar() {
        carregando.value = true;
        erro.value = null;
        naoEncontrado.value = false;
        try {
            const id = imagemId.value;
            if (!id || Number.isNaN(id)) {
                naoEncontrado.value = true;
                return;
            }
            const data = await obterCaso.execute(id);
            imagemAtual.value = data;
            form.titulo = data.titulo ?? "";
            form.altText = data.altText ?? "";
            form.ordem = Number(data.ordem ?? 0);
            form.ativo = Boolean(data.ativo);
            form.linkUrl = data.linkUrl ?? "";
            form.abrirEmNovaAba = Boolean(data.abrirEmNovaAba);
            form.novaImagem = null;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Imagem do carrossel não encontrada.";
                } else {
                    erro.value = d?.message ?? "Não foi possível carregar a imagem.";
                }
            } else {
                erro.value = "Não foi possível carregar a imagem.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function salvar() {
        const id = imagemId.value;
        if (!id || Number.isNaN(id)) return;
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const dto = new HomeCarrosselImagemUpdateRequestDTO(
                form.titulo.trim(),
                Number.isFinite(form.ordem) ? form.ordem : 0,
                form.ativo,
                form.abrirEmNovaAba,
                form.altText.trim() === "" ? null : form.altText.trim(),
                form.linkUrl.trim() === "" ? null : form.linkUrl.trim(),
                form.novaImagem ?? undefined
            );
            const atualizado = await atualizarCaso.execute(id, dto);
            imagemAtual.value = atualizado;
            form.titulo = atualizado.titulo;
            form.altText = atualizado.altText ?? "";
            form.ordem = atualizado.ordem;
            form.ativo = atualizado.ativo;
            form.linkUrl = atualizado.linkUrl ?? "";
            form.abrirEmNovaAba = atualizado.abrirEmNovaAba;
            form.novaImagem = null;
            sucesso.value = "Imagem do carrossel atualizada com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Imagem do carrossel não encontrada.";
                } else if (status === 422) {
                    const msgImagem = traduzirErroImagemCarrossel(
                        d?.errors?.imagem?.[0] ?? d?.errors?.imagem_base64?.[0]
                    );
                    erroCampos.value = {
                        titulo: d?.errors?.titulo?.[0] ?? "",
                        imagem: msgImagem,
                        ordem: d?.errors?.ordem?.[0] ?? "",
                        ativo: d?.errors?.ativo?.[0] ?? "",
                        alt_text: d?.errors?.alt_text?.[0] ?? "",
                        link_url: d?.errors?.link_url?.[0] ?? "",
                        abrir_em_nova_aba: d?.errors?.abrir_em_nova_aba?.[0] ?? ""
                    };
                    erro.value =
                        msgImagem ||
                        d?.message?.trim() ||
                        erroCampos.value.titulo ||
                        "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível atualizar agora. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível atualizar a imagem.";
                }
            } else {
                erro.value = "Não foi possível atualizar a imagem.";
            }
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    return {
        imagemId,
        form,
        imagemAtual,
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
