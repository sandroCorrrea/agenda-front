import type {
    CargoEsfera,
    CandidatoStatus,
    EleicaoStatus,
    EleicaoTipo,
    EstrategiaDuplicidade,
    PartidoStatus,
    PesquisaTipo,
    PesquisaStatus,
    TipoPergunta
} from "@/domain/politica/tipos";

export type EleicaoSalvarDTO = {
    nome: string;
    ano: number;
    tipo: EleicaoTipo;
    data_inicio?: string | null;
    data_fim?: string | null;
    status?: EleicaoStatus;
};

export type CargoSalvarDTO = {
    codigo: string;
    nome: string;
    esfera: CargoEsfera;
    ativo?: boolean;
};

export type PartidoSalvarDTO = {
    numero: number;
    sigla: string;
    nome: string;
    status?: PartidoStatus;
};

export type CandidatoSalvarDTO = {
    eleicao_id: number;
    cargo_id: number;
    partido_id?: number | null;
    ibge?: string | null;
    uf?: string | null;
    tse_id?: string | null;
    numero: string;
    nome: string;
    nome_urna: string;
    foto_url?: string | null;
    status?: CandidatoStatus;
};

export type MetodologiaSalvarDTO = {
    contratante?: string | null;
    responsavel?: string | null;
    populacao_alvo?: string | null;
    tamanho_amostra?: number | null;
    inicio_coleta?: string | null;
    fim_coleta?: string | null;
    plano_amostral?: string | null;
    margem_erro?: string | null;
    intervalo_confianca?: string | null;
    registro_eleitoral?: string | null;
    observacoes?: string | null;
};

export type PesquisaSalvarDTO = {
    nome: string;
    descricao?: string | null;
    eleicao_id: number;
    tipo: PesquisaTipo;
    publica?: boolean;
    estrategia_duplicidade?: EstrategiaDuplicidade;
    inicio_em?: string | null;
    fim_em?: string | null;
    exibir_revisao?: boolean;
    aviso_privacidade?: string | null;
    municipios?: string[];
    cargos?: number[];
    candidatos?: number[];
    metodologia?: MetodologiaSalvarDTO | null;
};

export type PerguntaOpcaoSalvarDTO = {
    id?: number;
    rotulo: string;
    valor: string;
    candidato_id?: number | null;
    codigo_especial?: string | null;
    ordem?: number;
};

export type PerguntaSalvarDTO = {
    id?: number;
    tipo: TipoPergunta;
    titulo: string;
    descricao?: string | null;
    obrigatoria?: boolean;
    ordem?: number;
    ativo?: boolean;
    configuracao?: Record<string, unknown>;
    opcoes?: PerguntaOpcaoSalvarDTO[];
};

export type PesquisaPerguntasSalvarDTO = {
    perguntas: PerguntaSalvarDTO[];
};

export type RespostaItemSalvarDTO = {
    pergunta_id: number;
    opcao_id?: number | null;
    opcao_ids?: number[];
    valor_texto?: string | null;
    valor_numerico?: number | null;
};

export type PesquisaRespostaSalvarDTO = {
    sessao_id: string;
    concluida: boolean;
    aceite_privacidade?: boolean;
    ibge?: string | null;
    token_acesso?: string | null;
    respostas: RespostaItemSalvarDTO[];
};
