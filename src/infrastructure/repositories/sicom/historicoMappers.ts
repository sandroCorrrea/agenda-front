import type {
    SicomHistoricoConta,
    SicomHistoricoDetalhe,
    SicomHistoricoExclusao,
    SicomHistoricoGravacao,
    SicomHistoricoGravacaoItem,
    SicomHistoricoLista,
    SicomHistoricoListaItem,
    SicomHistoricoMunicipio
} from "@/domain/sicom/historico";
import type { SicomRelatorioSituacao } from "@/domain/sicom/relatorio";

function registro(valor: unknown): Record<string, unknown> | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    return valor as Record<string, unknown>;
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

function textos(valor: unknown): string[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter((item) => item != null).map((item) => String(item));
}

function mapItemGravacao(valor: unknown): SicomHistoricoGravacaoItem {
    const bruto = registro(valor) ?? {};
    return {
        id: reais(bruto.id),
        municipio: textoCru(bruto.municipio),
        exercicio: reais(bruto.exercicio),
        arquivo: textoCru(bruto.arquivo),
        substituido: bruto.substituido === true,
        receitaLiquida: reais(bruto.receitaLiquida),
        despesaFixada: reais(bruto.despesaFixada),
        resultado: reais(bruto.resultado),
        contas: reais(bruto.contas)
    };
}

function mapItemLista(valor: unknown): SicomHistoricoListaItem {
    const bruto = registro(valor) ?? {};
    return {
        id: reais(bruto.id),
        municipio: textoCru(bruto.municipio),
        nomeMunicipio: textoCru(bruto.nomeMunicipio),
        exercicio: reais(bruto.exercicio),
        arquivo: textoCru(bruto.arquivo),
        receitaBruta: reais(bruto.receitaBruta),
        deducoes: reais(bruto.deducoes),
        receitaLiquida: reais(bruto.receitaLiquida),
        despesaFixada: reais(bruto.despesaFixada),
        resultado: reais(bruto.resultado),
        situacao: situacaoDe(bruto.situacao),
        gravadoEm: textoCru(bruto.gravadoEm)
    };
}

function mapMunicipio(valor: unknown): SicomHistoricoMunicipio {
    const bruto = registro(valor) ?? {};
    return {
        municipio: textoCru(bruto.municipio),
        nomeMunicipio: textoCru(bruto.nomeMunicipio),
        remessas: Array.isArray(bruto.remessas) ? bruto.remessas.map(mapItemLista) : []
    };
}

export function mapContaHistorico(valor: unknown): SicomHistoricoConta {
    const bruto = registro(valor) ?? {};
    return {
        codigo: textoCru(bruto.codigo),
        codigoConta: textoCru(bruto.codigoConta),
        nome: textoCru(bruto.nome),
        categoria: textoCru(bruto.categoria),
        grupo: textoCru(bruto.grupo),
        modalidade: textoCru(bruto.modalidade),
        elemento: textoCru(bruto.elemento),
        identificador: textoCru(bruto.identificador),
        valor: reais(bruto.valor)
    };
}

export function mapGravacaoHistorico(valor: unknown): SicomHistoricoGravacao {
    const bruto = registro(valor);
    if (!bruto || (bruto.status !== "salvo" && bruto.status !== "erro")) {
        return { status: null, mensagem: null, total: null, remessas: [], detalhes: [] };
    }
    return {
        status: bruto.status,
        mensagem: textoCru(bruto.mensagem),
        total: reais(bruto.total),
        remessas: Array.isArray(bruto.remessas) ? bruto.remessas.map(mapItemGravacao) : [],
        detalhes: textos(bruto.detalhes)
    };
}

export function mapListaHistorico(valor: unknown): SicomHistoricoLista {
    const bruto = registro(valor);
    if (!bruto || (bruto.status !== "listado" && bruto.status !== "erro")) {
        return { status: null, mensagem: null, municipios: [], detalhes: [] };
    }
    return {
        status: bruto.status,
        mensagem: textoCru(bruto.mensagem),
        municipios: Array.isArray(bruto.municipios) ? bruto.municipios.map(mapMunicipio) : [],
        detalhes: textos(bruto.detalhes)
    };
}

export function mapDetalheHistorico(valor: unknown): SicomHistoricoDetalhe {
    const bruto = registro(valor);
    if (!bruto || (bruto.status !== "detalhado" && bruto.status !== "erro")) {
        return {
            status: null,
            mensagem: null,
            id: null,
            municipio: null,
            exercicio: null,
            arquivo: null,
            receitaBruta: null,
            deducoesTotal: null,
            receitaLiquida: null,
            despesaFixada: null,
            resultado: null,
            situacao: null,
            gravadoEm: null,
            receitas: [],
            despesas: [],
            deducoes: [],
            detalhes: []
        };
    }
    return {
        status: bruto.status,
        mensagem: textoCru(bruto.mensagem),
        id: reais(bruto.id),
        municipio: textoCru(bruto.municipio),
        exercicio: reais(bruto.exercicio),
        arquivo: textoCru(bruto.arquivo),
        receitaBruta: reais(bruto.receitaBruta),
        deducoesTotal: Array.isArray(bruto.deducoes) ? null : reais(bruto.deducoes),
        receitaLiquida: reais(bruto.receitaLiquida),
        despesaFixada: reais(bruto.despesaFixada),
        resultado: reais(bruto.resultado),
        situacao: situacaoDe(bruto.situacao),
        gravadoEm: textoCru(bruto.gravadoEm),
        receitas: Array.isArray(bruto.receitas) ? bruto.receitas.map(mapContaHistorico) : [],
        despesas: Array.isArray(bruto.despesas) ? bruto.despesas.map(mapContaHistorico) : [],
        deducoes: Array.isArray(bruto.deducoes) ? bruto.deducoes.map(mapContaHistorico) : [],
        detalhes: textos(bruto.detalhes)
    };
}

export function mapExclusaoHistorico(valor: unknown): SicomHistoricoExclusao {
    const bruto = registro(valor);
    if (!bruto || (bruto.status !== "excluido" && bruto.status !== "erro")) {
        return { status: null, mensagem: null, id: null, municipio: null, exercicio: null, detalhes: [] };
    }
    return {
        status: bruto.status,
        mensagem: textoCru(bruto.mensagem),
        id: reais(bruto.id),
        municipio: textoCru(bruto.municipio),
        exercicio: reais(bruto.exercicio),
        detalhes: textos(bruto.detalhes)
    };
}
