import { computed, inject, reactive, ref, watch } from "vue";
import type {
    EmpresaListagemDTO,
    IMatrizRepository
} from "@/domain/repositories/IMatrizRepository";
import {
    ReceitaWsAtividadeDTO
} from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import {
    ReceitaWsSocioDTO
} from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";
import { CriarEmpresaUseCase } from "@/application/use-cases/Matriz/CriarEmpresaUseCase";
import { ListarEmpresasUseCase } from "@/application/use-cases/Matriz/ListarEmpresasUseCase";
import { EmpresaUpsertDTO } from "@/application/dto/Empresa/EmpresaUpsertDTO";
import { buscarReceitaWsCnpj } from "@/presentation/composables/Empresa/useReceitaWsCnpj";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import type { ReceitaWsCnpjResponseDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsCnpjResponseDTO";
import { onlyNumbers, phoneMask } from "@/shared/utils/masks";

type EmpresaFormState = {
    nome: string;
    apelido: string;
    cnpj: string;

    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;

    telefone: string;
    celular: string;
    email: string;

    inscricao_estadual: string;
    tipo_empresa: string;
    data_situacao_uf: string;
    situacao_cnpj: string;
    situacao_ie: string;
    cnae: string;

    atividades_principais: ReceitaWsAtividadeDTO[];
    atividades_secundarias: ReceitaWsAtividadeDTO[];
    qsa: ReceitaWsSocioDTO[];
};

function criarFormVazio(): EmpresaFormState {
    return {
        nome: "",
        apelido: "",
        cnpj: "",
        cep: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        uf: "",
        telefone: "",
        celular: "",
        email: "",
        inscricao_estadual: "",
        tipo_empresa: "",
        data_situacao_uf: "",
        situacao_cnpj: "",
        situacao_ie: "",
        cnae: "",
        atividades_principais: [new ReceitaWsAtividadeDTO("", "")],
        atividades_secundarias: [],
        qsa: []
    };
}

export function useEmpresasAdmin() {
    const repo = inject<IMatrizRepository | null>("IMatrizRepository", null);
    if (!repo) throw new Error("IMatrizRepository not provided");
    const repoOk: IMatrizRepository = repo;

    const criarCaso = new CriarEmpresaUseCase(repoOk);
    const listarEmpresasCaso = new ListarEmpresasUseCase(repoOk);

    const form = reactive<EmpresaFormState>(criarFormVazio());

    const carregando = ref(false);
    const carregandoCnpj = ref(false);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const consultaCnpj = ref<ReceitaWsCnpjResponseDTO | null>(null);
    const matrizJaExiste = ref(false);
    const erroCampos = ref<Record<string, string>>({});
    const empresas = ref<EmpresaListagemDTO[]>([]);
    const carregandoEmpresas = ref(false);
    const paginaAtual = ref(1);
    const textoBuscaNome = ref("");
    const filtroNome = ref("");
    const totalRegistros = ref(0);
    const porPagina = ref(6);

    const totalPaginas = computed(() => {
        const pp = Math.max(porPagina.value || 6, 1);
        return Math.max(1, Math.ceil(totalRegistros.value / pp));
    });

    const indiceInicioLista = computed(() => {
        if (totalRegistros.value === 0) return 0;
        const pp = Math.max(porPagina.value || 6, 1);
        return (paginaAtual.value - 1) * pp + 1;
    });

    const indiceFimLista = computed(() => {
        if (totalRegistros.value === 0) return 0;
        const pp = Math.max(porPagina.value || 6, 1);
        return Math.min(paginaAtual.value * pp, totalRegistros.value);
    });

    const intervaloMostrado = computed(() => ({
        de: indiceInicioLista.value,
        ate: indiceFimLista.value
    }));

    function montarPaginasNavegacao(
        current: number,
        total: number
    ): (number | "dots")[] {
        if (total <= 1) return [1];
        const delta = 1;
        const set = new Set<number>();
        set.add(1);
        set.add(total);
        for (let i = current - delta; i <= current + delta; i++) {
            if (i >= 1 && i <= total) set.add(i);
        }
        const sorted = [...set].sort((a, b) => a - b);
        const out: (number | "dots")[] = [];
        let prev = 0;
        for (const p of sorted) {
            if (prev && p - prev > 1) out.push("dots");
            out.push(p);
            prev = p;
        }
        return out;
    }

    const paginasNavegacao = computed(() =>
        montarPaginasNavegacao(paginaAtual.value, totalPaginas.value)
    );

    watch(
        () => form.atividades_principais.map((x) => x.code).join("|"),
        () => {
            form.cnae = form.atividades_principais[0]?.code ?? "";
        }
    );

    function limparFormulario() {
        const v = criarFormVazio();
        form.nome = v.nome;
        form.apelido = v.apelido;
        form.cnpj = v.cnpj;
        form.cep = v.cep;
        form.rua = v.rua;
        form.numero = v.numero;
        form.bairro = v.bairro;
        form.cidade = v.cidade;
        form.uf = v.uf;
        form.telefone = v.telefone;
        form.celular = v.celular;
        form.email = v.email;
        form.inscricao_estadual = v.inscricao_estadual;
        form.tipo_empresa = v.tipo_empresa;
        form.data_situacao_uf = v.data_situacao_uf;
        form.situacao_cnpj = v.situacao_cnpj;
        form.situacao_ie = v.situacao_ie;
        form.cnae = v.cnae;
        form.atividades_principais = v.atividades_principais;
        form.atividades_secundarias = v.atividades_secundarias;
        form.qsa = v.qsa;
        consultaCnpj.value = null;
    }

    async function carregarEmpresas(op?: { page?: number }) {
        carregandoEmpresas.value = true;
        erro.value = null;
        const page = op?.page ?? paginaAtual.value;
        paginaAtual.value = page;
        try {
            const r = await listarEmpresasCaso.execute({
                page: paginaAtual.value,
                nome: filtroNome.value.trim() || undefined
            });
            empresas.value = r.data;
            totalRegistros.value = r.total;
            porPagina.value = r.por_pagina || 6;
            paginaAtual.value = r.pagina;
            matrizJaExiste.value = r.total > 0;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 401) {
                    erro.value =
                        d?.message ??
                        "Autenticação necessária para acessar este recurso.";
                } else if (status === 403) {
                    erro.value =
                        d?.message ??
                        "Você não tem permissão para listar empresas.";
                } else if (status === 422) {
                    erro.value =
                        d?.message ??
                        "Parâmetros de busca inválidos. Verifique o texto ou a página.";
                } else if (status != null && status >= 500) {
                    erro.value =
                        "Não foi possível carregar a listagem de empresas. Tente novamente em instantes.";
                } else {
                    erro.value =
                        d?.message ??
                        "Não foi possível carregar a listagem de empresas.";
                }
            } else {
                erro.value = "Não foi possível carregar a listagem de empresas.";
            }
            throw e;
        } finally {
            carregandoEmpresas.value = false;
        }
    }

    async function aplicarBuscaNome() {
        filtroNome.value = textoBuscaNome.value.trim();
        paginaAtual.value = 1;
        await carregarEmpresas({ page: 1 });
    }

    async function limparBuscaNome() {
        textoBuscaNome.value = "";
        filtroNome.value = "";
        paginaAtual.value = 1;
        await carregarEmpresas({ page: 1 });
    }

    function irParaPagina(p: number) {
        if (p < 1 || p > totalPaginas.value) return;
        return carregarEmpresas({ page: p });
    }

    async function carregar() {
        carregando.value = true;
        erroCampos.value = {};
        try {
            await carregarEmpresas({ page: 1 });
            limparFormulario();
        } finally {
            carregando.value = false;
        }
    }

    function setFromReceitaWs(cnpjResp: ReceitaWsCnpjResponseDTO) {
        consultaCnpj.value = cnpjResp;
        form.nome = cnpjResp.nome ?? "";
        form.apelido = cnpjResp.fantasia ?? cnpjResp.nome ?? "";
        form.cnpj = onlyNumbers(cnpjResp.cnpj ?? "");

        form.cep = cnpjResp.cep ?? "";
        form.rua = cnpjResp.logradouro ?? "";
        form.numero = cnpjResp.numero ?? "";
        form.bairro = cnpjResp.bairro ?? "";
        form.cidade = cnpjResp.municipio ?? "";
        form.uf = cnpjResp.uf ?? "";

        form.telefone = phoneMask(cnpjResp.telefone ?? "");
        form.email = cnpjResp.email ?? "";

        form.tipo_empresa = cnpjResp.tipo ?? "";
        form.data_situacao_uf = cnpjResp.dataSituacao ?? "";
        form.situacao_cnpj = cnpjResp.situacao ?? "";

        form.atividades_principais = cnpjResp.atividadePrincipal?.length
            ? cnpjResp.atividadePrincipal
            : [new ReceitaWsAtividadeDTO("", "")];
        form.atividades_secundarias = cnpjResp.atividadesSecundarias ?? [];
        form.qsa = cnpjResp.qsa ?? [];
    }

    async function buscarPorCnpj(cnpjSemMascara: string) {
        carregandoCnpj.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const resp = await buscarReceitaWsCnpj(cnpjSemMascara);
            setFromReceitaWs(resp);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO;
                erro.value = d?.message ?? "Não foi possível buscar CNPJ.";
            } else {
                erro.value =
                    e instanceof Error ? e.message : "Não foi possível buscar CNPJ.";
            }
            throw e;
        } finally {
            carregandoCnpj.value = false;
        }
    }

    async function salvar() {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        const atividadesPrincipais = form.atividades_principais
            .filter((a) => a.code.trim() || a.text.trim())
            .map((a) => new ReceitaWsAtividadeDTO(a.code.trim(), a.text.trim()));
        const atividadesSecundarias = form.atividades_secundarias
            .filter((a) => a.code.trim() || a.text.trim())
            .map((a) => new ReceitaWsAtividadeDTO(a.code.trim(), a.text.trim()));
        const qsa = form.qsa
            .filter((q) => q.nome.trim() || q.qual.trim())
            .map((q) => new ReceitaWsSocioDTO(q.nome.trim(), q.qual.trim()));
        const payload = new EmpresaUpsertDTO(
            form.nome.trim(),
            form.apelido.trim(),
            onlyNumbers(form.cnpj),
            onlyNumbers(form.cep),
            form.rua.trim(),
            form.numero.trim(),
            form.bairro.trim(),
            form.cidade.trim(),
            form.uf.trim().toUpperCase(),
            onlyNumbers(form.telefone),
            onlyNumbers(form.celular),
            form.email.trim(),
            form.inscricao_estadual.trim(),
            form.tipo_empresa.trim(),
            form.data_situacao_uf.trim(),
            form.situacao_cnpj.trim(),
            form.situacao_ie.trim(),
            form.cnae.trim(),
            atividadesPrincipais,
            atividadesSecundarias,
            qsa,
            {
                origem_preenchimento: consultaCnpj.value ? "cnpj_api" : "manual",
                cnpj_consultado_em: consultaCnpj.value
                    ? new Date().toISOString()
                    : null
            }
        );
        try {
            await criarCaso.execute(payload);
            sucesso.value = "Empresa criada com sucesso.";
            matrizJaExiste.value = true;
            await carregarEmpresas({ page: 1 });
            limparFormulario();
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO;
                const status = e.response?.status;
                if (status === 403) {
                    erro.value =
                        d?.message ??
                        "Você não tem permissão para criar empresa.";
                } else if (status === 409) {
                    erro.value =
                        d?.message ??
                        "Já existe empresa cadastrada com este CNPJ.";
                    erroCampos.value.cnpj = erro.value;
                } else if (status === 422) {
                    const errors = d?.errors as Record<string, string[]> | undefined;
                    const mapped: Record<string, string> = {};
                    if (errors) {
                        for (const [k, v] of Object.entries(errors)) {
                            if (!v?.length) continue;
                            mapped[k] = v[0] as string;
                            if (k.startsWith("cnpj")) mapped.cnpj = v[0] as string;
                            if (k.startsWith("nome")) mapped.nome = v[0] as string;
                            if (k.startsWith("email")) mapped.email = v[0] as string;
                            if (k.startsWith("cep")) mapped.cep = v[0] as string;
                            if (k.startsWith("rua")) mapped.rua = v[0] as string;
                            if (k.startsWith("numero")) mapped.numero = v[0] as string;
                            if (k.startsWith("bairro")) mapped.bairro = v[0] as string;
                            if (k.startsWith("cidade")) mapped.cidade = v[0] as string;
                            if (k.startsWith("uf")) mapped.uf = v[0] as string;
                        }
                    }
                    erroCampos.value = mapped;
                    erro.value = d?.message ?? "Dados inválidos.";
                } else {
                    erro.value =
                        d?.message ??
                        "Não foi possível salvar a empresa. Verifique os dados.";
                }
            } else {
                erro.value =
                    e instanceof Error
                        ? e.message
                        : "Não foi possível salvar a empresa.";
            }
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    function adicionarAtividadeSecundaria() {
        form.atividades_secundarias.push(new ReceitaWsAtividadeDTO("", ""));
    }

    function removerAtividadeSecundaria(index: number) {
        form.atividades_secundarias.splice(index, 1);
    }

    function adicionarQsa() {
        form.qsa.push(new ReceitaWsSocioDTO("", ""));
    }

    function removerQsa(index: number) {
        form.qsa.splice(index, 1);
    }

    function adicionarAtividadePrincipal() {
        form.atividades_principais.push(new ReceitaWsAtividadeDTO("", ""));
    }

    function removerAtividadePrincipal(index: number) {
        form.atividades_principais.splice(index, 1);
        if (form.atividades_principais.length === 0) {
            form.atividades_principais.push(new ReceitaWsAtividadeDTO("", ""));
        }
    }

    return {
        form,
        carregando,
        carregandoCnpj,
        salvando,
        erro,
        sucesso,
        consultaCnpj,
        erroCampos,
        matrizJaExiste,
        empresas,
        carregandoEmpresas,
        paginaAtual,
        textoBuscaNome,
        filtroNome,
        totalRegistros,
        porPagina,
        totalPaginas,
        intervaloMostrado,
        paginasNavegacao,
        carregar,
        carregarEmpresas,
        aplicarBuscaNome,
        limparBuscaNome,
        irParaPagina,
        buscarPorCnpj,
        salvar,
        adicionarAtividadeSecundaria,
        removerAtividadeSecundaria,
        adicionarQsa,
        removerQsa,
        adicionarAtividadePrincipal,
        removerAtividadePrincipal
    };
}

