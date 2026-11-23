import type {
    SicomContaArquivo,
    SicomContaArquivoSemCorrespondencia,
    SicomContaClassificacao,
    SicomContaDetalhe,
    SicomContaDicionario,
    SicomContaEmentario,
    SicomContaOcorrencia,
    SicomContaSemVinculo,
    SicomContasResposta,
    SicomContasStatus
} from "@/domain/sicom/contas";

function registro(valor: unknown): Record<string, unknown> {
    return valor != null && typeof valor === "object" && !Array.isArray(valor)
        ? (valor as Record<string, unknown>)
        : {};
}

function textoCru(valor: unknown): string | null {
    if (valor == null) return null;
    return String(valor);
}

function inteiro(valor: unknown): number | null {
    if (valor == null || valor === "") return null;
    const numero = Number(valor);
    if (!Number.isFinite(numero) || !Number.isInteger(numero)) return null;
    return numero;
}

function statusDe(valor: unknown): SicomContasStatus | null {
    if (valor === "vinculado" || valor === "erro") return valor;
    return null;
}

function textos(valor: unknown): string[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter((item) => item != null).map((item) => String(item));
}

function camposRegistro(valor: unknown): string[] {
    if (!Array.isArray(valor)) return [];
    return valor.map((item) => (item == null ? "" : String(item)));
}

function mapClassificacao(valor: unknown): SicomContaClassificacao[] {
    if (!Array.isArray(valor)) return [];
    return valor.map((item) => {
        const bruto = registro(item);
        return {
            nivel: textoCru(bruto.nivel),
            codigo: textoCru(bruto.codigo),
            nome: textoCru(bruto.nome)
        };
    });
}

function mapContaCampos(valor: unknown): Record<string, string | null> {
    const bruto = registro(valor);
    const saida: Record<string, string | null> = {};
    for (const [chave, item] of Object.entries(bruto)) {
        saida[chave] = item == null ? null : String(item);
    }
    return saida;
}

function mapDetalhe(valor: unknown): SicomContaDetalhe {
    const bruto = registro(valor);
    return {
        linha: inteiro(bruto.linha),
        registro: camposRegistro(bruto.registro)
    };
}

function mapOcorrencia(valor: unknown): SicomContaOcorrencia {
    const bruto = registro(valor);
    return {
        arquivo: textoCru(bruto.arquivo),
        linha: inteiro(bruto.linha),
        nomeNaRemessa: textoCru(bruto.nomeNaRemessa),
        valor: bruto.valor == null ? null : String(bruto.valor),
        registro: camposRegistro(bruto.registro),
        detalhes: Array.isArray(bruto.detalhes) ? bruto.detalhes.map(mapDetalhe) : []
    };
}

function mapDicionario(valor: unknown): SicomContaDicionario {
    const bruto = registro(valor);
    return {
        codigoInformado: textoCru(bruto.codigoInformado),
        codigoConta: textoCru(bruto.codigoConta),
        desdobramento: textoCru(bruto.desdobramento),
        rotuloDesdobramento: textoCru(bruto.rotuloDesdobramento),
        especificacao: textoCru(bruto.especificacao),
        descricao: textoCru(bruto.descricao),
        status: textoCru(bruto.status),
        caminho: textoCru(bruto.caminho),
        classificacao: mapClassificacao(bruto.classificacao),
        conta: mapContaCampos(bruto.conta),
        ocorrencias: Array.isArray(bruto.ocorrencias) ? bruto.ocorrencias.map(mapOcorrencia) : []
    };
}

function mapSemVinculo(valor: unknown): SicomContaSemVinculo {
    const bruto = registro(valor);
    return {
        linha: inteiro(bruto.linha),
        codigoInformado: textoCru(bruto.codigoInformado),
        registro: camposRegistro(bruto.registro)
    };
}

function mapArquivo(valor: unknown): SicomContaArquivo {
    const bruto = registro(valor);
    return {
        arquivo: textoCru(bruto.arquivo),
        coluna: inteiro(bruto.coluna),
        totalVinculos: inteiro(bruto.totalVinculos),
        totalSemVinculo: inteiro(bruto.totalSemVinculo),
        semVinculo: Array.isArray(bruto.semVinculo) ? bruto.semVinculo.map(mapSemVinculo) : []
    };
}

function mapSemCorrespondencia(valor: unknown): SicomContaArquivoSemCorrespondencia {
    const bruto = registro(valor);
    return {
        arquivo: textoCru(bruto.arquivo),
        mensagem: textoCru(bruto.mensagem)
    };
}

function mapEmentario(valor: unknown): SicomContaEmentario | null {
    if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return null;
    const bruto = valor as Record<string, unknown>;
    return {
        arquivo: textoCru(bruto.arquivo),
        planilha: textoCru(bruto.planilha),
        colunaCodigo: textoCru(bruto.colunaCodigo),
        colunaNome: textoCru(bruto.colunaNome),
        totalContas: inteiro(bruto.totalContas),
        niveis: textos(bruto.niveis)
    };
}

export function mapContas(payload: unknown): SicomContasResposta {
    const bruto = registro(payload);
    const remessa = registro(bruto.remessa);
    return {
        status: statusDe(bruto.status),
        mensagem: textoCru(bruto.mensagem),
        ementario: mapEmentario(bruto.ementario),
        remessa:
            bruto.remessa == null
                ? null
                : {
                      arquivo: textoCru(remessa.arquivo),
                      arquivos: textos(remessa.arquivos)
                  },
        totalContas: inteiro(bruto.totalContas),
        totalOcorrencias: inteiro(bruto.totalOcorrencias),
        totalSemVinculo: inteiro(bruto.totalSemVinculo),
        dicionario: Array.isArray(bruto.dicionario) ? bruto.dicionario.map(mapDicionario) : [],
        arquivos: Array.isArray(bruto.arquivos) ? bruto.arquivos.map(mapArquivo) : [],
        arquivosSemCorrespondencia: Array.isArray(bruto.arquivosSemCorrespondencia)
            ? bruto.arquivosSemCorrespondencia.map(mapSemCorrespondencia)
            : [],
        detalhes: textos(bruto.detalhes)
    };
}
