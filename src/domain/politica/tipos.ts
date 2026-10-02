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

export type VagaEleicao = {
    cargoCodigo: string;
    cargoNome: string | null;
    uf: string | null;
    siglaUe: string | null;
    unidadeEleitoral: string | null;
    quantidade: number;
    posse: string | null;
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
    possuiArquivoComplementar: boolean;
    complementarEm: string | null;
    possuiArquivoBens: boolean;
    bensEm: string | null;
    possuiArquivoColigacao: boolean;
    coligacaoEm: string | null;
    possuiArquivoVagas: boolean;
    vagasEm: string | null;
    vagas: VagaEleicao[];
    possuiArquivoMotivos: boolean;
    motivosEm: string | null;
    possuiArquivoRedes: boolean;
    redesEm: string | null;
    possuiArquivoHistorico: boolean;
    historicoEm: string | null;
    possuiArquivoFotos: boolean;
    fotosEm: string | null;
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

export type CandidatoFicha = {
    nomeSocial: string | null;
    genero: string | null;
    grauInstrucao: string | null;
    ocupacao: string | null;
    corRaca: string | null;
    agremiacao: string | null;
    federacao: string | null;
    coligacao: string | null;
    situacao: string | null;
    unidadeEleitoral: string | null;
};

export type CandidatoComplementar = {
    nacionalidade: string | null;
    municipioNascimento: string | null;
    idadePosse: string | null;
    quilombola: "S" | "N" | null;
    etniaIndigena: string | null;
    despesaMaxCampanha: string | null;
    reeleicao: "S" | "N" | null;
    declararBens: "S" | "N" | null;
    numeroProcesso: string | null;
    inseridoUrna: "sim" | "nao" | null;
    destinacaoVotos: string | null;
    situacaoTot: string | null;
    situacaoJulgamento: string | null;
    situacaoJulgamentoPleito: string | null;
    situacaoJulgamentoUrna: string | null;
    prestouContas: "S" | "N" | null;
    substituido: "S" | "N" | null;
    sqSubstituido: string | null;
    aceiteCandidatura: string | null;
    generoFefc: string | null;
    corRacaFefc: string | null;
};

export type BemCandidato = {
    ordem: string;
    codigoTipo: string | null;
    tipo: string | null;
    descricao: string | null;
    valor: string | null;
    atualizadoEm: string | null;
};

export type BensCandidato = {
    quantidade: number;
    valorTotal: string;
    itens: BemCandidato[];
};

export type CandidatoColigacao = {
    tipoAgremiacao: string | null;
    nome: string | null;
    composicao: string | null;
    sqColigacao: string | null;
    codigoSituacao: string | null;
    situacao: string | null;
    destinacaoVotos: string | null;
    numeroFederacao: string | null;
    nomeFederacao: string | null;
    siglaFederacao: string | null;
    composicaoFederacao: string | null;
    turno: string | null;
    unidadeEleitoral: string | null;
    partidoNumero: string | null;
    partidoSigla: string | null;
};

export type HistoricoCandidatura = {
    ano: string | null;
    turno: string | null;
    abrangencia: "municipal" | "estadual" | "federal" | string | null;
    uf: string | null;
    unidade: string | null;
    cargo: string | null;
    numero: string | null;
    nome: string | null;
    nomeUrna: string | null;
    partidoNumero: string | null;
    partidoSigla: string | null;
    partidoNome: string | null;
    situacaoCandidatura: string | null;
    situacaoJulgamento: string | null;
    resultado: string | null;
    data: string | null;
};

export type RedeCandidato = {
    ordem: string;
    url: string;
    rede: string | null;
};

export type MotivoCandidato = {
    tipo: string | null;
    descricao: string | null;
    processo: string | null;
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
    ficha: CandidatoFicha | null;
    complementar: CandidatoComplementar | null;
    bens: BensCandidato | null;
    coligacao: CandidatoColigacao | null;
    quantidadeVagas: number | null;
    motivos: MotivoCandidato[] | null;
    redes: RedeCandidato[] | null;
    historico: HistoricoCandidatura[] | null;
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
    possuiArquivoComplementar?: boolean;
    possuiArquivoBens?: boolean;
    possuiArquivoColigacao?: boolean;
    possuiArquivoVagas?: boolean;
    possuiArquivoMotivos?: boolean;
    possuiArquivoRedes?: boolean;
    possuiArquivoHistorico?: boolean;
    possuiArquivoFotos?: boolean;
    sincronizacaoId?: number;
    status?: string;
    tipo?: string;
};

export type ArquivoExportado = {
    blob: Blob;
    filename: string;
};
