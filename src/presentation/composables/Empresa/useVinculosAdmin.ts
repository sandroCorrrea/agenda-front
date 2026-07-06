import { computed, inject, ref } from "vue";
import axios from "axios";
import type { EmpresaVinculoDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import { AprovarVinculoEmpresaUseCase } from "@/application/use-cases/EmpresaVinculo/AprovarVinculoEmpresaUseCase";
import { ListarVinculosAdminUseCase } from "@/application/use-cases/EmpresaVinculo/ListarVinculosAdminUseCase";
import { RejeitarVinculoEmpresaUseCase } from "@/application/use-cases/EmpresaVinculo/RejeitarVinculoEmpresaUseCase";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";
import type { EmpresaVinculoStatus } from "@/domain/types/EmpresaVinculoStatus";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { useVinculosPendentesAdmin } from "@/presentation/composables/Empresa/useVinculosPendentesAdmin";

export type FiltroStatusVinculo = EmpresaVinculoStatus | "";

function extrairMensagem(e: unknown, fallback: string): string {
    if (axios.isAxiosError(e)) {
        const data = e.response?.data as ErroResponseDTO | undefined;
        const msg = data?.message?.trim();
        if (msg) return msg;
        const errors = data?.errors;
        if (errors && typeof errors === "object") {
            for (const v of Object.values(errors)) {
                if (Array.isArray(v) && v[0]) return String(v[0]);
            }
        }
    }
    if (e instanceof Error && e.message) return e.message;
    return fallback;
}

export function useVinculosAdmin() {
    const repo = inject<IEmpresaVinculoRepository>("IEmpresaVinculoRepository");
    if (!repo) throw new Error("IEmpresaVinculoRepository not provided");

    const listarCaso = new ListarVinculosAdminUseCase(repo);
    const aprovarCaso = new AprovarVinculoEmpresaUseCase(repo);
    const rejeitarCaso = new RejeitarVinculoEmpresaUseCase(repo);
    const { atualizarPendentes } = useVinculosPendentesAdmin();

    const vinculos = ref<EmpresaVinculoDTO[]>([]);
    const carregando = ref(false);
    const processandoId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const paginaAtual = ref(1);
    const totalRegistros = ref(0);
    const porPagina = ref(10);
    const filtroStatus = ref<FiltroStatusVinculo>("pendente");

    const modalRejeitarId = ref<number | null>(null);
    const justificativaRejeicao = ref("");
    const erroJustificativa = ref<string | null>(null);

    const totalPaginas = computed(() =>
        Math.max(1, Math.ceil(totalRegistros.value / Math.max(porPagina.value, 1)))
    );

    const vinculoRejeicao = computed(() =>
        vinculos.value.find((v) => v.id === modalRejeitarId.value) ?? null
    );

    async function carregar(page = paginaAtual.value) {
        carregando.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute({
                page,
                status: filtroStatus.value || undefined
            });
            vinculos.value = resp.vinculos;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.por_pagina;
        } catch (e: unknown) {
            erro.value = extrairMensagem(e, "Não foi possível carregar as solicitações.");
        } finally {
            carregando.value = false;
        }
    }

    async function aplicarFiltroStatus(status: FiltroStatusVinculo) {
        filtroStatus.value = status;
        await carregar(1);
    }

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas.value || carregando.value) return;
        await carregar(page);
    }

    async function aprovar(vinculoId: number) {
        erro.value = null;
        sucesso.value = null;
        processandoId.value = vinculoId;
        try {
            const resp = await aprovarCaso.execute(vinculoId);
            sucesso.value = resp.message;
            await carregar(paginaAtual.value);
            await atualizarPendentes();
        } catch (e: unknown) {
            erro.value = extrairMensagem(e, "Não foi possível aprovar a vinculação.");
        } finally {
            processandoId.value = null;
        }
    }

    function abrirModalRejeitar(vinculoId: number) {
        modalRejeitarId.value = vinculoId;
        justificativaRejeicao.value = "";
        erroJustificativa.value = null;
    }

    function fecharModalRejeitar() {
        modalRejeitarId.value = null;
        justificativaRejeicao.value = "";
        erroJustificativa.value = null;
    }

    async function confirmarRejeicao() {
        const id = modalRejeitarId.value;
        if (id == null) return;

        const texto = justificativaRejeicao.value.trim();
        if (texto.length < 10) {
            erroJustificativa.value = "A justificativa deve ter no mínimo 10 caracteres.";
            return;
        }
        if (texto.length > 1000) {
            erroJustificativa.value = "A justificativa deve ter no máximo 1000 caracteres.";
            return;
        }

        erro.value = null;
        sucesso.value = null;
        erroJustificativa.value = null;
        processandoId.value = id;

        try {
            const resp = await rejeitarCaso.execute(id, texto);
            sucesso.value = resp.message;
            fecharModalRejeitar();
            await carregar(paginaAtual.value);
            await atualizarPendentes();
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 422) {
                erroJustificativa.value = extrairMensagem(
                    e,
                    "Justificativa inválida."
                );
            } else {
                erro.value = extrairMensagem(e, "Não foi possível rejeitar a vinculação.");
                fecharModalRejeitar();
            }
        } finally {
            processandoId.value = null;
        }
    }

    return {
        vinculos,
        carregando,
        processandoId,
        erro,
        sucesso,
        paginaAtual,
        totalRegistros,
        porPagina,
        filtroStatus,
        totalPaginas,
        modalRejeitarId,
        justificativaRejeicao,
        erroJustificativa,
        vinculoRejeicao,
        carregar,
        aplicarFiltroStatus,
        irParaPagina,
        aprovar,
        abrirModalRejeitar,
        fecharModalRejeitar,
        confirmarRejeicao
    };
}
