export type EleicaoTipo = "municipal" | "estadual" | "federal" | "geral";
export type EleicaoStatus = "rascunho" | "aberta" | "encerrada";
export type CargoEsfera = "federal" | "estadual" | "municipal";
export type PartidoStatus = "ativo" | "inativo";
export type CandidatoStatus = "ativo" | "inativo" | "indeferido";
export type PesquisaTipo = "interna" | "divulgacao_publica";
export type PesquisaStatus = "rascunho" | "publicada" | "pausada" | "encerrada" | "arquivada";
export type EstrategiaDuplicidade = "nenhuma" | "sessao" | "cookie" | "token";
export type TipoPergunta =
    | "escolha_unica"
    | "escolha_multipla"
    | "texto"
    | "numero"
    | "escala"
    | "candidato"
    | "municipio"
    | "faixa_etaria"
    | "genero"
    | "escolaridade"
    | "renda"
    | "sim_nao";

export type PoliticaListaQuery = {
    q?: string;
    status?: string;
    tipo?: string;
    ano?: number;
    eleicao_id?: number;
    cargo_id?: number;
    partido_id?: number;
    ibge?: string;
    page?: number;
    per_page?: number;
};

export type PoliticaPagina<T> = {
    itens: T[];
    total: number;
    pagina: number;
    porPagina: number;
};

export type Eleicao = {
    id: number;
    nome: string;
    ano: number;
    tipo: EleicaoTipo | string;
    dataInicio: string | null;
    dataFim: string | null;
    status: EleicaoStatus | string;
    possuiArquivo: boolean;
    sincronizadoEm: string | null;
};

export type Cargo = {
    id: number;
    codigo: string;
    nome: string;
    esfera: CargoEsfera | string;
    ativo: boolean;
};

export type Partido = {
    id: number;
    numero: number;
    sigla: string;
    nome: string;
    status: PartidoStatus | string;
};

export type Candidato = {
    id: number;
    eleicaoId: number;
    eleicaoNome: string | null;
    cargoId: number;
    cargoNome: string | null;
    partidoId: number | null;
    partidoSigla: string | null;
    ibge: string | null;
    uf: string | null;
    tseId: string | null;
    numero: string;
    nome: string;
    nomeUrna: string;
    fotoUrl: string | null;
    status: CandidatoStatus | string;
};

export type MunicipioPolitica = {
    ibge: string;
    nome: string;
    uf: string | null;
};

export type PesquisaMetodologia = {
    contratante: string | null;
    responsavel: string | null;
    populacaoAlvo: string | null;
    tamanhoAmostra: number | null;
    inicioColeta: string | null;
    fimColeta: string | null;
    planoAmostral: string | null;
    margemErro: string | null;
    intervaloConfianca: string | null;
    registroEleitoral: string | null;
    observacoes: string | null;
};

export type PesquisaOpcao = {
    id: number;
    rotulo: string;
    valor: string;
    candidatoId: number | null;
    codigoEspecial: string | null;
    ordem: number;
};

export type PesquisaPergunta = {
    id: number;
    tipo: TipoPergunta | string;
    titulo: string;
    descricao: string | null;
    obrigatoria: boolean;
    ordem: number;
    ativo: boolean;
    configuracao: Record<string, unknown>;
    escala: { min: number; max: number } | null;
    opcoes: PesquisaOpcao[];
};

export type PesquisaCargoVinculo = {
    id: number | null;
    codigo: string | null;
    nome: string | null;
};

export type PesquisaResumo = {
    id: number;
    nome: string;
    eleicaoId: number | null;
    eleicaoNome: string | null;
    tipo: PesquisaTipo | string;
    status: PesquisaStatus | string;
    publica: boolean;
    inicioEm: string | null;
    fimEm: string | null;
};

export type PesquisaEleicaoResumo = {
    id: number | null;
    nome: string;
    ano: number | null;
    tipo: string | null;
};

export type PesquisaDetalhe = {
    id: number | null;
    token: string | null;
    nome: string;
    descricao: string | null;
    tipo: PesquisaTipo | string;
    status: PesquisaStatus | string;
    publica: boolean;
    inicioEm: string | null;
    fimEm: string | null;
    exibirRevisao: boolean;
    avisoPrivacidade: string | null;
    estrategiaDuplicidade: EstrategiaDuplicidade | string | null;
    linkPublico: string | null;
    eleicao: PesquisaEleicaoResumo | null;
    municipiosIbge: string[];
    municipios: MunicipioPolitica[];
    cargos: PesquisaCargoVinculo[];
    candidatos: Candidato[];
    perguntas: PesquisaPergunta[];
    metodologia: PesquisaMetodologia | null;
    sessaoSugerida: string | null;
    tokenAcesso: string | null;
    totalPerguntas: number | null;
    aviso: string | null;
};

export type ResultadoFiltro = {
    ibge?: string;
    cargo_id?: number;
    pergunta_id?: number;
    inicio?: string;
    fim?: string;
};

export type ResultadoOpcao = {
    opcaoId: number;
    rotulo: string;
    candidatoId: number | null;
    total: number;
    percentual: number;
};

export type ResultadoTexto = {
    valor: string;
    total: number;
};

export type ResultadoNumero = {
    valor: number;
    total: number;
};

export type ResultadoPergunta = {
    id: number;
    titulo: string;
    tipo: string;
    opcoes: ResultadoOpcao[];
    textos: ResultadoTexto[];
    numeros: ResultadoNumero[];
};

export type ResultadoMunicipio = {
    ibge: string | null;
    nome: string;
    total: number;
};

export type ResultadoEvolucao = {
    data: string;
    total: number;
};

export type PesquisaResultado = {
    aviso: string;
    pesquisa: {
        id: number;
        nome: string;
        tipo: string;
        status: string;
        eleicao: string | null;
    };
    totalRespostas: number;
    respostasConcluidas: number;
    respostasIncompletas: number;
    percentualConclusao: number;
    municipios: ResultadoMunicipio[];
    evolucao: ResultadoEvolucao[];
    perguntas: ResultadoPergunta[];
    metodologia: {
        responsavel: string | null;
        planoAmostral: string | null;
        tamanhoAmostra: number | null;
        margemErro: string | null;
        intervaloConfianca: string | null;
        registroEleitoral: string | null;
        observacoes: string | null;
    } | null;
};

export type PoliticaMensagem = {
    message: string;
    protocolo?: number;
    sessaoId?: string;
    concluida?: boolean;
    possuiArquivo?: boolean;
    sincronizacaoId?: number;
    status?: string;
};

export type ArquivoExportado = {
    blob: Blob;
    filename: string;
};
