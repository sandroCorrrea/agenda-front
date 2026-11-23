import type {
    AbaReceitaOrcamentaria,
    ReceitaOrcamentariaArquivo,
    ReceitaOrcamentariaEnvio,
    ReceitaOrcamentariaLista
} from "@/domain/casp/receitaOrcamentaria";

function registro(valor: unknown): Record<string, unknown> {
    return valor != null && typeof valor === "object" && !Array.isArray(valor)
        ? (valor as Record<string, unknown>)
        : {};
}

function inteiro(valor: unknown): number {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < 0) return 0;
    return Math.trunc(numero);
}

function texto(valor: unknown): string {
    if (typeof valor === "string") return valor;
    if (valor == null) return "";
    return String(valor);
}

function apelidoDe(valor: unknown): string | null {
    if (typeof valor !== "string") return null;
    return valor.trim() ? valor.trim() : null;
}

function textos(valor: unknown): string[] {
    if (!Array.isArray(valor)) return [];
    return valor.map((item) => (item == null ? "" : String(item)));
}

function mapAba(valor: unknown): AbaReceitaOrcamentaria {
    const bruto = registro(valor);
    return {
        nome: texto(bruto.nome),
        linhas: inteiro(bruto.linhas),
        colunas: inteiro(bruto.colunas),
        primeiraLinha: textos(bruto.primeiraLinha)
    };
}

export function mapArquivoReceita(valor: unknown): ReceitaOrcamentariaArquivo {
    const bruto = registro(valor);
    const tratamento = registro(bruto.tratamento);
    const abas = Array.isArray(tratamento.abas) ? tratamento.abas.map(mapAba) : [];
    return {
        id: inteiro(bruto.id),
        apelido: apelidoDe(bruto.apelido),
        nomeOriginal: texto(bruto.nomeOriginal),
        tamanhoBytes: inteiro(bruto.tamanhoBytes),
        quantidadeAbas: inteiro(bruto.quantidadeAbas),
        quantidadeLinhas: inteiro(bruto.quantidadeLinhas),
        situacao: texto(bruto.situacao),
        tratamento: { abas },
        criadoEm: texto(bruto.criadoEm),
        downloadUrl: texto(bruto.downloadUrl)
    };
}

export function mapListaReceita(valor: unknown): ReceitaOrcamentariaLista {
    const bruto = registro(valor);
    const arquivos = Array.isArray(bruto.arquivos) ? bruto.arquivos.map(mapArquivoReceita) : [];
    return {
        arquivos,
        total: inteiro(bruto.total),
        pagina: inteiro(bruto.pagina) || 1,
        porPagina: inteiro(bruto.porPagina) || 20
    };
}

export function mapEnvioReceita(valor: unknown): ReceitaOrcamentariaEnvio {
    const bruto = registro(valor);
    return {
        message: texto(bruto.message),
        arquivo: mapArquivoReceita(bruto.arquivo)
    };
}
