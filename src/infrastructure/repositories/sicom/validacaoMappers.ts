import type {
    SicomValidacaoArquivo,
    SicomValidacaoManual,
    SicomValidacaoOcorrencia,
    SicomValidacaoRemessa,
    SicomValidacaoResposta,
    SicomValidacaoStatus
} from "@/domain/sicom/validacao";

function registro(valor: unknown): Record<string, unknown> {
    return valor != null && typeof valor === "object" && !Array.isArray(valor)
        ? (valor as Record<string, unknown>)
        : {};
}

function textoPresente(valor: unknown): string | null {
    if (valor == null) return null;
    const saida = String(valor);
    return saida === "" ? null : saida;
}

function numeroOpcional(valor: unknown): number | null {
    if (valor == null || valor === "") return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

function inteiro(valor: unknown): number | null {
    const numero = numeroOpcional(valor);
    if (numero == null || !Number.isInteger(numero)) return null;
    return numero;
}

function statusDe(valor: unknown): SicomValidacaoStatus | null {
    if (valor === "valido" || valor === "invalido" || valor === "erro") return valor;
    return null;
}

function mapOcorrencia(valor: unknown): SicomValidacaoOcorrencia {
    const bruto = registro(valor);
    return {
        severity: textoPresente(bruto.severity),
        arquivo: textoPresente(bruto.arquivo),
        linha: inteiro(bruto.linha),
        coluna: inteiro(bruto.coluna),
        campo: textoPresente(bruto.campo),
        valor: bruto.valor == null ? null : String(bruto.valor),
        mensagem: bruto.mensagem == null ? null : String(bruto.mensagem)
    };
}

function mapOcorrencias(valor: unknown): SicomValidacaoOcorrencia[] {
    if (!Array.isArray(valor)) return [];
    return valor.map(mapOcorrencia);
}

function mapAvisosManual(valor: unknown): string[] {
    if (!Array.isArray(valor)) return [];
    const saida: string[] = [];
    for (const item of valor) {
        if (typeof item === "string") {
            if (item !== "") saida.push(item);
            continue;
        }
        const mensagem = registro(item).mensagem;
        if (mensagem != null) saida.push(String(mensagem));
    }
    return saida;
}

function mapTextos(valor: unknown): string[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter((item) => item != null && String(item) !== "").map((item) => String(item));
}

function mapManual(valor: unknown): SicomValidacaoManual | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    const bruto = valor as Record<string, unknown>;
    return {
        arquivo: textoPresente(bruto.arquivo),
        versao: textoPresente(bruto.versao),
        modulo: textoPresente(bruto.modulo),
        avisos: mapAvisosManual(bruto.avisos)
    };
}

function mapRemessa(valor: unknown): SicomValidacaoRemessa | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    const bruto = valor as Record<string, unknown>;
    return {
        arquivo: textoPresente(bruto.arquivo),
        arquivos: mapTextos(bruto.arquivos)
    };
}

function mapArquivo(valor: unknown): SicomValidacaoArquivo {
    const bruto = registro(valor);
    return {
        arquivo: textoPresente(bruto.arquivo),
        leiaute: textoPresente(bruto.leiaute),
        codificacaoLida: textoPresente(bruto.codificacaoLida),
        linhas: inteiro(bruto.linhas),
        erros: mapOcorrencias(bruto.erros),
        avisos: mapOcorrencias(bruto.avisos),
        totalErros: inteiro(bruto.totalErros),
        totalAvisos: inteiro(bruto.totalAvisos)
    };
}

export function mapValidacao(payload: unknown): SicomValidacaoResposta {
    const bruto = registro(payload);
    return {
        status: statusDe(bruto.status),
        mensagem: bruto.mensagem == null ? null : String(bruto.mensagem),
        manual: mapManual(bruto.manual),
        remessa: mapRemessa(bruto.remessa),
        totalErros: inteiro(bruto.totalErros),
        totalAvisos: inteiro(bruto.totalAvisos),
        erros: mapOcorrencias(bruto.erros),
        avisos: mapOcorrencias(bruto.avisos),
        resultados: Array.isArray(bruto.resultados) ? bruto.resultados.map(mapArquivo) : [],
        detalhes: mapTextos(bruto.detalhes)
    };
}
