import type {
    Candidato,
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
    PoliticaMensagem,
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
        sincronizadoEm: texto(item.sincronizadoEm)
    };
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
        status: obrigatorio(item.status, "ativo")
    };
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
        sincronizacaoId: numero(item.sincronizacaoId) ?? undefined,
        status: texto(item.status) ?? undefined
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
