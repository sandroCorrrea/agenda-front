export type SicomContaClassificacao = {
    nivel: string | null;
    codigo: string | null;
    nome: string | null;
};

export type SicomContaDetalhe = {
    linha: number | null;
    registro: string[];
};

export type SicomContaOcorrencia = {
    arquivo: string | null;
    linha: number | null;
    nomeNaRemessa: string | null;
    valor: string | null;
    registro: string[];
    detalhes: SicomContaDetalhe[];
};

export type SicomContaDicionario = {
    codigoInformado: string | null;
    codigoConta: string | null;
    desdobramento: string | null;
    rotuloDesdobramento: string | null;
    especificacao: string | null;
    descricao: string | null;
    status: string | null;
    caminho: string | null;
    classificacao: SicomContaClassificacao[];
    conta: Record<string, string | null>;
    ocorrencias: SicomContaOcorrencia[];
};

export type SicomContaSemVinculo = {
    linha: number | null;
    codigoInformado: string | null;
    registro: string[];
};

export type SicomContaArquivo = {
    arquivo: string | null;
    coluna: number | null;
    totalVinculos: number | null;
    totalSemVinculo: number | null;
    semVinculo: SicomContaSemVinculo[];
};

export type SicomContaArquivoSemCorrespondencia = {
    arquivo: string | null;
    mensagem: string | null;
};

export type SicomContaEmentario = {
    arquivo: string | null;
    planilha: string | null;
    colunaCodigo: string | null;
    colunaNome: string | null;
    totalContas: number | null;
    niveis: string[];
};

export type SicomContasStatus = "vinculado" | "erro";

export type SicomContasResposta = {
    status: SicomContasStatus | null;
    mensagem: string | null;
    ementario: SicomContaEmentario | null;
    remessa: { arquivo: string | null; arquivos: string[] } | null;
    totalContas: number | null;
    totalOcorrencias: number | null;
    totalSemVinculo: number | null;
    dicionario: SicomContaDicionario[];
    arquivos: SicomContaArquivo[];
    arquivosSemCorrespondencia: SicomContaArquivoSemCorrespondencia[];
    detalhes: string[];
};
