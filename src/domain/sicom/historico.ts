import type { SicomRelatorioSituacao } from "@/domain/sicom/relatorio";

export type SicomHistoricoGravacaoItem = {
    id: number | null;
    municipio: string | null;
    exercicio: number | null;
    arquivo: string | null;
    substituido: boolean;
    receitaLiquida: number | null;
    despesaFixada: number | null;
    resultado: number | null;
    contas: number | null;
};

export type SicomHistoricoGravacao = {
    status: "salvo" | "erro" | null;
    mensagem: string | null;
    total: number | null;
    remessas: SicomHistoricoGravacaoItem[];
    detalhes: string[];
};

export type SicomHistoricoListaItem = {
    id: number | null;
    municipio: string | null;
    exercicio: number | null;
    arquivo: string | null;
    receitaBruta: number | null;
    deducoes: number | null;
    receitaLiquida: number | null;
    despesaFixada: number | null;
    resultado: number | null;
    situacao: SicomRelatorioSituacao | null;
    gravadoEm: string | null;
};

export type SicomHistoricoMunicipio = {
    municipio: string | null;
    remessas: SicomHistoricoListaItem[];
};

export type SicomHistoricoLista = {
    status: "listado" | "erro" | null;
    mensagem: string | null;
    municipios: SicomHistoricoMunicipio[];
    detalhes: string[];
};

export type SicomHistoricoConta = {
    codigo: string | null;
    codigoConta: string | null;
    nome: string | null;
    categoria: string | null;
    grupo: string | null;
    modalidade: string | null;
    elemento: string | null;
    identificador: string | null;
    valor: number | null;
};

export type SicomHistoricoDetalhe = {
    status: "detalhado" | "erro" | null;
    mensagem: string | null;
    id: number | null;
    municipio: string | null;
    exercicio: number | null;
    arquivo: string | null;
    receitaBruta: number | null;
    deducoesTotal: number | null;
    receitaLiquida: number | null;
    despesaFixada: number | null;
    resultado: number | null;
    situacao: SicomRelatorioSituacao | null;
    gravadoEm: string | null;
    receitas: SicomHistoricoConta[];
    despesas: SicomHistoricoConta[];
    deducoes: SicomHistoricoConta[];
    detalhes: string[];
};

export type SicomHistoricoExclusao = {
    status: "excluido" | "erro" | null;
    mensagem: string | null;
    id: number | null;
    municipio: string | null;
    exercicio: number | null;
    detalhes: string[];
};
