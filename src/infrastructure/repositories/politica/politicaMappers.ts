import type {
    BemCandidato,
    BensCandidato,
    Candidato,
    CandidatoColigacao,
    CandidatoComplementar,
    CandidatoFicha,
    Cargo,
    Eleicao,
    MunicipioPolitica,
    Partido,
    PesquisaCargoVinculo,
    PesquisaDetalhe,
    PesquisaMetodologia,
    PesquisaOpcao,
    PesquisaPergunta,
    PesquisaResultado,
    PesquisaResumo,
    HistoricoCandidatura,
    MotivoCandidato,
    RedeCandidato,
    PoliticaMensagem,
    VagaEleicao,
    PoliticaPagina
} from "@/domain/politica/tipos";

function texto(valor: unknown): string | null {
    if (valor == null) return null;
    const s = String(valor).trim();
    return s === "" ? null : s;
}

function obrigatorio(valor: unknown, fallback = ""): string {
    return texto(valor) ?? fallback;
}

function numero(valor: unknown): number | null {
    if (valor == null || valor === "") return null;
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
}

function inteiro(valor: unknown): number | null {
    if (typeof valor === "number" && Number.isInteger(valor)) return valor;
    if (typeof valor === "string" && /^-?\d+$/.test(valor.trim())) return Number(valor.trim());
    return null;
}

function bool(valor: unknown): boolean {
    return valor === true || valor === 1 || valor === "1" || valor === "true";
}

function registro(valor: unknown): Record<string, unknown> {
    return valor != null && typeof valor === "object" && !Array.isArray(valor)
        ? (valor as Record<string, unknown>)
        : {};
}

export function mapEleicao(item: Record<string, unknown>): Eleicao {
    return {
        id: Number(item.id ?? 0),
        nome: obrigatorio(item.nome),
        ano: Number(item.ano ?? 0),
        tipo: obrigatorio(item.tipo),
        dataInicio: texto(item.dataInicio),
        dataFim: texto(item.dataFim),
        status: obrigatorio(item.status, "rascunho"),
        possuiArquivo: bool(item.possuiArquivo),
        sincronizadoEm: texto(item.sincronizadoEm),
        possuiArquivoComplementar: bool(item.possuiArquivoComplementar),
        complementarEm: texto(item.complementarEm),
        possuiArquivoBens: bool(item.possuiArquivoBens),
        bensEm: texto(item.bensEm),
        possuiArquivoColigacao: bool(item.possuiArquivoColigacao),
        coligacaoEm: texto(item.coligacaoEm),
        possuiArquivoVagas: bool(item.possuiArquivoVagas),
        vagasEm: texto(item.vagasEm),
        vagas: mapVagas(item.vagas),
        possuiArquivoMotivos: bool(item.possuiArquivoMotivos),
        motivosEm: texto(item.motivosEm),
        possuiArquivoRedes: bool(item.possuiArquivoRedes),
        redesEm: texto(item.redesEm),
        possuiArquivoHistorico: bool(item.possuiArquivoHistorico),
        historicoEm: texto(item.historicoEm),
        possuiArquivoFotos: bool(item.possuiArquivoFotos),
        fotosEm: texto(item.fotosEm)
    };
}

function mapVaga(valor: unknown): VagaEleicao | null {
    const item = registro(valor);
    const quantidade = inteiro(item.quantidade);
    if (quantidade == null) return null;
    return {
        cargoCodigo: obrigatorio(item.cargoCodigo),
        cargoNome: texto(item.cargoNome),
        uf: texto(item.uf),
        siglaUe: texto(item.siglaUe),
        unidadeEleitoral: texto(item.unidadeEleitoral),
        quantidade,
        posse: texto(item.posse)
    };
}

function mapVagas(valor: unknown): VagaEleicao[] {
    if (!Array.isArray(valor)) return [];
    return valor.flatMap((item) => {
        const vaga = mapVaga(item);
        return vaga ? [vaga] : [];
    });
}

export function mapCargo(item: Record<string, unknown>): Cargo {
    return {
        id: Number(item.id ?? 0),
        codigo: obrigatorio(item.codigo),
        nome: obrigatorio(item.nome),
        esfera: obrigatorio(item.esfera),
        ativo: item.ativo == null ? true : bool(item.ativo)
    };
}

export function mapPartido(item: Record<string, unknown>): Partido {
    return {
        id: Number(item.id ?? 0),
        numero: Number(item.numero ?? 0),
        sigla: obrigatorio(item.sigla),
        nome: obrigatorio(item.nome),
        status: obrigatorio(item.status, "ativo")
    };
}

function marca(valor: unknown): "S" | "N" | null {
    const item = texto(valor);
    if (item === "S" || item === "N") return item;
    return null;
}

function inseridoUrna(valor: unknown): "sim" | "nao" | null {
    const item = texto(valor)?.toLowerCase();
    if (item === "sim" || item === "nao") return item;
    return null;
}

function mapComplementar(valor: unknown): CandidatoComplementar | null {
    if (valor == null) return null;
    const item = registro(valor);
    const complementar: CandidatoComplementar = {
        nacionalidade: texto(item.nacionalidade),
        municipioNascimento: texto(item.municipioNascimento),
        idadePosse: texto(item.idadePosse),
        quilombola: marca(item.quilombola),
        etniaIndigena: texto(item.etniaIndigena),
        despesaMaxCampanha: texto(item.despesaMaxCampanha),
        reeleicao: marca(item.reeleicao),
        declararBens: marca(item.declararBens),
        numeroProcesso: texto(item.numeroProcesso),
        inseridoUrna: inseridoUrna(item.inseridoUrna),
        destinacaoVotos: texto(item.destinacaoVotos),
        situacaoTot: texto(item.situacaoTot),
        situacaoJulgamento: texto(item.situacaoJulgamento),
        situacaoJulgamentoPleito: texto(item.situacaoJulgamentoPleito),
        situacaoJulgamentoUrna: texto(item.situacaoJulgamentoUrna),
        prestouContas: marca(item.prestouContas),
        substituido: marca(item.substituido),
        sqSubstituido: texto(item.sqSubstituido),
        aceiteCandidatura: texto(item.aceiteCandidatura),
        generoFefc: texto(item.generoFefc),
        corRacaFefc: texto(item.corRacaFefc)
    };
    return Object.values(complementar).some(Boolean) ? complementar : null;
}

function mapBem(valor: unknown): BemCandidato {
    const item = registro(valor);
    return {
        ordem: obrigatorio(item.ordem),
        codigoTipo: texto(item.codigoTipo),
        tipo: texto(item.tipo),
        descricao: texto(item.descricao),
        valor: texto(item.valor),
        atualizadoEm: texto(item.atualizadoEm)
    };
}

function mapBens(valor: unknown): BensCandidato | null {
    if (valor == null) return null;
    const item = registro(valor);
    const itens = Array.isArray(item.itens) ? item.itens.map((bem) => mapBem(bem)) : [];
    const valorTotal = texto(item.valorTotal);
    if (item.quantidade == null && valorTotal == null && itens.length === 0) return null;
    return {
        quantidade: Number(item.quantidade ?? itens.length),
        valorTotal: valorTotal ?? "0.00",
        itens
    };
}

function mapColigacao(valor: unknown): CandidatoColigacao | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    const item = registro(valor);
    const coligacao: CandidatoColigacao = {
        tipoAgremiacao: texto(item.tipoAgremiacao),
        nome: texto(item.nome),
        composicao: texto(item.composicao),
        sqColigacao: texto(item.sqColigacao),
        codigoSituacao: texto(item.codigoSituacao),
        situacao: texto(item.situacao),
        destinacaoVotos: texto(item.destinacaoVotos),
        numeroFederacao: texto(item.numeroFederacao),
        nomeFederacao: texto(item.nomeFederacao),
        siglaFederacao: texto(item.siglaFederacao),
        composicaoFederacao: texto(item.composicaoFederacao),
        turno: texto(item.turno),
        unidadeEleitoral: texto(item.unidadeEleitoral),
        partidoNumero: texto(item.partidoNumero),
        partidoSigla: texto(item.partidoSigla)
    };
    return Object.values(coligacao).some(Boolean) ? coligacao : null;
}

function mapFicha(valor: unknown): CandidatoFicha | null {
    const item = registro(valor);
    const ficha: CandidatoFicha = {
        nomeSocial: texto(item.nomeSocial),
        genero: texto(item.genero),
        grauInstrucao: texto(item.grauInstrucao),
        ocupacao: texto(item.ocupacao),
        corRaca: texto(item.corRaca),
        agremiacao: texto(item.agremiacao),
        federacao: texto(item.federacao),
        coligacao: texto(item.coligacao),
        situacao: texto(item.situacao),
        unidadeEleitoral: texto(item.unidadeEleitoral)
    };
    return Object.values(ficha).some(Boolean) ? ficha : null;
}

export function mapCandidato(item: Record<string, unknown>): Candidato {
    return {
        id: Number(item.id ?? 0),
        eleicaoId: Number(item.eleicaoId ?? 0),
        eleicaoNome: texto(item.eleicaoNome),
        cargoId: Number(item.cargoId ?? 0),
        cargoNome: texto(item.cargoNome),
        partidoId: numero(item.partidoId),
        partidoSigla: texto(item.partidoSigla),
        ibge: texto(item.ibge),
        uf: texto(item.uf),
        tseId: texto(item.tseId),
        numero: obrigatorio(item.numero),
        nome: obrigatorio(item.nome),
        nomeUrna: obrigatorio(item.nomeUrna),
        fotoUrl: texto(item.fotoUrl),
        status: obrigatorio(item.status, "ativo"),
        ficha: mapFicha(item.ficha),
        complementar: mapComplementar(item.complementar),
        bens: mapBens(item.bens),
        coligacao: mapColigacao(item.coligacao),
        quantidadeVagas: inteiro(item.quantidadeVagas),
        motivos: mapMotivos(item.motivos),
        redes: mapRedes(item.redes),
        historico: mapHistorico(item.historico)
    };
}

const MARCADORES_VAZIOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "NAO DIVULGAVEL", "-1", "-3", "-4"]);

function textoSemMarcador(valor: unknown): string | null {
    const s = texto(valor);
    if (!s || MARCADORES_VAZIOS.has(s.toUpperCase())) return null;
    return s;
}

function mapMotivo(valor: unknown): MotivoCandidato | null {
    const item = registro(valor);
    const tipo = texto(item.tipo);
    const descricao = texto(item.descricao);
    if (!tipo && !descricao) return null;
    return {
        tipo,
        descricao,
        processo: textoSemMarcador(item.processo)
    };
}

function mapMotivos(valor: unknown): MotivoCandidato[] | null {
    if (!Array.isArray(valor)) return null;
    const lista = valor.flatMap((item) => {
        const motivo = mapMotivo(item);
        return motivo ? [motivo] : [];
    });
    return lista.length ? lista : null;
}

function mapRede(valor: unknown): RedeCandidato | null {
    const item = registro(valor);
    const url = textoSemMarcador(item.url);
    if (!url) return null;
    return {
        ordem: texto(item.ordem) ?? "",
        url,
        rede: textoSemMarcador(item.rede)
    };
}

function mapRedes(valor: unknown): RedeCandidato[] | null {
    if (!Array.isArray(valor)) return null;
    const lista = valor.flatMap((item) => {
        const rede = mapRede(item);
        return rede ? [rede] : [];
    });
    if (!lista.length) return null;
    return lista.sort((a, b) => Number(a.ordem) - Number(b.ordem));
}

function mapHistoricoItem(valor: unknown): HistoricoCandidatura | null {
    const item = registro(valor);
    const linha: HistoricoCandidatura = {
        ano: textoSemMarcador(item.ano),
        turno: textoSemMarcador(item.turno),
        abrangencia: textoSemMarcador(item.abrangencia),
        uf: textoSemMarcador(item.uf),
        unidade: textoSemMarcador(item.unidade),
        cargo: textoSemMarcador(item.cargo),
        numero: textoSemMarcador(item.numero),
        nome: textoSemMarcador(item.nome),
        nomeUrna: textoSemMarcador(item.nomeUrna),
        partidoNumero: textoSemMarcador(item.partidoNumero),
        partidoSigla: textoSemMarcador(item.partidoSigla),
        partidoNome: textoSemMarcador(item.partidoNome),
        situacaoCandidatura: textoSemMarcador(item.situacaoCandidatura),
        situacaoJulgamento: textoSemMarcador(item.situacaoJulgamento),
        resultado: textoSemMarcador(item.resultado),
        data: textoSemMarcador(item.data)
    };
    return Object.values(linha).some(Boolean) ? linha : null;
}

function mapHistorico(valor: unknown): HistoricoCandidatura[] | null {
    if (!Array.isArray(valor)) return null;
    const lista = valor.flatMap((item) => {
        const linha = mapHistoricoItem(item);
        return linha ? [linha] : [];
    });
    return lista.length ? lista : null;
}

export function mapMunicipio(item: Record<string, unknown>): MunicipioPolitica {
    return {
        ibge: obrigatorio(item.ibge),
        nome: obrigatorio(item.nome ?? item.localidade, obrigatorio(item.ibge)),
        uf: texto(item.uf)
    };
}

function mapOpcao(item: Record<string, unknown>): PesquisaOpcao {
    return {
        id: Number(item.id ?? 0),
        rotulo: obrigatorio(item.rotulo),
        valor: obrigatorio(item.valor),
        candidatoId: numero(item.candidatoId),
        codigoEspecial: texto(item.codigoEspecial),
        ordem: Number(item.ordem ?? 0)
    };
}

function mapPergunta(item: Record<string, unknown>): PesquisaPergunta {
    const escalaBruta = registro(item.escala);
    const temEscala = item.escala != null && typeof item.escala === "object";
    const opcoes = Array.isArray(item.opcoes) ? item.opcoes.map((op) => mapOpcao(registro(op))) : [];
    return {
        id: Number(item.id ?? 0),
        tipo: obrigatorio(item.tipo),
        titulo: obrigatorio(item.titulo),
        descricao: texto(item.descricao),
        obrigatoria: bool(item.obrigatoria),
        ordem: Number(item.ordem ?? 0),
        ativo: item.ativo == null ? true : bool(item.ativo),
        configuracao: registro(item.configuracao),
        escala: temEscala
            ? {
                  min: Number(escalaBruta.min ?? 0),
                  max: Number(escalaBruta.max ?? 10)
              }
            : null,
        opcoes
    };
}

function mapMetodologia(item: unknown): PesquisaMetodologia | null {
    if (item == null || typeof item !== "object") return null;
    const m = item as Record<string, unknown>;
    return {
        contratante: texto(m.contratante),
        responsavel: texto(m.responsavel),
        populacaoAlvo: texto(m.populacaoAlvo),
        tamanhoAmostra: numero(m.tamanhoAmostra),
        inicioColeta: texto(m.inicioColeta),
        fimColeta: texto(m.fimColeta),
        planoAmostral: texto(m.planoAmostral),
        margemErro: texto(m.margemErro),
        intervaloConfianca: texto(m.intervaloConfianca),
        registroEleitoral: texto(m.registroEleitoral),
        observacoes: texto(m.observacoes)
    };
}

function mapMunicipiosDetalhe(brutos: unknown): { ibges: string[]; opcoes: MunicipioPolitica[] } {
    if (!Array.isArray(brutos)) return { ibges: [], opcoes: [] };
    if (brutos.length === 0) return { ibges: [], opcoes: [] };
    if (typeof brutos[0] === "string" || typeof brutos[0] === "number") {
        const ibges = brutos.map((item) => String(item));
        return { ibges, opcoes: [] };
    }
    const opcoes = brutos.map((item) => mapMunicipio(registro(item)));
    return { ibges: opcoes.map((item) => item.ibge), opcoes };
}

export function mapPesquisaResumo(item: Record<string, unknown>): PesquisaResumo {
    return {
        id: Number(item.id ?? 0),
        nome: obrigatorio(item.nome),
        eleicaoId: numero(item.eleicaoId),
        eleicaoNome: texto(item.eleicaoNome),
        tipo: obrigatorio(item.tipo),
        status: obrigatorio(item.status, "rascunho"),
        publica: bool(item.publica),
        inicioEm: texto(item.inicioEm),
        fimEm: texto(item.fimEm)
    };
}

export function mapPesquisaDetalhe(item: Record<string, unknown>): PesquisaDetalhe {
    const eleicao = registro(item.eleicao);
    const municipios = mapMunicipiosDetalhe(item.municipios);
    const cargos = Array.isArray(item.cargos)
        ? item.cargos.map((cargo) => {
              const c = registro(cargo);
              return {
                  id: numero(c.id),
                  codigo: texto(c.codigo),
                  nome: texto(c.nome)
              } satisfies PesquisaCargoVinculo;
          })
        : [];
    const candidatos = Array.isArray(item.candidatos)
        ? item.candidatos.map((candidato) => mapCandidato(registro(candidato)))
        : [];
    const perguntas = Array.isArray(item.perguntas)
        ? item.perguntas.map((pergunta) => mapPergunta(registro(pergunta)))
        : [];

    return {
        id: numero(item.id),
        token: texto(item.token),
        nome: obrigatorio(item.nome),
        descricao: texto(item.descricao),
        tipo: obrigatorio(item.tipo),
        status: obrigatorio(item.status, "rascunho"),
        publica: bool(item.publica),
        inicioEm: texto(item.inicioEm),
        fimEm: texto(item.fimEm),
        exibirRevisao: item.exibirRevisao == null ? true : bool(item.exibirRevisao),
        avisoPrivacidade: texto(item.avisoPrivacidade),
        estrategiaDuplicidade: texto(item.estrategiaDuplicidade),
        linkPublico: texto(item.linkPublico),
        eleicao: item.eleicao
            ? {
                  id: numero(eleicao.id),
                  nome: obrigatorio(eleicao.nome),
                  ano: numero(eleicao.ano),
                  tipo: texto(eleicao.tipo)
              }
            : null,
        municipiosIbge: municipios.ibges,
        municipios: municipios.opcoes,
        cargos,
        candidatos,
        perguntas,
        metodologia: mapMetodologia(item.metodologia),
        sessaoSugerida: texto(item.sessaoSugerida),
        tokenAcesso: texto(item.tokenAcesso),
        totalPerguntas: numero(item.totalPerguntas),
        aviso: texto(item.aviso)
    };
}

export function mapResultado(item: Record<string, unknown>): PesquisaResultado {
    const pesquisa = registro(item.pesquisa);
    const metodologia = mapMetodologia(item.metodologia);
    return {
        aviso: obrigatorio(
            item.aviso,
            "Estes números são o resultado da coleta. Não representam previsão do resultado da eleição."
        ),
        pesquisa: {
            id: Number(pesquisa.id ?? 0),
            nome: obrigatorio(pesquisa.nome),
            tipo: obrigatorio(pesquisa.tipo),
            status: obrigatorio(pesquisa.status),
            eleicao: texto(pesquisa.eleicao)
        },
        totalRespostas: Number(item.totalRespostas ?? 0),
        respostasConcluidas: Number(item.respostasConcluidas ?? 0),
        respostasIncompletas: Number(item.respostasIncompletas ?? 0),
        percentualConclusao: Number(item.percentualConclusao ?? 0),
        municipios: Array.isArray(item.municipios)
            ? item.municipios.map((linha) => {
                  const m = registro(linha);
                  return {
                      ibge: texto(m.ibge),
                      nome: obrigatorio(m.nome, "Não informado"),
                      total: Number(m.total ?? 0)
                  };
              })
            : [],
        evolucao: Array.isArray(item.evolucao)
            ? item.evolucao.map((linha) => {
                  const e = registro(linha);
                  return { data: obrigatorio(e.data), total: Number(e.total ?? 0) };
              })
            : [],
        perguntas: Array.isArray(item.perguntas)
            ? item.perguntas.map((linha) => {
                  const p = registro(linha);
                  return {
                      id: Number(p.id ?? 0),
                      titulo: obrigatorio(p.titulo),
                      tipo: obrigatorio(p.tipo),
                      opcoes: Array.isArray(p.opcoes)
                          ? p.opcoes.map((op) => {
                                const o = registro(op);
                                return {
                                    opcaoId: Number(o.opcaoId ?? 0),
                                    rotulo: obrigatorio(o.rotulo),
                                    candidatoId: numero(o.candidatoId),
                                    total: Number(o.total ?? 0),
                                    percentual: Number(o.percentual ?? 0)
                                };
                            })
                          : [],
                      textos: Array.isArray(p.textos)
                          ? p.textos.map((tx) => {
                                const t = registro(tx);
                                return { valor: obrigatorio(t.valor), total: Number(t.total ?? 0) };
                            })
                          : [],
                      numeros: Array.isArray(p.numeros)
                          ? p.numeros.map((nx) => {
                                const n = registro(nx);
                                return { valor: Number(n.valor ?? 0), total: Number(n.total ?? 0) };
                            })
                          : []
                  };
              })
            : [],
        metodologia: metodologia
            ? {
                  responsavel: metodologia.responsavel,
                  planoAmostral: metodologia.planoAmostral,
                  tamanhoAmostra: metodologia.tamanhoAmostra,
                  margemErro: metodologia.margemErro,
                  intervaloConfianca: metodologia.intervaloConfianca,
                  registroEleitoral: metodologia.registroEleitoral,
                  observacoes: metodologia.observacoes
              }
            : null
    };
}

export function mapMensagem(item: Record<string, unknown>): PoliticaMensagem {
    return {
        message: obrigatorio(item.message, "Operação concluída."),
        protocolo: numero(item.protocolo) ?? undefined,
        sessaoId: texto(item.sessaoId) ?? undefined,
        concluida: item.concluida == null ? undefined : bool(item.concluida),
        possuiArquivo: item.possuiArquivo == null ? undefined : bool(item.possuiArquivo),
        possuiArquivoComplementar: item.possuiArquivoComplementar == null ? undefined : bool(item.possuiArquivoComplementar),
        possuiArquivoBens: item.possuiArquivoBens == null ? undefined : bool(item.possuiArquivoBens),
        possuiArquivoColigacao: item.possuiArquivoColigacao == null ? undefined : bool(item.possuiArquivoColigacao),
        possuiArquivoVagas: item.possuiArquivoVagas == null ? undefined : bool(item.possuiArquivoVagas),
        possuiArquivoMotivos: item.possuiArquivoMotivos == null ? undefined : bool(item.possuiArquivoMotivos),
        possuiArquivoRedes: item.possuiArquivoRedes == null ? undefined : bool(item.possuiArquivoRedes),
        possuiArquivoHistorico: item.possuiArquivoHistorico == null ? undefined : bool(item.possuiArquivoHistorico),
        possuiArquivoFotos: item.possuiArquivoFotos == null ? undefined : bool(item.possuiArquivoFotos),
        sincronizacaoId: numero(item.sincronizacaoId) ?? undefined,
        status: texto(item.status) ?? undefined,
        tipo: texto(item.tipo) ?? undefined
    };
}

export function mapPagina<T>(
    data: Record<string, unknown>,
    chave: string,
    mapear: (item: Record<string, unknown>) => T,
    page: number,
    perPage: number
): PoliticaPagina<T> {
    const brutos = Array.isArray(data[chave]) ? (data[chave] as unknown[]) : [];
    return {
        itens: brutos.map((item) => mapear(registro(item))),
        total: Number(data.total ?? 0),
        pagina: Number(data.pagina ?? page),
        porPagina: Number(data.porPagina ?? perPage)
    };
}

export function limparParams(query: object | undefined): Record<string, string | number> {
    const params: Record<string, string | number> = {};
    if (!query) return params;
    for (const [chave, valor] of Object.entries(query)) {
        if (valor == null) continue;
        if (typeof valor === "string" && valor.trim() === "") continue;
        if (typeof valor === "number" && !Number.isFinite(valor)) continue;
        params[chave] = typeof valor === "string" ? valor.trim() : valor;
    }
    return params;
}
