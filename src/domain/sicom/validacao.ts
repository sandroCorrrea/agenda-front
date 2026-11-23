export type SicomValidacaoStatus = "valido" | "invalido" | "erro";

export interface SicomValidacaoOcorrencia {
    severity: string | null;
    arquivo: string | null;
    linha: number | null;
    coluna: number | null;
    campo: string | null;
    valor: string | null;
    mensagem: string | null;
}

export interface SicomValidacaoArquivo {
    arquivo: string | null;
    leiaute: string | null;
    codificacaoLida: string | null;
    linhas: number | null;
    erros: SicomValidacaoOcorrencia[];
    avisos: SicomValidacaoOcorrencia[];
    totalErros: number | null;
    totalAvisos: number | null;
}

export interface SicomValidacaoManual {
    arquivo: string | null;
    versao: string | null;
    modulo: string | null;
    avisos: string[];
}

export interface SicomValidacaoRemessa {
    arquivo: string | null;
    arquivos: string[];
}

export interface SicomValidacaoResposta {
    status: SicomValidacaoStatus | null;
    mensagem: string | null;
    manual: SicomValidacaoManual | null;
    remessa: SicomValidacaoRemessa | null;
    totalErros: number | null;
    totalAvisos: number | null;
    erros: SicomValidacaoOcorrencia[];
    avisos: SicomValidacaoOcorrencia[];
    resultados: SicomValidacaoArquivo[];
    detalhes: string[];
}
