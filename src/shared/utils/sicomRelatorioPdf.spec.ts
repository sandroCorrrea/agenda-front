import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { SicomRelatorioResposta } from "@/domain/sicom/relatorio";
import { montarPdfRelatorio, nomeArquivoRelatorio, textoPdf } from "@/shared/utils/sicomRelatorioPdf";

function resposta(parcial: Partial<SicomRelatorioResposta> = {}): SicomRelatorioResposta {
    return {
        status: "gerado",
        mensagem: "A receita líquida prevista de R$ 54.214.600,00 cobre a despesa fixada.",
        exercicio: "2025",
        ementario: { arquivo: "ementario.xlsx", planilha: "ENR - 2025 ", totalContas: 1 },
        remessa: { arquivo: "IP_02002_2025.zip", arquivos: ["REC.CSV"] },
        resumo: {
            receitaBruta: 54214600,
            deducoes: 0,
            receitaLiquida: 54214600,
            despesaFixada: 54214600,
            resultado: 0,
            situacao: "equilibrado",
            receitaCorrenteLiquida: 0,
            receitaCapitalLiquida: 0,
            despesaCorrente: 0,
            despesaCapital: 0,
            reservaContingencia: 0,
            resultadoCorrente: 0,
            fontes: 1,
            fontesDesequilibradas: 0,
            leitura: null
        },
        cruzamento: [
            {
                fonte: "1899000",
                nome: null,
                grupo: null,
                especificacao: null,
                detalhamento: null,
                bloco: "Outras vinculações",
                receitaBruta: 1000,
                deducoes: 0,
                receitaLiquida: 1000,
                despesaFixada: 1000,
                resultado: 0,
                situacao: "equilibrado",
                receitas: [],
                despesas: []
            }
        ],
        receitas: [
            {
                codigo: "11125001",
                codigoConta: "11125000",
                nome: "IPTU — Principal",
                categoria: "Receitas Correntes.",
                valor: 120000
            }
        ],
        despesas: [],
        deducoes: [],
        porFuncao: [],
        porUnidade: [],
        porPrograma: [],
        avisos: [],
        detalhes: [],
        ...parcial
    };
}

describe("pdf do relatório", () => {
    it("preserva o português e troca o travessão que a fonte padrão não desenha", () => {
        expect(textoPdf("Orçamento — 2025")).toBe("Orçamento - 2025");
        expect(textoPdf("Participação")).toBe("Participação");
    });

    it("nomeia o arquivo com o exercício", () => {
        expect(nomeArquivoRelatorio("2025")).toBe("relatorio-orcamento-2025.pdf");
        expect(nomeArquivoRelatorio(null)).toBe("relatorio-orcamento.pdf");
    });

    it("monta um arquivo pdf com a capa e o logo", async () => {
        const logo = new Uint8Array(readFileSync("src/presentation/assets/img/logo.jpeg"));
        const bytes = await montarPdfRelatorio(resposta(), logo);
        expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
        expect(bytes.byteLength).toBeGreaterThan(5000);
    });
});
