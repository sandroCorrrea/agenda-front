export type PreviaVaga = {
    cargo: string;
    uf: string;
    unidade: string;
    quantidade: string;
};

export type LeituraConsultaVagas = {
    linhas: PreviaVaga[];
    erro: string | null;
};

const VAZIOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "NAO DIVULGAVEL", "-1", "-3", "-4"]);
const CARGO_POR_CODIGO: Record<string, string> = {
    "1": "Presidente",
    "2": "Vice-presidente",
    "3": "Governador",
    "4": "Vice-governador",
    "5": "Senador",
    "6": "Deputado federal",
    "7": "Deputado estadual",
    "8": "Deputado distrital",
    "9": "1º suplente",
    "10": "2º suplente",
    "11": "Prefeito",
    "12": "Vice-prefeito",
    "13": "Vereador"
};

function cabecalho(nome: string): string {
    return nome
        .replace(/^\uFEFF/, "")
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
}

function limpo(valor: string): string {
    const texto = valor.trim();
    if (VAZIOS.has(texto.toUpperCase())) return "";
    return texto;
}

function cargoDe(codigo: string, texto: string): string {
    if (texto) return texto;
    const cd = codigo.replace(/^0+/, "");
    return (cd && CARGO_POR_CODIGO[cd]) || codigo;
}

function parseCsv(texto: string, delimitador: string): string[][] {
    const linhas: string[][] = [];
    let linha: string[] = [];
    let celula = "";
    let aspas = false;

    for (let i = 0; i < texto.length; i += 1) {
        const char = texto[i];
        if (aspas) {
            if (char === '"') {
                if (texto[i + 1] === '"') {
                    celula += '"';
                    i += 1;
                } else {
                    aspas = false;
                }
            } else {
                celula += char;
            }
            continue;
        }
        if (char === '"') {
            aspas = true;
        } else if (char === delimitador) {
            linha.push(celula);
            celula = "";
        } else if (char === "\n") {
            linha.push(celula);
            linhas.push(linha);
            linha = [];
            celula = "";
        } else if (char !== "\r") {
            celula += char;
        }
    }
    if (celula.length > 0 || linha.length > 0) {
        linha.push(celula);
        linhas.push(linha);
    }
    return linhas.filter((item) => item.some((valor) => valor.trim() !== ""));
}

export function lerConsultaVagasTexto(texto: string): LeituraConsultaVagas {
    const vazio: LeituraConsultaVagas = { linhas: [], erro: null };
    const primeiraLinha = texto.split(/\r?\n/, 1)[0] ?? "";
    if (!primeiraLinha.trim()) return { ...vazio, erro: "O arquivo não tem cabeçalho." };

    const delimitador = primeiraLinha.split(";").length >= primeiraLinha.split(",").length ? ";" : ",";
    const tabela = parseCsv(texto, delimitador);
    const primeira = tabela[0];
    if (!primeira) return { ...vazio, erro: "O arquivo não tem cabeçalho." };

    const indice = new Map<string, number>();
    primeira.forEach((coluna, posicao) => {
        const nome = cabecalho(coluna);
        if (!indice.has(nome)) indice.set(nome, posicao);
    });

    if (indice.has("nm_candidato") || indice.has("nome")) {
        return { ...vazio, erro: "Este arquivo é o consulta_cand. Use o campo de candidatos." };
    }
    if (indice.has("ds_tipo_bem_candidato") || indice.has("vr_bem_candidato")) {
        return { ...vazio, erro: "Este arquivo é o de bens. Use o campo de bens." };
    }
    if (indice.has("ds_situacao_julgamento")) {
        return { ...vazio, erro: "Este arquivo é o complementar. Use o campo de informações complementares." };
    }
    if (indice.has("tp_agremiacao") || indice.has("sq_coligacao") || indice.has("nm_coligacao")) {
        return { ...vazio, erro: "Este arquivo é o de coligações. Use o campo de coligações." };
    }
    if (!indice.has("qt_vaga") && !indice.has("qt_vagas")) {
        return { ...vazio, erro: "O CSV de vagas precisa de QT_VAGA." };
    }
    if (!indice.has("cd_cargo") && !indice.has("ds_cargo")) {
        return { ...vazio, erro: "O CSV de vagas precisa de CD_CARGO ou DS_CARGO." };
    }

    const celula = (linha: string[], nomes: string[]) => {
        for (const nome of nomes) {
            const posicao = indice.get(nome);
            if (posicao == null) continue;
            const valor = limpo(linha[posicao] ?? "");
            if (valor) return valor;
        }
        return "";
    };

    const linhas = tabela.slice(1).map((linha) => ({
        cargo: cargoDe(celula(linha, ["cd_cargo"]), celula(linha, ["ds_cargo"])),
        uf: celula(linha, ["sg_uf", "uf"]),
        unidade: celula(linha, ["nm_ue", "unidade_eleitoral"]),
        quantidade: celula(linha, ["qt_vaga", "qt_vagas"])
    }));

    return { linhas, erro: null };
}

export async function lerConsultaVagasArquivo(arquivo: File): Promise<LeituraConsultaVagas> {
    const buffer = await arquivo.arrayBuffer();
    const utf8 = new TextDecoder("utf-8", { fatal: true });
    let texto: string;
    try {
        texto = utf8.decode(buffer);
    } catch {
        texto = new TextDecoder("iso-8859-1").decode(buffer);
    }
    return lerConsultaVagasTexto(texto);
}
