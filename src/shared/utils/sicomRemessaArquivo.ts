const TIPO_POR_PREFIXO: Record<string, string> = {
    IP: "Instrumento de Planejamento"
};

export type ArquivoRemessaLido = {
    tipo: string;
    codigoMunicipio: string;
    ano: number;
};

/** IP_02002_2023.zip: prefixo, código do município e ano. */
export function lerArquivoRemessa(nome: string | null | undefined): ArquivoRemessaLido | null {
    if (!nome) return null;
    const base = nome.trim().split(/[/\\]/).pop() ?? "";
    const encontrado = /^([A-Za-z]+)_(\d+)_(\d{4})\.zip$/i.exec(base);
    const prefixo = encontrado?.[1];
    const codigoMunicipio = encontrado?.[2];
    const anoTexto = encontrado?.[3];
    if (!prefixo || !codigoMunicipio || !anoTexto) return null;
    const tipo = TIPO_POR_PREFIXO[prefixo.toUpperCase()];
    if (!tipo) return null;
    return {
        tipo,
        codigoMunicipio,
        ano: Number(anoTexto)
    };
}
