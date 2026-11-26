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
    if (!encontrado) return null;
    const tipo = TIPO_POR_PREFIXO[encontrado[1].toUpperCase()];
    if (!tipo) return null;
    return {
        tipo,
        codigoMunicipio: encontrado[2],
        ano: Number(encontrado[3])
    };
}
