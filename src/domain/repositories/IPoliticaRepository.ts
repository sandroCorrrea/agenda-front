import type { EleicaoSalvarDTO, CargoSalvarDTO, PartidoSalvarDTO, CandidatoSalvarDTO, PesquisaSalvarDTO, PesquisaPerguntasSalvarDTO, PesquisaRespostaSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import type {
    ArquivoExportado,
    Cargo,
    Candidato,
    Eleicao,
    MunicipioPolitica,
    Partido,
    PesquisaDetalhe,
    PesquisaResultado,
    PesquisaResumo,
    PoliticaListaQuery,
    PoliticaMensagem,
    PoliticaPagina,
    ResultadoFiltro
} from "@/domain/politica/tipos";

export interface IPoliticaRepository {
    obterPesquisaPublica(token: string): Promise<PesquisaDetalhe>;
    enviarResposta(token: string, dto: PesquisaRespostaSalvarDTO): Promise<PoliticaMensagem>;

    listarEleicoes(query?: PoliticaListaQuery): Promise<PoliticaPagina<Eleicao>>;
    obterEleicao(id: number): Promise<Eleicao>;
    criarEleicao(dto: EleicaoSalvarDTO): Promise<Eleicao>;
    atualizarEleicao(id: number, dto: EleicaoSalvarDTO): Promise<Eleicao>;
    excluirEleicao(id: number): Promise<PoliticaMensagem>;
    enviarArquivoEleicao(id: number, arquivo: File): Promise<PoliticaMensagem>;
    sincronizarEleicao(id: number): Promise<PoliticaMensagem>;

    listarCargos(query?: PoliticaListaQuery): Promise<PoliticaPagina<Cargo>>;
    criarCargo(dto: CargoSalvarDTO): Promise<Cargo>;
    atualizarCargo(id: number, dto: CargoSalvarDTO): Promise<Cargo>;
    excluirCargo(id: number): Promise<PoliticaMensagem>;

    listarPartidos(query?: PoliticaListaQuery): Promise<PoliticaPagina<Partido>>;
    criarPartido(dto: PartidoSalvarDTO): Promise<Partido>;
    atualizarPartido(id: number, dto: PartidoSalvarDTO): Promise<Partido>;
    excluirPartido(id: number): Promise<PoliticaMensagem>;

    listarCandidatos(query?: PoliticaListaQuery): Promise<PoliticaPagina<Candidato>>;
    obterCandidato(id: number): Promise<Candidato>;
    criarCandidato(dto: CandidatoSalvarDTO): Promise<Candidato>;
    atualizarCandidato(id: number, dto: CandidatoSalvarDTO): Promise<Candidato>;
    excluirCandidato(id: number): Promise<PoliticaMensagem>;

    listarMunicipios(): Promise<MunicipioPolitica[]>;

    listarPesquisas(query?: PoliticaListaQuery): Promise<PoliticaPagina<PesquisaResumo>>;
    obterPesquisa(id: number): Promise<PesquisaDetalhe>;
    criarPesquisa(dto: PesquisaSalvarDTO): Promise<PesquisaDetalhe>;
    atualizarPesquisa(id: number, dto: PesquisaSalvarDTO): Promise<PesquisaDetalhe>;
    excluirPesquisa(id: number): Promise<PoliticaMensagem>;
    atualizarStatusPesquisa(id: number, status: string): Promise<PesquisaDetalhe>;
    salvarPerguntas(id: number, dto: PesquisaPerguntasSalvarDTO): Promise<PesquisaDetalhe>;
    obterResultados(id: number, filtro?: ResultadoFiltro): Promise<PesquisaResultado>;
    exportarCsv(id: number, filtro?: ResultadoFiltro): Promise<ArquivoExportado>;
    exportarPdf(id: number, filtro?: ResultadoFiltro): Promise<ArquivoExportado>;
}
