export type PreviaColigacao = {
    cargo: string;
    partido: string;
    tipo: string;
    nome: string;
    composicao: string;
    situacao: string;
};

export type LeituraConsultaColigacao = {
    total: number;
    federacoes: number;
    coligacoes: number;
    isolados: number;
    previa: PreviaColigacao[];
    erro: string | null;
};

const VAZIOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "NAO DIVULGAVEL", "-1", "-3", "-4"]);
const COLUNAS = ["tp_agremiacao", "sq_coligacao", "nm_coligacao", "ds_composicao_coligacao"];
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
    const cd = codigo.replace(/^0+/, "");
    if (cd && CARGO_POR_CODIGO[cd]) return CARGO_POR_CODIGO[cd];
    return texto;
}

function classeTipo(tipo: string): "federacao" | "coligacao" | "isolado" | null {
    const marca = tipo.toUpperCase();
    if (marca.includes("FEDERA")) return "federacao";
    if (marca.includes("ISOLAD")) return "isolado";
    if (marca.includes("COLIG")) return "coligacao";
    return null;
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

export function lerConsultaColigacaoTexto(texto: string): LeituraConsultaColigacao {
    const vazio: LeituraConsultaColigacao = {
        total: 0,
        federacoes: 0,
        coligacoes: 0,
        isolados: 0,
        previa: [],
        erro: null
    };
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

    const temColigacao = COLUNAS.some((coluna) => indice.has(coluna));
    if (indice.has("ds_tipo_bem_candidato") || indice.has("vr_bem_candidato")) {
        return { ...vazio, erro: "Este arquivo é o de bens. Use o campo de bens." };
    }
    if ((indice.has("nm_candidato") || indice.has("nome")) && !temColigacao) {
        return { ...vazio, erro: "Este arquivo é o consulta_cand. Use o campo de candidatos." };
    }
    if (
        indice.has("ds_situacao_julgamento") &&
        !indice.has("tp_agremiacao") &&
        !indice.has("sq_coligacao") &&
        !indice.has("nm_coligacao")
    ) {
        return { ...vazio, erro: "Este arquivo é o complementar. Use o campo de informações complementares." };
    }
    if (!indice.has("sg_partido") && !indice.has("nr_partido")) {
        return { ...vazio, erro: "O CSV de coligações precisa de SG_PARTIDO ou NR_PARTIDO." };
    }
    if (!indice.has("cd_cargo") && !indice.has("ds_cargo")) {
        return { ...vazio, erro: "O CSV de coligações precisa de CD_CARGO ou DS_CARGO." };
    }
    if (!temColigacao) {
        return {
            ...vazio,
            erro: "O CSV de coligações precisa de TP_AGREMIACAO, SQ_COLIGACAO, NM_COLIGACAO ou DS_COMPOSICAO_COLIGACAO."
        };
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

    const previa: PreviaColigacao[] = [];
    let total = 0;
    let federacoes = 0;
    let coligacoes = 0;
    let isolados = 0;
    for (const linha of tabela.slice(1)) {
        total += 1;
        const tipo = celula(linha, ["tp_agremiacao"]);
        const classe = classeTipo(tipo);
        if (classe === "federacao") federacoes += 1;
        if (classe === "coligacao") coligacoes += 1;
        if (classe === "isolado") isolados += 1;
        if (previa.length >= 8) continue;
        previa.push({
            cargo: cargoDe(celula(linha, ["cd_cargo"]), celula(linha, ["ds_cargo"])),
            partido: celula(linha, ["sg_partido"]),
            tipo,
            nome: celula(linha, ["nm_coligacao"]),
            composicao: celula(linha, ["ds_composicao_coligacao"]),
            situacao: celula(linha, ["ds_situacao_legenda", "ds_situacao", "cd_situacao_legenda", "cd_situacao"])
        });
    }

    return { total, federacoes, coligacoes, isolados, previa, erro: null };
}

export async function lerConsultaColigacaoArquivo(arquivo: File): Promise<LeituraConsultaColigacao> {
    const buffer = await arquivo.arrayBuffer();
    const utf8 = new TextDecoder("utf-8", { fatal: true });
    let texto: string;
    try {
        texto = utf8.decode(buffer);
    } catch {
        texto = new TextDecoder("iso-8859-1").decode(buffer);
    }
    return lerConsultaColigacaoTexto(texto);
}
