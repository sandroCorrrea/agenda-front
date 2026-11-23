import type { SicomRelatorioSituacao } from "@/domain/sicom/relatorio";

export type SicomPrevisaoMetodo = "tendencia" | "crescimento" | "insuficiente" | "encerrada";

export type SicomPrevisaoTotal = {
    exercicio: number | null;
    receitaBruta: number | null;
    deducoes: number | null;
    receitaLiquida: number | null;
    despesaFixada: number | null;
    resultado: number | null;
    situacao: SicomRelatorioSituacao | null;
    metodo: SicomPrevisaoMetodo | null;
};

export type SicomPrevisaoValor = {
    exercicio: number | null;
    valor: number | null;
    metodo: SicomPrevisaoMetodo | null;
};

export type SicomPrevisaoConta = {
    codigo: string | null;
    codigoConta: string | null;
    nome: string | null;
    categoria: string | null;
    grupo: string | null;
    modalidade: string | null;
    elemento: string | null;
    identificador: string | null;
    historico: Array<{ exercicio: number | null; valor: number | null }>;
    ultimoValor: number | null;
    variacaoPercentual: number | null;
    previsao: SicomPrevisaoValor[];
    metodo: SicomPrevisaoMetodo | null;
};

export type SicomPrevisaoTotais = {
    historico: SicomPrevisaoTotal[];
    previsoes: SicomPrevisaoTotal[];
    metodo: SicomPrevisaoMetodo | null;
};

export type SicomPrevisao = {
    status: "previsto" | "erro" | null;
    mensagem: string | null;
    municipio: string | null;
    anos: number[];
    lacunas: number[];
    exercicioBase: number | null;
    horizonte: number | null;
    metodo: SicomPrevisaoMetodo | null;
    totais: SicomPrevisaoTotais | null;
    despesas: SicomPrevisaoConta[];
    receitas: SicomPrevisaoConta[];
    deducoes: SicomPrevisaoConta[];
    avisos: string[];
    detalhes: string[];
};
