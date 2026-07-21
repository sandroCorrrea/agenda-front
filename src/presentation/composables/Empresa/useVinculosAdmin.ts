import { computed, inject, ref } from "vue";
import axios from "axios";
import type {
    ClienteOpcaoVinculoAdminDTO,
    EmpresaOpcaoVinculoAdminDTO,
    EmpresaVinculoDTO
} from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import { AprovarVinculoEmpresaUseCase } from "@/application/use-cases/EmpresaVinculo/AprovarVinculoEmpresaUseCase";
import { CriarVinculoAdminUseCase } from "@/application/use-cases/EmpresaVinculo/CriarVinculoAdminUseCase";
import { ListarClientesOpcoesVinculoAdminUseCase } from "@/application/use-cases/EmpresaVinculo/ListarClientesOpcoesVinculoAdminUseCase";
import { ListarEmpresasOpcoesVinculoAdminUseCase } from "@/application/use-cases/EmpresaVinculo/ListarEmpresasOpcoesVinculoAdminUseCase";
import { ListarVinculosAdminUseCase } from "@/application/use-cases/EmpresaVinculo/ListarVinculosAdminUseCase";
import { RejeitarVinculoEmpresaUseCase } from "@/application/use-cases/EmpresaVinculo/RejeitarVinculoEmpresaUseCase";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";
import type { EmpresaVinculoStatus } from "@/domain/types/EmpresaVinculoStatus";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { useVinculosPendentesAdmin } from "@/presentation/composables/Empresa/useVinculosPendentesAdmin";
import { cnpjMask, cpfMask } from "@/shared/utils/masks";

export type FiltroStatusVinculo = EmpresaVinculoStatus | "";

const POR_PAGINA_PADRAO = 10;

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

function normalizarBusca(texto: string): string {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export function labelClienteOpcao(c: ClienteOpcaoVinculoAdminDTO): string {
    return `${c.nome} — ${cpfMask(c.cpf)} — ${c.email}`;
}

export function labelEmpresaOpcao(e: EmpresaOpcaoVinculoAdminDTO): string {
    const cnpj = cnpjMask(e.cnpj);
    if (e.apelido) return `${e.apelido} (${e.nome}) — ${cnpj}`;
    return `${e.nome} — ${cnpj}`;
}

export function useVinculosAdmin() {
    const repo = inject<IEmpresaVinculoRepository>("IEmpresaVinculoRepository");
    if (!repo) throw new Error("IEmpresaVinculoRepository not provided");

    const listarCaso = new ListarVinculosAdminUseCase(repo);
    const aprovarCaso = new AprovarVinculoEmpresaUseCase(repo);
    const rejeitarCaso = new RejeitarVinculoEmpresaUseCase(repo);
    const criarVinculoCaso = new CriarVinculoAdminUseCase(repo);
    const listarClientesCaso = new ListarClientesOpcoesVinculoAdminUseCase(repo);
    const listarEmpresasCaso = new ListarEmpresasOpcoesVinculoAdminUseCase(repo);
    const { atualizarPendentes } = useVinculosPendentesAdmin();

    const vinculos = ref<EmpresaVinculoDTO[]>([]);
    const carregando = ref(false);
    const processandoId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const paginaAtual = ref(1);
    const totalRegistros = ref(0);
    const porPagina = ref(POR_PAGINA_PADRAO);
    const filtroStatus = ref<FiltroStatusVinculo>("pendente");

    const modalRejeitarId = ref<number | null>(null);
    const justificativaRejeicao = ref("");
    const erroJustificativa = ref<string | null>(null);

    const formularioCriarVisivel = ref(false);
    const clientesOpcoes = ref<ClienteOpcaoVinculoAdminDTO[]>([]);
    const empresasOpcoes = ref<EmpresaOpcaoVinculoAdminDTO[]>([]);
    const carregandoOpcoes = ref(false);
    const erroOpcoes = ref<string | null>(null);
    const filtroCliente = ref("");
    const filtroEmpresa = ref("");
    const usuarioIdSelecionado = ref<number | null>(null);
    const empresaIdSelecionada = ref<number | null>(null);
    const criandoVinculo = ref(false);
    const erroCriacao = ref<string | null>(null);

    const totalPaginas = computed(() =>
        Math.max(1, Math.ceil(totalRegistros.value / Math.max(porPagina.value, 1)))
    );

    const vinculoRejeicao = computed(() =>
        vinculos.value.find((v) => v.id === modalRejeitarId.value) ?? null
    );

    const clientesFiltrados = computed(() => {
        const q = normalizarBusca(filtroCliente.value);
        if (!q) return clientesOpcoes.value;
        return clientesOpcoes.value.filter((c) => {
            const hay = normalizarBusca(
                `${c.nome} ${c.cpf} ${c.email} ${cpfMask(c.cpf)}`
            );
            return hay.includes(q);
        });
    });

    const empresasFiltradas = computed(() => {
        const q = normalizarBusca(filtroEmpresa.value);
        if (!q) return empresasOpcoes.value;
        return empresasOpcoes.value.filter((e) => {
            const hay = normalizarBusca(
                `${e.nome} ${e.apelido ?? ""} ${e.cnpj} ${cnpjMask(e.cnpj)}`
            );
            return hay.includes(q);
        });
    });

    const podeCriarVinculo = computed(
        () =>
            usuarioIdSelecionado.value != null &&
            empresaIdSelecionada.value != null &&
            !criandoVinculo.value
    );

    async function carregar(page = paginaAtual.value) {
        carregando.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute({
                page,
                per_page: porPagina.value,
                status: filtroStatus.value || undefined
            });
            vinculos.value = resp.vinculos;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.por_pagina || POR_PAGINA_PADRAO;
        } catch (e: unknown) {
            erro.value = extrairMensagem(e, "Não foi possível carregar as solicitações.");
        } finally {
            carregando.value = false;
        }
    }

    async function carregarOpcoes() {
        carregandoOpcoes.value = true;
        erroOpcoes.value = null;
        try {
            const [clientes, empresas] = await Promise.all([
                listarClientesCaso.execute(),
                listarEmpresasCaso.execute()
            ]);
            clientesOpcoes.value = clientes;
            empresasOpcoes.value = empresas;
        } catch (e: unknown) {
            erroOpcoes.value = extrairMensagem(
                e,
                "Não foi possível carregar as opções de clientes e empresas."
            );
        } finally {
            carregandoOpcoes.value = false;
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
        const paginaAntes = paginaAtual.value;
        try {
            const resp = await aprovarCaso.execute(vinculoId);
            sucesso.value = resp.message;
            await carregar(paginaAntes);
            if (vinculos.value.length === 0 && paginaAntes > 1) {
                await carregar(paginaAntes - 1);
            }
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
        const paginaAntes = paginaAtual.value;

        try {
            const resp = await rejeitarCaso.execute(id, texto);
            sucesso.value = resp.message;
            fecharModalRejeitar();
            await carregar(paginaAntes);
            if (vinculos.value.length === 0 && paginaAntes > 1) {
                await carregar(paginaAntes - 1);
            }
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

    async function abrirFormularioCriar() {
        formularioCriarVisivel.value = true;
        erroCriacao.value = null;
        if (clientesOpcoes.value.length === 0 || empresasOpcoes.value.length === 0) {
            await carregarOpcoes();
        }
    }

    function fecharFormularioCriar() {
        formularioCriarVisivel.value = false;
        limparFormularioCriar();
    }

    function limparFormularioCriar() {
        filtroCliente.value = "";
        filtroEmpresa.value = "";
        usuarioIdSelecionado.value = null;
        empresaIdSelecionada.value = null;
        erroCriacao.value = null;
    }

    async function criarVinculo() {
        const usuarioId = usuarioIdSelecionado.value;
        const empresaId = empresaIdSelecionada.value;
        if (usuarioId == null || empresaId == null) {
            erroCriacao.value =
                "Selecione a pessoa física e a empresa antes de vincular.";
            return;
        }

        erro.value = null;
        sucesso.value = null;
        erroCriacao.value = null;
        criandoVinculo.value = true;

        try {
            const resp = await criarVinculoCaso.execute({
                usuario_id: usuarioId,
                empresa_id: empresaId
            });
            sucesso.value = resp.message;
            limparFormularioCriar();
            formularioCriarVisivel.value = false;
            filtroStatus.value = "aprovado";
            await carregar(1);
            await atualizarPendentes();
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 409) {
                    erroCriacao.value =
                        "Já existe vinculação pendente ou aprovada entre este cliente e esta empresa.";
                } else if (status === 403) {
                    erroCriacao.value = extrairMensagem(
                        e,
                        "Você não tem permissão para criar vinculações (perfil contabilidade)."
                    );
                } else if (status === 404) {
                    erroCriacao.value =
                        "Cliente ou empresa não encontrados. Atualize as opções e tente novamente.";
                } else if (status === 422) {
                    erroCriacao.value = extrairMensagem(
                        e,
                        "Dados inválidos para criar a vinculação."
                    );
                } else {
                    erroCriacao.value = extrairMensagem(
                        e,
                        "Não foi possível criar a vinculação."
                    );
                }
            } else {
                erroCriacao.value = extrairMensagem(
                    e,
                    "Não foi possível criar a vinculação."
                );
            }
        } finally {
            criandoVinculo.value = false;
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
        formularioCriarVisivel,
        clientesOpcoes,
        empresasOpcoes,
        clientesFiltrados,
        empresasFiltradas,
        carregandoOpcoes,
        erroOpcoes,
        filtroCliente,
        filtroEmpresa,
        usuarioIdSelecionado,
        empresaIdSelecionada,
        criandoVinculo,
        erroCriacao,
        podeCriarVinculo,
        carregar,
        carregarOpcoes,
        aplicarFiltroStatus,
        irParaPagina,
        aprovar,
        abrirModalRejeitar,
        fecharModalRejeitar,
        confirmarRejeicao,
        abrirFormularioCriar,
        fecharFormularioCriar,
        limparFormularioCriar,
        criarVinculo
    };
}
