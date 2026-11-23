import type {
    SicomRelatorioDespesa,
    SicomRelatorioDespesaFonte,
    SicomRelatorioDeducao,
    SicomRelatorioEmentario,
    SicomRelatorioFonte,
    SicomRelatorioReceita,
    SicomRelatorioReceitaFonte,
    SicomRelatorioRemessa,
    SicomRelatorioReparticao,
    SicomRelatorioResposta,
    SicomRelatorioResumo,
    SicomRelatorioSituacao,
    SicomRelatorioStatus
} from "@/domain/sicom/relatorio";

function registro(valor: unknown): Record<string, unknown> {
    return valor != null && typeof valor === "object" && !Array.isArray(valor)
        ? (valor as Record<string, unknown>)
        : {};
}

function textoCru(valor: unknown): string | null {
    if (valor == null) return null;
    return String(valor);
}

function reais(valor: unknown): number | null {
    if (typeof valor !== "number" || !Number.isFinite(valor)) return null;
    return valor;
}

function situacaoDe(valor: unknown): SicomRelatorioSituacao | null {
    if (valor === "superavit" || valor === "equilibrado" || valor === "deficit") return valor;
    return null;
}

function statusDe(valor: unknown): SicomRelatorioStatus | null {
    if (valor === "gerado" || valor === "erro") return valor;
    return null;
}

function textos(valor: unknown): string[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter((item) => item != null).map((item) => String(item));
}

function mapReceitaFonte(valor: unknown): SicomRelatorioReceitaFonte {
    const bruto = registro(valor);
    return {
        codigo: textoCru(bruto.codigo),
        nome: textoCru(bruto.nome),
        valor: reais(bruto.valor),
        deducao: bruto.deducao === true
    };
}

function mapDespesaFonte(valor: unknown): SicomRelatorioDespesaFonte {
    const bruto = registro(valor);
    return {
        codigo: textoCru(bruto.codigo),
        nome: textoCru(bruto.nome),
        valor: reais(bruto.valor)
    };
}

function mapFonte(valor: unknown): SicomRelatorioFonte {
    const bruto = registro(valor);
    return {
        fonte: textoCru(bruto.fonte),
        nome: textoCru(bruto.nome),
        grupo: textoCru(bruto.grupo),
        especificacao: textoCru(bruto.especificacao),
        detalhamento: textoCru(bruto.detalhamento),
        bloco: textoCru(bruto.bloco),
        receitaBruta: reais(bruto.receitaBruta),
        deducoes: reais(bruto.deducoes),
        receitaLiquida: reais(bruto.receitaLiquida),
        despesaFixada: reais(bruto.despesaFixada),
        resultado: reais(bruto.resultado),
        situacao: situacaoDe(bruto.situacao),
        receitas: Array.isArray(bruto.receitas) ? bruto.receitas.map(mapReceitaFonte) : [],
        despesas: Array.isArray(bruto.despesas) ? bruto.despesas.map(mapDespesaFonte) : []
    };
}

function mapReceita(valor: unknown): SicomRelatorioReceita {
    const bruto = registro(valor);
    return {
        codigo: textoCru(bruto.codigo),
        codigoConta: textoCru(bruto.codigoConta),
        nome: textoCru(bruto.nome),
        categoria: textoCru(bruto.categoria),
        valor: reais(bruto.valor)
    };
}

function mapDespesa(valor: unknown): SicomRelatorioDespesa {
    const bruto = registro(valor);
    return {
        codigo: textoCru(bruto.codigo),
        nome: textoCru(bruto.nome),
        categoria: textoCru(bruto.categoria),
        grupo: textoCru(bruto.grupo),
        modalidade: textoCru(bruto.modalidade),
        elemento: textoCru(bruto.elemento),
        valor: reais(bruto.valor)
    };
}

function mapDeducao(valor: unknown): SicomRelatorioDeducao {
    const bruto = registro(valor);
    return {
        codigo: textoCru(bruto.codigo),
        nome: textoCru(bruto.nome),
        identificador: textoCru(bruto.identificador),
        descricao: textoCru(bruto.descricao),
        valor: reais(bruto.valor)
    };
}

function mapReparticao(valor: unknown): SicomRelatorioReparticao {
    const bruto = registro(valor);
    return {
        codigo: textoCru(bruto.codigo),
        nome: textoCru(bruto.nome),
        valor: reais(bruto.valor)
    };
}

function mapResumo(valor: unknown): SicomRelatorioResumo | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    const bruto = registro(valor);
    return {
        receitaBruta: reais(bruto.receitaBruta),
        deducoes: reais(bruto.deducoes),
        receitaLiquida: reais(bruto.receitaLiquida),
        despesaFixada: reais(bruto.despesaFixada),
        resultado: reais(bruto.resultado),
        situacao: situacaoDe(bruto.situacao),
        receitaCorrenteLiquida: reais(bruto.receitaCorrenteLiquida),
        receitaCapitalLiquida: reais(bruto.receitaCapitalLiquida),
        despesaCorrente: reais(bruto.despesaCorrente),
        despesaCapital: reais(bruto.despesaCapital),
        reservaContingencia: reais(bruto.reservaContingencia),
        resultadoCorrente: reais(bruto.resultadoCorrente),
        fontes: reais(bruto.fontes),
        fontesDesequilibradas: reais(bruto.fontesDesequilibradas),
        leitura: textoCru(bruto.leitura)
    };
}

function mapEmentario(valor: unknown): SicomRelatorioEmentario | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    const bruto = registro(valor);
    return {
        arquivo: textoCru(bruto.arquivo),
        planilha: textoCru(bruto.planilha),
        totalContas: reais(bruto.totalContas)
    };
}

function mapRemessa(valor: unknown): SicomRelatorioRemessa | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    const bruto = registro(valor);
    return {
        arquivo: textoCru(bruto.arquivo),
        arquivos: textos(bruto.arquivos)
    };
}

export function mapRelatorio(valor: unknown): SicomRelatorioResposta {
    const bruto = registro(valor);
    return {
        status: statusDe(bruto.status),
        mensagem: textoCru(bruto.mensagem),
        exercicio: textoCru(bruto.exercicio),
        ementario: mapEmentario(bruto.ementario),
        remessa: mapRemessa(bruto.remessa),
        resumo: mapResumo(bruto.resumo),
        cruzamento: Array.isArray(bruto.cruzamento) ? bruto.cruzamento.map(mapFonte) : [],
        receitas: Array.isArray(bruto.receitas) ? bruto.receitas.map(mapReceita) : [],
        despesas: Array.isArray(bruto.despesas) ? bruto.despesas.map(mapDespesa) : [],
        deducoes: Array.isArray(bruto.deducoes) ? bruto.deducoes.map(mapDeducao) : [],
        porFuncao: Array.isArray(bruto.porFuncao) ? bruto.porFuncao.map(mapReparticao) : [],
        porUnidade: Array.isArray(bruto.porUnidade) ? bruto.porUnidade.map(mapReparticao) : [],
        porPrograma: Array.isArray(bruto.porPrograma) ? bruto.porPrograma.map(mapReparticao) : [],
        avisos: textos(bruto.avisos),
        detalhes: textos(bruto.detalhes)
    };
}
