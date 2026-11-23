export type AbaReceitaOrcamentaria = {
    nome: string;
    linhas: number;
    colunas: number;
    primeiraLinha: string[];
};

export type ReceitaOrcamentariaArquivo = {
    id: number;
    apelido: string | null;
    nomeOriginal: string;
    tamanhoBytes: number;
    quantidadeAbas: number;
    quantidadeLinhas: number;
    situacao: string;
    tratamento: { abas: AbaReceitaOrcamentaria[] };
    criadoEm: string;
    downloadUrl: string;
};

export type ReceitaOrcamentariaLista = {
    arquivos: ReceitaOrcamentariaArquivo[];
    total: number;
    pagina: number;
    porPagina: number;
};

export type ReceitaOrcamentariaEnvio = {
    message: string;
    arquivo: ReceitaOrcamentariaArquivo;
};

export type ReceitaOrcamentariaConsulta = {
    q?: string;
    page?: number;
    per_page?: number;
};

export type ReceitaOrcamentariaDownload = {
    blob: Blob;
    filename: string;
};
