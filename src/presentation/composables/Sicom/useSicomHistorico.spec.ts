import { effectScope } from "vue";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";
import type { ReceitaOrcamentariaArquivo } from "@/domain/casp/receitaOrcamentaria";
import type { SicomHistoricoLista } from "@/domain/sicom/historico";
import type { ISicomRepository } from "@/domain/repositories/ISicomRepository";
import { useSicomHistorico } from "@/presentation/composables/Sicom/useSicomHistorico";

const receita: ReceitaOrcamentariaArquivo = {
    id: 7,
    apelido: null,
    nomeOriginal: "ementario.xlsx",
    tamanhoBytes: 20,
    quantidadeAbas: 1,
    quantidadeLinhas: 1,
    situacao: "processado",
    tratamento: { abas: [] },
    criadoEm: "2026-11-17 15:58:57",
    downloadUrl: "/casp/receita-orcamentaria/7/download"
};

function lista(vazia: boolean): SicomHistoricoLista {
    if (vazia) return { status: "listado", mensagem: null, municipios: [], detalhes: [] };
    return {
        status: "listado",
        mensagem: null,
        detalhes: [],
        municipios: [
            {
                municipio: "02002",
                remessas: [
                    {
                        id: 5,
                        municipio: "02002",
                        exercicio: 2025,
                        arquivo: "IP_02002_2025.zip",
                        receitaBruta: 10,
                        deducoes: 1,
                        receitaLiquida: 9,
                        despesaFixada: 8,
                        resultado: 1,
                        situacao: "superavit",
                        gravadoEm: "2026-11-17 15:58:57"
                    }
                ]
            }
        ]
    };
}

function erroRede(): AxiosError {
    const erro = new AxiosError("Request failed");
    erro.response = {
        status: 500,
        data: {},
        statusText: "",
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig
    };
    return erro;
}

function montar(opcoes: {
    listar?: () => SicomHistoricoLista;
    gravar?: () => ReturnType<ISicomRepository["gravarHistorico"]>;
    excluir?: () => ReturnType<ISicomRepository["excluirHistorico"]>;
    prever?: () => ReturnType<ISicomRepository["prever"]>;
}) {
    const prever = vi.fn(opcoes.prever ?? (async () => ({
        status: "previsto" as const,
        mensagem: "Previsto.",
        municipio: "02002",
        anos: [2025],
        lacunas: [],
        exercicioBase: 2025,
        horizonte: 1,
        metodo: "insuficiente" as const,
        totais: { historico: [], previsoes: [], metodo: "insuficiente" as const },
        despesas: [],
        receitas: [],
        deducoes: [],
        avisos: [],
        detalhes: []
    })));
    const repositorio = {
        validarRemessa: vi.fn(),
        consultarEmentario: vi.fn(),
        gerarRelatorio: vi.fn(),
        gravarHistorico: vi.fn(opcoes.gravar ?? (async () => ({ status: "salvo" as const, mensagem: null, total: 0, remessas: [], detalhes: [] }))),
        listarHistorico: vi.fn(async () => (opcoes.listar ? opcoes.listar() : lista(true))),
        detalharHistorico: vi.fn(),
        excluirHistorico: vi.fn(opcoes.excluir ?? (async () => ({ status: "excluido" as const, mensagem: "Instrumento excluído.", id: 5, municipio: "02002", exercicio: 2025, detalhes: [] }))),
        prever
    } satisfies ISicomRepository;
    const escopo = effectScope();
    const tela = escopo.run(() =>
        useSicomHistorico({
            repositorio,
            baixar: async () => ({ blob: new Blob(["xlsx"]), filename: "ementario.xlsx" })
        })
    );
    if (!tela) throw new Error("composable");
    return { tela, repositorio, prever, parar: () => escopo.stop() };
}

describe("useSicomHistorico", () => {
    it("não pede a previsão quando não há instrumento gravado", async () => {
        const { tela, prever, parar } = montar({ listar: () => lista(true) });
        await tela.listar();
        expect(prever).not.toHaveBeenCalled();
        expect(tela.previsao.value).toBeNull();
        parar();
    });

    it("zera a previsão ao excluir o último ano sem consultar de novo", async () => {
        let vazia = false;
        const { tela, prever, parar } = montar({
            listar: () => lista(vazia)
        });
        await tela.listar();
        expect(prever).toHaveBeenCalledTimes(1);
        vazia = true;
        await tela.excluir(5);
        expect(prever).toHaveBeenCalledTimes(1);
        expect(tela.previsao.value).toBeNull();
        parar();
    });

    it("mostra a mensagem do 422 e a frase técnica só na falha de rede", async () => {
        const lote = montar({
            listar: () => lista(false),
            gravar: async () => ({
                status: "erro",
                mensagem: "IP_02002_2020.zip não foi possível ler.",
                total: null,
                remessas: [],
                detalhes: []
            })
        });
        await lote.tela.listar();
        lote.tela.adicionar([new File(["a"], "IP_02002_2020.zip")]);
        await lote.tela.gravar(receita);
        expect(lote.tela.falhaGravacao.value).toBe("IP_02002_2020.zip não foi possível ler.");
        expect(lote.tela.lista.value?.municipios).toHaveLength(1);
        expect(lote.tela.selecionados.value).toHaveLength(1);
        lote.parar();

        const rede = montar({
            gravar: async () => {
                throw erroRede();
            }
        });
        rede.tela.adicionar([new File(["a"], "IP_02002_2020.zip")]);
        await rede.tela.gravar(receita);
        expect(rede.tela.falhaGravacao.value).toBe("Não foi possível gravar o histórico.");
        rede.parar();
    });
});
