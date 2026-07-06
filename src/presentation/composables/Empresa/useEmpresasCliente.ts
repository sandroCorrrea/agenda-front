import { computed, inject, ref } from "vue";
import axios from "axios";
import type { EmpresaVinculoDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import { BuscarEmpresaPorCnpjUseCase } from "@/application/use-cases/Matriz/BuscarEmpresaPorCnpjUseCase";
import { CriarEmpresaUseCase } from "@/application/use-cases/Matriz/CriarEmpresaUseCase";
import { ListarVinculosClienteUseCase } from "@/application/use-cases/EmpresaVinculo/ListarVinculosClienteUseCase";
import { SolicitarVinculoEmpresaUseCase } from "@/application/use-cases/EmpresaVinculo/SolicitarVinculoEmpresaUseCase";
import type {
    EmpresaListagemDTO,
    IMatrizRepository
} from "@/domain/repositories/IMatrizRepository";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";
import type { EmpresaVinculoStatus } from "@/domain/types/EmpresaVinculoStatus";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { buscarReceitaWsCnpj } from "@/presentation/composables/Empresa/useReceitaWsCnpj";
import type { ReceitaWsCnpjResponseDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsCnpjResponseDTO";
import { onlyNumbers } from "@/shared/utils/masks";
import { receitaWsParaEmpresaUpsert } from "@/shared/utils/receitaWsParaEmpresaUpsert";

export type OrigemBuscaEmpresa = "local" | "receita";

export type ResultadoBuscaCnpj =
    | { origem: "local"; empresa: EmpresaListagemDTO }
    | { origem: "receita"; consulta: ReceitaWsCnpjResponseDTO };

function mensagemErroBuscaCnpj(e: unknown): string {
    if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        const data = e.response?.data as ErroResponseDTO | undefined;

        if (status === 422) {
            const cnpjErro = data?.errors?.cnpj;
            if (Array.isArray(cnpjErro) && cnpjErro[0]) {
                return String(cnpjErro[0]);
            }
            return data?.message?.trim() || "CNPJ inválido.";
        }
        if (status === 403) {
            return (
                data?.message?.trim() ||
                "Consulta não permitida. Informe um CNPJ válido com 14 dígitos."
            );
        }
    }
    return extrairMensagemErro(e, "Não foi possível verificar a empresa no cadastro local.");
}

function extrairMensagemErro(e: unknown, fallback: string): string {
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

export function useEmpresasCliente() {
    const matrizRepo = inject<IMatrizRepository>("IMatrizRepository");
    const vinculoRepo = inject<IEmpresaVinculoRepository>("IEmpresaVinculoRepository");
    if (!matrizRepo) throw new Error("IMatrizRepository not provided");
    if (!vinculoRepo) throw new Error("IEmpresaVinculoRepository not provided");

    const buscarLocalCaso = new BuscarEmpresaPorCnpjUseCase(matrizRepo);
    const criarEmpresaCaso = new CriarEmpresaUseCase(matrizRepo);
    const listarVinculosCaso = new ListarVinculosClienteUseCase(vinculoRepo);
    const solicitarVinculoCaso = new SolicitarVinculoEmpresaUseCase(vinculoRepo);

    const cnpjBusca = ref("");
    const buscandoCnpj = ref(false);
    const erroBusca = ref<string | null>(null);
    const resultadoBusca = ref<ResultadoBuscaCnpj | null>(null);

    const vinculos = ref<EmpresaVinculoDTO[]>([]);
    const carregandoVinculos = ref(false);
    const erroVinculos = ref<string | null>(null);
    const paginaAtual = ref(1);
    const totalRegistros = ref(0);
    const porPagina = ref(10);

    const solicitando = ref(false);
    const cadastrandoReceita = ref(false);
    const erroSolicitacao = ref<string | null>(null);
    const sucessoSolicitacao = ref<string | null>(null);

    const totalPaginas = computed(() =>
        Math.max(1, Math.ceil(totalRegistros.value / Math.max(porPagina.value, 1)))
    );

    const listaVinculosVazia = computed(
        () => !carregandoVinculos.value && vinculos.value.length === 0
    );

    const empresaEncontradaLocal = computed(() =>
        resultadoBusca.value?.origem === "local" ? resultadoBusca.value.empresa : null
    );

    const consultaReceita = computed(() =>
        resultadoBusca.value?.origem === "receita" ? resultadoBusca.value.consulta : null
    );

    function vinculoDaEmpresa(empresaId: number): EmpresaVinculoDTO | undefined {
        return vinculos.value.find((v) => v.empresa_id === empresaId);
    }

    function podeSolicitarVinculo(empresaId: number): boolean {
        const existente = vinculoDaEmpresa(empresaId);
        if (!existente) return true;
        return existente.status === "rejeitado";
    }

    function rotuloAcaoVinculo(status: EmpresaVinculoStatus | undefined): string {
        if (!status) return "Solicitar vinculação";
        if (status === "rejeitado") return "Solicitar novamente";
        return "Solicitação enviada";
    }

    async function carregarVinculos(page = paginaAtual.value) {
        carregandoVinculos.value = true;
        erroVinculos.value = null;
        try {
            const resp = await listarVinculosCaso.execute(page);
            vinculos.value = resp.vinculos;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.por_pagina;
        } catch (e: unknown) {
            erroVinculos.value = extrairMensagemErro(
                e,
                "Não foi possível carregar suas vinculações."
            );
        } finally {
            carregandoVinculos.value = false;
        }
    }

    function limparBusca() {
        cnpjBusca.value = "";
        resultadoBusca.value = null;
        erroBusca.value = null;
        erroSolicitacao.value = null;
        sucessoSolicitacao.value = null;
    }

    async function buscarPorCnpj() {
        erroBusca.value = null;
        erroSolicitacao.value = null;
        sucessoSolicitacao.value = null;
        resultadoBusca.value = null;

        const digits = onlyNumbers(cnpjBusca.value);
        if (digits.length !== 14) {
            erroBusca.value = "Informe um CNPJ válido com 14 dígitos.";
            return;
        }

        buscandoCnpj.value = true;
        try {
            const { existeLocalmente, empresa } =
                await buscarLocalCaso.verificarAntesVinculo(digits);

            if (existeLocalmente && empresa) {
                resultadoBusca.value = { origem: "local", empresa };
                return;
            }

            const receita = await buscarReceitaWsCnpj(digits);
            resultadoBusca.value = { origem: "receita", consulta: receita };
        } catch (e: unknown) {
            erroBusca.value = mensagemErroBuscaCnpj(e);
        } finally {
            buscandoCnpj.value = false;
        }
    }

    async function solicitarVinculo(empresaId: number) {
        erroSolicitacao.value = null;
        sucessoSolicitacao.value = null;

        if (!podeSolicitarVinculo(empresaId)) {
            erroSolicitacao.value =
                "Já existe uma solicitação pendente ou aprovada para esta empresa.";
            return;
        }

        solicitando.value = true;
        try {
            const resp = await solicitarVinculoCaso.execute(empresaId);
            sucessoSolicitacao.value = resp.message;
            await carregarVinculos(paginaAtual.value);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 409) {
                    erroSolicitacao.value =
                        "Você já possui uma solicitação pendente ou aprovada para esta empresa.";
                } else if (status === 404) {
                    erroSolicitacao.value = "Empresa não encontrada no sistema.";
                } else if (status === 422) {
                    erroSolicitacao.value = extrairMensagemErro(
                        e,
                        "Dados inválidos para solicitação."
                    );
                } else {
                    erroSolicitacao.value = extrairMensagemErro(
                        e,
                        "Não foi possível enviar a solicitação."
                    );
                }
            } else {
                erroSolicitacao.value = extrairMensagemErro(
                    e,
                    "Não foi possível enviar a solicitação."
                );
            }
        } finally {
            solicitando.value = false;
        }
    }

    async function cadastrarESolicitarVinculoDaReceita() {
        const consulta = consultaReceita.value;
        if (!consulta) return;

        erroSolicitacao.value = null;
        sucessoSolicitacao.value = null;
        cadastrandoReceita.value = true;

        try {
            const dto = receitaWsParaEmpresaUpsert(consulta);
            let empresa: EmpresaListagemDTO;

            try {
                empresa = await criarEmpresaCaso.execute(dto);
            } catch (e: unknown) {
                if (axios.isAxiosError(e) && e.response?.status === 409) {
                    const existente = await buscarLocalCaso.execute(dto.cnpj);
                    if (!existente) throw e;
                    empresa = existente;
                } else {
                    throw e;
                }
            }

            resultadoBusca.value = { origem: "local", empresa };

            if (!podeSolicitarVinculo(empresa.id)) {
                erroSolicitacao.value =
                    "Já existe uma solicitação pendente ou aprovada para esta empresa.";
                return;
            }

            const resp = await solicitarVinculoCaso.execute(empresa.id);
            sucessoSolicitacao.value = resp.message;
            await carregarVinculos(paginaAtual.value);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 403) {
                    erroSolicitacao.value = extrairMensagemErro(
                        e,
                        "Você não tem permissão para cadastrar esta empresa."
                    );
                } else if (status === 422) {
                    erroSolicitacao.value = extrairMensagemErro(
                        e,
                        "Dados da empresa incompletos para cadastro."
                    );
                } else {
                    erroSolicitacao.value = extrairMensagemErro(
                        e,
                        "Não foi possível cadastrar a empresa e solicitar vinculação."
                    );
                }
            } else {
                erroSolicitacao.value = extrairMensagemErro(
                    e,
                    "Não foi possível cadastrar a empresa e solicitar vinculação."
                );
            }
        } finally {
            cadastrandoReceita.value = false;
        }
    }

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas.value || carregandoVinculos.value) return;
        await carregarVinculos(page);
    }

    async function buscarInicial() {
        await carregarVinculos(1);
    }

    async function recarregarVinculos() {
        await carregarVinculos(paginaAtual.value);
    }

    return {
        cnpjBusca,
        buscandoCnpj,
        erroBusca,
        resultadoBusca,
        empresaEncontradaLocal,
        consultaReceita,
        vinculos,
        carregandoVinculos,
        erroVinculos,
        paginaAtual,
        totalRegistros,
        porPagina,
        totalPaginas,
        listaVinculosVazia,
        solicitando,
        cadastrandoReceita,
        erroSolicitacao,
        sucessoSolicitacao,
        vinculoDaEmpresa,
        podeSolicitarVinculo,
        rotuloAcaoVinculo,
        buscarPorCnpj,
        limparBusca,
        solicitarVinculo,
        cadastrarESolicitarVinculoDaReceita,
        carregarVinculos,
        irParaPagina,
        buscarInicial,
        recarregarVinculos
    };
}
