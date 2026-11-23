import type {
    SicomPrevisao,
    SicomPrevisaoConta,
    SicomPrevisaoMetodo,
    SicomPrevisaoTotal,
    SicomPrevisaoValor
} from "@/domain/sicom/previsao";
import type { SicomRelatorioSituacao } from "@/domain/sicom/relatorio";

function registro(valor: unknown): Record<string, unknown> | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    return valor as Record<string, unknown>;
}

function textoCru(valor: unknown): string | null {
    if (valor == null) return null;
    return String(valor);
}

function reais(valor: unknown): number | null {
    if (typeof valor !== "number" || !Number.isFinite(valor)) return null;
    return valor;
}

function numeros(valor: unknown): number[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
}

function textos(valor: unknown): string[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter((item) => item != null).map((item) => String(item));
}

function situacaoDe(valor: unknown): SicomRelatorioSituacao | null {
    if (valor === "superavit" || valor === "equilibrado" || valor === "deficit") return valor;
    return null;
}

function metodoDe(valor: unknown): SicomPrevisaoMetodo | null {
    if (valor === "tendencia" || valor === "crescimento" || valor === "insuficiente" || valor === "encerrada") {
        return valor;
    }
    return null;
}

function mapTotal(valor: unknown): SicomPrevisaoTotal {
    const bruto = registro(valor) ?? {};
    return {
        exercicio: reais(bruto.exercicio),
        receitaBruta: reais(bruto.receitaBruta),
        deducoes: reais(bruto.deducoes),
        receitaLiquida: reais(bruto.receitaLiquida),
        despesaFixada: reais(bruto.despesaFixada),
        resultado: reais(bruto.resultado),
        situacao: situacaoDe(bruto.situacao),
        metodo: metodoDe(bruto.metodo)
    };
}

function mapValor(valor: unknown): SicomPrevisaoValor {
    const bruto = registro(valor) ?? {};
    return {
        exercicio: reais(bruto.exercicio),
        valor: reais(bruto.valor),
        metodo: metodoDe(bruto.metodo)
    };
}

function mapConta(valor: unknown): SicomPrevisaoConta {
    const bruto = registro(valor) ?? {};
    return {
        codigo: textoCru(bruto.codigo),
        codigoConta: textoCru(bruto.codigoConta),
        nome: textoCru(bruto.nome),
        categoria: textoCru(bruto.categoria),
        grupo: textoCru(bruto.grupo),
        modalidade: textoCru(bruto.modalidade),
        elemento: textoCru(bruto.elemento),
        identificador: textoCru(bruto.identificador),
        historico: Array.isArray(bruto.historico)
            ? bruto.historico.map((item) => {
                  const ponto = registro(item) ?? {};
                  return { exercicio: reais(ponto.exercicio), valor: reais(ponto.valor) };
              })
            : [],
        ultimoValor: reais(bruto.ultimoValor),
        variacaoPercentual: reais(bruto.variacaoPercentual),
        previsao: Array.isArray(bruto.previsao) ? bruto.previsao.map(mapValor) : [],
        metodo: metodoDe(bruto.metodo)
    };
}

function vazia(): SicomPrevisao {
    return {
        status: null,
        mensagem: null,
        municipio: null,
        anos: [],
        lacunas: [],
        exercicioBase: null,
        horizonte: null,
        metodo: null,
        totais: null,
        despesas: [],
        receitas: [],
        deducoes: [],
        avisos: [],
        detalhes: []
    };
}

export function mapPrevisao(valor: unknown): SicomPrevisao {
    const bruto = registro(valor);
    if (!bruto || (bruto.status !== "previsto" && bruto.status !== "erro")) return vazia();
    const totais = registro(bruto.totais);
    return {
        status: bruto.status,
        mensagem: textoCru(bruto.mensagem),
        municipio: textoCru(bruto.municipio),
        anos: numeros(bruto.anos),
        lacunas: numeros(bruto.lacunas),
        exercicioBase: reais(bruto.exercicioBase),
        horizonte: reais(bruto.horizonte),
        metodo: metodoDe(bruto.metodo),
        totais: totais
            ? {
                  historico: Array.isArray(totais.historico) ? totais.historico.map(mapTotal) : [],
                  previsoes: Array.isArray(totais.previsoes) ? totais.previsoes.map(mapTotal) : [],
                  metodo: metodoDe(totais.metodo)
              }
            : null,
        despesas: Array.isArray(bruto.despesas) ? bruto.despesas.map(mapConta) : [],
        receitas: Array.isArray(bruto.receitas) ? bruto.receitas.map(mapConta) : [],
        deducoes: Array.isArray(bruto.deducoes) ? bruto.deducoes.map(mapConta) : [],
        avisos: textos(bruto.avisos),
        detalhes: textos(bruto.detalhes)
    };
}
