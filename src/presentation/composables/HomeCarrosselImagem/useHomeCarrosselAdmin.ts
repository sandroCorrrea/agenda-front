import { computed, inject, ref } from "vue";
import axios from "axios";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";
import type { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";
import { ListarHomeCarrosselAdminUseCase } from "@/application/use-cases/HomeCarrosselImagem/ListarHomeCarrosselAdminUseCase";
import { CriarHomeCarrosselImagemUseCase } from "@/application/use-cases/HomeCarrosselImagem/CriarHomeCarrosselImagemUseCase";
import { ExcluirHomeCarrosselImagemUseCase } from "@/application/use-cases/HomeCarrosselImagem/ExcluirHomeCarrosselImagemUseCase";
import { HomeCarrosselImagemPostRequestDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemPostRequestDTO";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { traduzirErroImagemCarrossel } from "./erroImagemCarrossel";

const POR_PAGINA_PADRAO = 6;

export interface CriarHomeCarrosselPayload {
    titulo: string;
    imagem: File;
    ordem: number;
    ativo: boolean;
    abrirEmNovaAba: boolean;
    altText: string | null;
    linkUrl: string | null;
}

export function useHomeCarrosselAdmin() {
    const repo = inject<IHomeCarrosselImagemRepository>(
        "IHomeCarrosselImagemRepository"
    );
    if (!repo) throw new Error("IHomeCarrosselImagemRepository not provided");

    const listarCaso = new ListarHomeCarrosselAdminUseCase(repo);
    const criarCaso = new CriarHomeCarrosselImagemUseCase(repo);
    const excluirCaso = new ExcluirHomeCarrosselImagemUseCase(repo);

    const imagens = ref<HomeCarrosselImagem[]>([]);
    const carregandoLista = ref(false);
    const criando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const erroCampos = ref<Record<string, string>>({});

    const paginaAtual = ref(1);
    const porPagina = ref(POR_PAGINA_PADRAO);
    const totalRegistros = ref(0);

    const excluindoId = ref<number | null>(null);
    const modalExcluirId = ref<number | null>(null);

    const imagemExclusaoTitulo = computed(() => {
        const id = modalExcluirId.value;
        if (id == null) return "";
        return imagens.value.find((it) => it.id === id)?.titulo ?? "";
    });

    const totalPaginas = () =>
        Math.max(1, Math.ceil(totalRegistros.value / (porPagina.value || 1)));

    async function carregar(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute({
                page,
                per_page: porPagina.value
            });
            imagens.value = resp.imagens;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina || 1;
            porPagina.value = resp.porPagina || POR_PAGINA_PADRAO;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO | undefined;
                erro.value =
                    d?.message ?? "Não foi possível carregar as imagens do carrossel.";
            } else {
                erro.value = "Não foi possível carregar as imagens do carrossel.";
            }
            throw e;
        } finally {
            carregandoLista.value = false;
        }
    }

    async function criar(payload: CriarHomeCarrosselPayload) {
        criando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const criado = await criarCaso.execute(
                new HomeCarrosselImagemPostRequestDTO(
                    payload.titulo,
                    payload.imagem,
                    payload.ordem,
                    payload.ativo,
                    payload.abrirEmNovaAba,
                    payload.altText,
                    payload.linkUrl
                )
            );
            sucesso.value = "Imagem do carrossel criada com sucesso.";
            imagens.value = [criado, ...imagens.value];
            totalRegistros.value += 1;
            if (imagens.value.length > porPagina.value) {
                imagens.value = imagens.value.slice(0, porPagina.value);
            }
            return criado;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
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
                if (status != null && status >= 500) {
                    erro.value =
                        "Erro interno no servidor (HTTP " +
                        status +
                        "). O envio em Base64 também falhou. Verifique storage/logs/laravel.log no agenda-service na mesma hora da tentativa.";
                } else {
                    erro.value =
                        msgImagem ||
                        d?.message ||
                        erroCampos.value.titulo ||
                        "Não foi possível criar a imagem do carrossel.";
                }
            } else {
                erro.value = "Não foi possível criar a imagem do carrossel.";
            }
            throw e;
        } finally {
            criando.value = false;
        }
    }

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas()) return;
        await carregar(page);
    }

    function abrirModalExcluir(id: number) {
        modalExcluirId.value = id;
    }

    function fecharModalExcluir() {
        if (excluindoId.value !== null) return;
        modalExcluirId.value = null;
    }

    async function executarExclusao(id: number) {
        excluindoId.value = id;
        erro.value = null;
        sucesso.value = null;
        const paginaAntes = paginaAtual.value;
        try {
            await excluirCaso.execute(id);
            sucesso.value = "Imagem do carrossel excluída com sucesso.";
            await carregar(paginaAntes);
            if (imagens.value.length === 0 && paginaAntes > 1) {
                await carregar(paginaAntes - 1);
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 404) {
                    erro.value = "Imagem do carrossel não encontrada.";
                    await carregar(paginaAntes);
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível excluir agora. Tente novamente.";
                } else {
                    const d = e.response?.data as ErroResponseDTO | undefined;
                    erro.value = d?.message ?? "Não foi possível excluir.";
                }
            } else {
                erro.value = "Não foi possível excluir a imagem.";
            }
        } finally {
            excluindoId.value = null;
        }
    }

    async function confirmarExclusao() {
        const id = modalExcluirId.value;
        if (id == null) return;
        try {
            await executarExclusao(id);
        } finally {
            modalExcluirId.value = null;
        }
    }

    return {
        imagens,
        carregandoLista,
        criando,
        excluindoId,
        modalExcluirId,
        imagemExclusaoTitulo,
        erro,
        sucesso,
        erroCampos,
        paginaAtual,
        porPagina,
        totalRegistros,
        totalPaginas,
        carregar,
        criar,
        irParaPagina,
        abrirModalExcluir,
        fecharModalExcluir,
        confirmarExclusao
    };
}
