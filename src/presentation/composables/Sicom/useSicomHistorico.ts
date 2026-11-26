import { ref } from "vue";
import axios from "axios";
import { BaixarReceitaOrcamentariaUseCase } from "@/application/use-cases/Casp/ReceitaOrcamentariaUseCases";
import {
    DetalharHistoricoSicomUseCase,
    ExcluirHistoricoSicomUseCase,
    GravarHistoricoSicomUseCase,
    ListarHistoricoSicomUseCase,
    PreverSicomUseCase
} from "@/application/use-cases/Sicom/SicomUseCases";
import type { ReceitaOrcamentariaArquivo } from "@/domain/casp/receitaOrcamentaria";
import type { SicomHistoricoDetalhe, SicomHistoricoLista } from "@/domain/sicom/historico";
import type { SicomPrevisao } from "@/domain/sicom/previsao";
import type { ISicomRepository } from "@/domain/repositories/ISicomRepository";
import { useReceitaOrcamentariaRepository } from "@/presentation/composables/Casp/useReceitaOrcamentariaRepository";
import { useSicomRepository } from "@/presentation/composables/Sicom/useSicomRepository";
import { frasesGravacao, validarSelecaoHistorico } from "@/shared/utils/sicomHistorico";
import { extensaoAceita } from "@/shared/utils/sicomValidacao";

const TECNICA_GRAVAR = "Não foi possível gravar o histórico.";
const TECNICA_LISTAR = "Não foi possível listar o histórico.";
const TECNICA_DETALHAR = "Não foi possível consultar o histórico.";
const TECNICA_EXCLUIR = "Não foi possível excluir o instrumento.";
const TECNICA_PREVER = "Não foi possível gerar a previsão.";
const TIPO_PLANILHA = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type BaixarPlanilha = (id: number, nome: string) => Promise<{ blob: Blob; filename: string }>;

function mensagemFalha(erro: unknown, tecnica: string): string {
    if (axios.isAxiosError(erro)) return tecnica;
    if (erro instanceof Error && erro.message.trim()) return erro.message;
    return tecnica;
}

export function useSicomHistorico(deps?: { repositorio: ISicomRepository; baixar?: BaixarPlanilha }) {
    const repositorio = deps?.repositorio ?? useSicomRepository();
    const baixarReceita = deps?.baixar
        ? null
        : new BaixarReceitaOrcamentariaUseCase(useReceitaOrcamentariaRepository());
    const baixar: BaixarPlanilha =
        deps?.baixar ??
        ((id, nome) => {
            if (!baixarReceita) throw new Error("IReceitaOrcamentariaRepository not provided");
            return baixarReceita.execute(id, nome);
        });
    const gravarHistorico = new GravarHistoricoSicomUseCase(repositorio);
    const listarHistorico = new ListarHistoricoSicomUseCase(repositorio);
    const detalharHistorico = new DetalharHistoricoSicomUseCase(repositorio);
    const excluirHistorico = new ExcluirHistoricoSicomUseCase(repositorio);
    const preverHistorico = new PreverSicomUseCase(repositorio);

    const gravando = ref(false);
    const listando = ref(false);
    const consultando = ref(false);
    const excluindo = ref(false);
    const prevendo = ref(false);
    const lista = ref<SicomHistoricoLista | null>(null);
    const detalhe = ref<SicomHistoricoDetalhe | null>(null);
    const previsao = ref<SicomPrevisao | null>(null);
    const falhaLista = ref<string | null>(null);
    const falhaDetalhe = ref<string | null>(null);
    const falhaGravacao = ref<string | null>(null);
    const falhaExclusao = ref<string | null>(null);
    const falhaPrevisao = ref<string | null>(null);
    const avisoSubstituido = ref<string[]>([]);
    const sucessoGravacao = ref<string[]>([]);
    const sucessoExclusao = ref<string | null>(null);
    const campo = ref<string | null>(null);
    const selecionados = ref<File[]>([]);
    const horizonte = ref<1 | 2 | 3>(1);
    const municipioAtivo = ref<string | null>(null);
    const previsaoConsultada = ref(false);
    let pedidoDetalhe = 0;

    function limpar() {
        lista.value = null;
        detalhe.value = null;
        previsao.value = null;
        falhaLista.value = null;
        falhaDetalhe.value = null;
        falhaGravacao.value = null;
        falhaExclusao.value = null;
        falhaPrevisao.value = null;
        avisoSubstituido.value = [];
        sucessoGravacao.value = [];
        sucessoExclusao.value = null;
        campo.value = null;
        selecionados.value = [];
        municipioAtivo.value = null;
        previsaoConsultada.value = false;
    }

    function adicionar(arquivos: FileList | File[] | null) {
        if (!arquivos) return;
        for (const arquivo of Array.from(arquivos)) selecionados.value.push(arquivo);
    }

    function remover(indice: number) {
        selecionados.value.splice(indice, 1);
    }

    function anosDoMunicipio(codigo: string | null): number {
        if (!codigo || lista.value?.status !== "listado") return 0;
        return lista.value.municipios.find((item) => item.municipio === codigo)?.remessas.length ?? 0;
    }

    function nomeMunicipioConhecido(codigo: string | null): string | null {
        if (!codigo || lista.value?.status !== "listado") return null;
        const grupo = lista.value.municipios.find((item) => item.municipio === codigo);
        if (!grupo) return null;
        const nome = grupo.nomeMunicipio?.trim() || grupo.remessas.find((item) => item.nomeMunicipio?.trim())?.nomeMunicipio?.trim() || "";
        return nome || null;
    }

    async function prever() {
        const municipio = municipioAtivo.value;
        if (!municipio || anosDoMunicipio(municipio) === 0) {
            previsao.value = null;
            return;
        }
        prevendo.value = true;
        falhaPrevisao.value = null;
        try {
            const resposta = await preverHistorico.execute(municipio, horizonte.value);
            if (resposta.status == null) {
                falhaPrevisao.value = TECNICA_PREVER;
                previsao.value = null;
                return;
            }
            previsaoConsultada.value = true;
            previsao.value = resposta;
        } catch (erro: unknown) {
            falhaPrevisao.value = mensagemFalha(erro, TECNICA_PREVER);
            previsao.value = null;
        } finally {
            prevendo.value = false;
        }
    }

    async function listar(opcoes?: { atualizarPrevisao?: boolean }) {
        const atualizar = opcoes?.atualizarPrevisao !== false;
        listando.value = true;
        falhaLista.value = null;
        try {
            const resposta = await listarHistorico.execute();
            if (resposta.status == null) {
                falhaLista.value = TECNICA_LISTAR;
                return;
            }
            if (resposta.status === "erro") {
                falhaLista.value = resposta.mensagem;
                return;
            }
            lista.value = resposta;
            if (resposta.municipios.length === 0) {
                municipioAtivo.value = null;
                previsao.value = null;
                return;
            }
            if (resposta.municipios.length === 1) {
                municipioAtivo.value = resposta.municipios[0]?.municipio ?? null;
            } else if (!resposta.municipios.some((item) => item.municipio === municipioAtivo.value)) {
                municipioAtivo.value = null;
                previsao.value = null;
            }
            if (atualizar && resposta.municipios.length === 1 && municipioAtivo.value) await prever();
        } catch (erro: unknown) {
            falhaLista.value = mensagemFalha(erro, TECNICA_LISTAR);
        } finally {
            listando.value = false;
        }
    }

    async function gravar(receita: ReceitaOrcamentariaArquivo | null) {
        if (gravando.value) return;
        falhaGravacao.value = null;
        avisoSubstituido.value = [];
        sucessoGravacao.value = [];
        campo.value = validarSelecaoHistorico(selecionados.value, receita?.nomeOriginal ?? null);
        if (campo.value || !receita) return;
        gravando.value = true;
        try {
            const baixado = await baixar(receita.id, receita.nomeOriginal);
            const nome = baixado.filename || receita.nomeOriginal;
            const arquivo = new File([baixado.blob], nome, { type: baixado.blob.type || TIPO_PLANILHA });
            if (!extensaoAceita(arquivo.name, ".xlsx")) {
                campo.value = `${arquivo.name} não é um XLSX.`;
                return;
            }
            const resposta = await gravarHistorico.execute([...selecionados.value], arquivo);
            if (resposta.status == null) {
                falhaGravacao.value = TECNICA_GRAVAR;
                return;
            }
            if (resposta.status === "erro") {
                falhaGravacao.value = resposta.mensagem;
                return;
            }
            const montarFrases = () =>
                frasesGravacao(
                    resposta.mensagem,
                    resposta.remessas.map((item) => ({
                        ...item,
                        nomeMunicipio: nomeMunicipioConhecido(item.municipio)
                    }))
                );
            const frasesIniciais = montarFrases();
            sucessoGravacao.value = frasesIniciais.verdes;
            avisoSubstituido.value = frasesIniciais.amarelas;
            const gravados = new Set(resposta.remessas.map((item) => item.municipio));
            const ativo = municipioAtivo.value;
            const jaViu = previsaoConsultada.value;
            selecionados.value = [];
            await listar({ atualizarPrevisao: false });
            const frases = montarFrases();
            sucessoGravacao.value = frases.verdes;
            avisoSubstituido.value = frases.amarelas;
            const unico = lista.value?.municipios.length === 1;
            if (municipioAtivo.value && gravados.has(municipioAtivo.value) && (jaViu || unico || ativo === municipioAtivo.value)) {
                await prever();
            }
        } catch (erro: unknown) {
            falhaGravacao.value = mensagemFalha(erro, TECNICA_GRAVAR);
        } finally {
            gravando.value = false;
        }
    }

    async function detalhar(id: number) {
        const pedido = ++pedidoDetalhe;
        detalhe.value = null;
        falhaDetalhe.value = null;
        consultando.value = true;
        try {
            const resposta = await detalharHistorico.execute(id);
            if (pedido !== pedidoDetalhe) return;
            if (resposta.status == null) {
                falhaDetalhe.value = TECNICA_DETALHAR;
                return;
            }
            if (resposta.status === "erro") {
                falhaDetalhe.value = resposta.mensagem;
                await listar({ atualizarPrevisao: false });
                return;
            }
            detalhe.value = resposta;
        } catch (erro: unknown) {
            if (pedido !== pedidoDetalhe) return;
            falhaDetalhe.value = mensagemFalha(erro, TECNICA_DETALHAR);
        } finally {
            if (pedido === pedidoDetalhe) consultando.value = false;
        }
    }

    async function excluir(id: number) {
        if (excluindo.value) return;
        excluindo.value = true;
        falhaExclusao.value = null;
        sucessoExclusao.value = null;
        try {
            const resposta = await excluirHistorico.execute(id);
            if (resposta.status == null) {
                falhaExclusao.value = TECNICA_EXCLUIR;
                return;
            }
            if (resposta.status === "erro") {
                falhaExclusao.value = resposta.mensagem;
                await listar({ atualizarPrevisao: false });
                return;
            }
            sucessoExclusao.value = resposta.mensagem;
            if (detalhe.value?.id === id) detalhe.value = null;
            const municipio = resposta.municipio;
            await listar({ atualizarPrevisao: false });
            const grupo = lista.value?.municipios.find((item) => item.municipio === municipio);
            if ((grupo?.remessas.length ?? 0) === 0) {
                if (!municipioAtivo.value || municipioAtivo.value === municipio) previsao.value = null;
                return;
            }
            if (municipioAtivo.value === municipio) await prever();
        } catch (erro: unknown) {
            falhaExclusao.value = mensagemFalha(erro, TECNICA_EXCLUIR);
        } finally {
            excluindo.value = false;
        }
    }

    async function definirMunicipio(codigo: string) {
        municipioAtivo.value = codigo;
        detalhe.value = null;
        await prever();
    }

    async function definirHorizonte(valor: number) {
        if (valor !== 1 && valor !== 2 && valor !== 3) return;
        horizonte.value = valor;
        await prever();
    }

    return {
        gravando,
        listando,
        consultando,
        excluindo,
        prevendo,
        lista,
        detalhe,
        previsao,
        falhaLista,
        falhaDetalhe,
        falhaGravacao,
        falhaExclusao,
        falhaPrevisao,
        avisoSubstituido,
        sucessoGravacao,
        sucessoExclusao,
        campo,
        selecionados,
        horizonte,
        municipioAtivo,
        limpar,
        adicionar,
        remover,
        listar,
        gravar,
        detalhar,
        excluir,
        definirMunicipio,
        definirHorizonte,
        prever
    };
}
