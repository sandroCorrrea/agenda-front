import { computed, inject, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { EmpresaListagemDTO } from "@/domain/repositories/IMatrizRepository";
import type { IMatrizRepository } from "@/domain/repositories/IMatrizRepository";
import { ReceitaWsAtividadeDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import { ReceitaWsSocioDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";
import { EmpresaUpsertDTO } from "@/application/dto/Empresa/EmpresaUpsertDTO";
import { ListarEmpresasUseCase } from "@/application/use-cases/Matriz/ListarEmpresasUseCase";
import { AtualizarEmpresaUseCase } from "@/application/use-cases/Matriz/AtualizarEmpresaUseCase";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
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

function formVazio(): EmpresaFormState {
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

function empresaParaForm(e: EmpresaListagemDTO): EmpresaFormState {
    const ap = e.atividades_principais.length
        ? e.atividades_principais.map(
              (a) => new ReceitaWsAtividadeDTO(a.code, a.text)
          )
        : [new ReceitaWsAtividadeDTO("", "")];
    const as = e.atividades_secundarias.map(
        (a) => new ReceitaWsAtividadeDTO(a.code, a.text)
    );
    const q = e.qsa.map((x) => new ReceitaWsSocioDTO(x.nome, x.qual));
    return {
        nome: e.nome ?? "",
        apelido: e.apelido ?? "",
        cnpj: onlyNumbers(e.cnpj),
        cep: e.cep ?? "",
        rua: e.rua ?? "",
        numero: e.numero ?? "",
        bairro: e.bairro ?? "",
        cidade: e.cidade ?? "",
        uf: e.uf ?? "",
        telefone:
            e.telefone != null ? phoneMask(String(e.telefone)) : "",
        celular: e.celular != null ? phoneMask(String(e.celular)) : "",
        email: e.email ?? "",
        inscricao_estadual: e.inscricao_estadual ?? "",
        tipo_empresa: e.tipo_empresa ?? "",
        data_situacao_uf: e.data_situacao_uf ?? "",
        situacao_cnpj: e.situacao_cnpj ?? "",
        situacao_ie: e.situacao_ie ?? "",
        cnae: e.cnae ?? "",
        atividades_principais: ap,
        atividades_secundarias: as,
        qsa: q
    };
}

/** Mapeia erros Laravel (incl. chaves com índice) para exibição por campo. */
function mapearErros422(
    errors: Record<string, string[]>
): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(errors)) {
        if (!v?.length) continue;
        const msg = v[0] as string;
        out[k] = msg;
        if (k === "cnpj" || k.startsWith("cnpj")) out.cnpj = msg;
        if (k === "nome" || k.startsWith("nome")) out.nome = msg;
        if (k === "email" || k.startsWith("email")) out.email = msg;
        if (k === "cep" || k.startsWith("cep")) out.cep = msg;
        if (k === "rua" || k.startsWith("rua")) out.rua = msg;
        if (k === "numero" || k.startsWith("numero")) out.numero = msg;
        if (k === "bairro" || k.startsWith("bairro")) out.bairro = msg;
        if (k === "cidade" || k.startsWith("cidade")) out.cidade = msg;
        if (k === "uf" || k.startsWith("uf")) out.uf = msg;
        if (k.startsWith("atividades_principais")) {
            out.atividades_principais = out.atividades_principais ?? msg;
        }
        if (k.startsWith("atividades_secundarias")) {
            out.atividades_secundarias = out.atividades_secundarias ?? msg;
        }
        if (k.startsWith("qsa")) out.qsa = out.qsa ?? msg;
    }
    return out;
}

export function useEditarEmpresa() {
    const route = useRoute();
    const empresaId = computed(() => {
        const n = Number(route.params.id);
        return Number.isFinite(n) && n > 0 ? n : NaN;
    });

    const repo = inject<IMatrizRepository | null>("IMatrizRepository", null);
    if (!repo) throw new Error("IMatrizRepository not provided");
    const listar = new ListarEmpresasUseCase(repo);
    const atualizar = new AtualizarEmpresaUseCase(repo);

    const form = reactive<EmpresaFormState>(formVazio());
    const carregando = ref(true);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const erroCampos = ref<Record<string, string>>({});
    const naoEncontrada = ref(false);
    const empresaAtual = ref<EmpresaListagemDTO | null>(null);

    watch(
        () => form.atividades_principais.map((x) => x.code).join("|"),
        () => {
            form.cnae = form.atividades_principais[0]?.code ?? "";
        }
    );

    async function carregar() {
        const id = empresaId.value;
        if (Number.isNaN(id)) {
            naoEncontrada.value = true;
            carregando.value = false;
            return;
        }
        carregando.value = true;
        erro.value = null;
        naoEncontrada.value = false;
        erroCampos.value = {};
        try {
            let page = 1;
            let item: EmpresaListagemDTO | undefined;
            for (;;) {
                const r = await listar.execute({ page });
                item = r.data.find((x) => x.id === id);
                if (item) break;
                const pp = Math.max(r.por_pagina || 6, 1);
                const totalPag = Math.max(1, Math.ceil(r.total / pp));
                if (page >= totalPag) break;
                page++;
            }
            if (!item) {
                naoEncontrada.value = true;
                return;
            }
            empresaAtual.value = item;
            Object.assign(form, empresaParaForm(item));
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 403) {
                    erro.value =
                        d?.message ??
                        "Você não tem permissão para acessar empresas.";
                } else if (status != null && status >= 500) {
                    erro.value =
                        "Não foi possível carregar os dados. Tente novamente em instantes.";
                } else {
                    erro.value =
                        d?.message ?? "Não foi possível carregar a empresa.";
                }
            } else {
                erro.value = "Não foi possível carregar a empresa.";
            }
            throw e;
        } finally {
            carregando.value = false;
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

        if (atividadesPrincipais.length === 0) {
            erro.value = "Informe ao menos uma atividade principal.";
            erroCampos.value.atividades_principais = erro.value;
            salvando.value = false;
            return;
        }

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
                origem_preenchimento: "manual",
                cnpj_consultado_em: null
            }
        );

        const id = empresaId.value;
        if (Number.isNaN(id)) {
            erro.value = "Identificador da empresa inválido.";
            salvando.value = false;
            return;
        }

        try {
            const atualizada = await atualizar.execute(id, payload);
            empresaAtual.value = atualizada;
            Object.assign(form, empresaParaForm(atualizada));
            sucesso.value = "Alterações salvas com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO;
                const status = e.response?.status;
                if (status === 403) {
                    erro.value =
                        d?.message ??
                        "Você não tem permissão para editar empresa.";
                } else if (status === 404) {
                    erro.value =
                        d?.message ?? "Empresa não encontrada.";
                    naoEncontrada.value = true;
                } else if (status === 422) {
                    const errors = d?.errors as
                        | Record<string, string[]>
                        | undefined;
                    if (errors) {
                        erroCampos.value = mapearErros422(errors);
                    }
                    erro.value = d?.message ?? "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value =
                        "Não foi possível salvar. Tente novamente em instantes.";
                } else {
                    erro.value =
                        d?.message ??
                        "Não foi possível salvar as alterações.";
                }
            } else {
                erro.value =
                    e instanceof Error
                        ? e.message
                        : "Não foi possível salvar as alterações.";
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
        empresaId,
        form,
        carregando,
        salvando,
        erro,
        sucesso,
        erroCampos,
        naoEncontrada,
        empresaAtual,
        carregar,
        salvar,
        adicionarAtividadeSecundaria,
        removerAtividadeSecundaria,
        adicionarQsa,
        removerQsa,
        adicionarAtividadePrincipal,
        removerAtividadePrincipal
    };
}
