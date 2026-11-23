export type SicomRelatorioSituacao = "superavit" | "equilibrado" | "deficit";

export type SicomRelatorioResumo = {
    receitaBruta: number | null;
    deducoes: number | null;
    receitaLiquida: number | null;
    despesaFixada: number | null;
    resultado: number | null;
    situacao: SicomRelatorioSituacao | null;
    receitaCorrenteLiquida: number | null;
    receitaCapitalLiquida: number | null;
    despesaCorrente: number | null;
    despesaCapital: number | null;
    reservaContingencia: number | null;
    resultadoCorrente: number | null;
    fontes: number | null;
    fontesDesequilibradas: number | null;
    leitura: string | null;
};

export type SicomRelatorioReceitaFonte = {
    codigo: string | null;
    nome: string | null;
    valor: number | null;
    deducao: boolean;
};

export type SicomRelatorioDespesaFonte = {
    codigo: string | null;
    nome: string | null;
    valor: number | null;
};

export type SicomRelatorioFonte = {
    fonte: string | null;
    nome: string | null;
    grupo: string | null;
    especificacao: string | null;
    detalhamento: string | null;
    bloco: string | null;
    receitaBruta: number | null;
    deducoes: number | null;
    receitaLiquida: number | null;
    despesaFixada: number | null;
    resultado: number | null;
    situacao: SicomRelatorioSituacao | null;
    receitas: SicomRelatorioReceitaFonte[];
    despesas: SicomRelatorioDespesaFonte[];
};

export type SicomRelatorioReceita = {
    codigo: string | null;
    codigoConta: string | null;
    nome: string | null;
    categoria: string | null;
    valor: number | null;
};

export type SicomRelatorioDespesa = {
    codigo: string | null;
    nome: string | null;
    categoria: string | null;
    grupo: string | null;
    modalidade: string | null;
    elemento: string | null;
    valor: number | null;
};

export type SicomRelatorioDeducao = {
    codigo: string | null;
    nome: string | null;
    identificador: string | null;
    descricao: string | null;
    valor: number | null;
};

export type SicomRelatorioReparticao = {
    codigo: string | null;
    nome: string | null;
    valor: number | null;
};

export type SicomRelatorioEmentario = {
    arquivo: string | null;
    planilha: string | null;
    totalContas: number | null;
};

export type SicomRelatorioRemessa = {
    arquivo: string | null;
    arquivos: string[];
};

export type SicomRelatorioStatus = "gerado" | "erro";

export type SicomRelatorioResposta = {
    status: SicomRelatorioStatus | null;
    mensagem: string | null;
    exercicio: string | null;
    ementario: SicomRelatorioEmentario | null;
    remessa: SicomRelatorioRemessa | null;
    resumo: SicomRelatorioResumo | null;
    cruzamento: SicomRelatorioFonte[];
    receitas: SicomRelatorioReceita[];
    despesas: SicomRelatorioDespesa[];
    deducoes: SicomRelatorioDeducao[];
    porFuncao: SicomRelatorioReparticao[];
    porUnidade: SicomRelatorioReparticao[];
    porPrograma: SicomRelatorioReparticao[];
    avisos: string[];
    detalhes: string[];
};
