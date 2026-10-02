export type PreviaBem = {
    ordem: string;
    tipo: string;
    descricao: string;
    valor: string;
};

export type LeituraBemCandidato = {
    total: number;
    candidaturas: number;
    soma: string;
    previa: PreviaBem[];
    erro: string | null;
};

const VAZIOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "NAO DIVULGAVEL", "-1", "-3", "-4"]);
const COLUNAS = ["ds_tipo_bem_candidato", "ds_bem_candidato", "vr_bem_candidato"];

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

function valorDecimal(bruto: string): string {
    const texto = limpo(bruto);
    if (!texto) return "";
    if (!texto.includes(",")) return texto;
    const semMilhar = texto.replace(/\./g, "").replace(",", ".");
    const numero = Number(semMilhar);
    return Number.isFinite(numero) ? numero.toFixed(2) : "";
}

function centavos(valor: string): number {
    if (!valor) return 0;
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return 0;
    return Math.round(numero * 100);
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

export function lerBemCandidatoTexto(texto: string): LeituraBemCandidato {
    const vazio: LeituraBemCandidato = { total: 0, candidaturas: 0, soma: "0.00", previa: [], erro: null };
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

    const temBem = COLUNAS.some((coluna) => indice.has(coluna));
    const temNome = indice.has("nm_candidato") || indice.has("nome");
    if (temNome && !temBem) {
        return { ...vazio, erro: "Este arquivo é o consulta_cand. Use o campo de candidatos." };
    }
    if (indice.has("ds_situacao_julgamento") && !temBem) {
        return { ...vazio, erro: "Este arquivo é o complementar. Use o campo de informações complementares." };
    }
    if (!indice.has("sq_candidato") && !indice.has("tse_id")) {
        return { ...vazio, erro: "O CSV de bens precisa da coluna SQ_CANDIDATO." };
    }
    if (!temBem) {
        return {
            ...vazio,
            erro: "O CSV de bens precisa de DS_TIPO_BEM_CANDIDATO, DS_BEM_CANDIDATO ou VR_BEM_CANDIDATO."
        };
    }

    const celula = (linha: string[], nome: string) => {
        const posicao = indice.get(nome);
        if (posicao == null) return "";
        return limpo(linha[posicao] ?? "");
    };

    const previa: PreviaBem[] = [];
    const sequenciais = new Set<string>();
    let total = 0;
    let soma = 0;
    for (const linha of tabela.slice(1)) {
        total += 1;
        const sequencial = celula(linha, "sq_candidato") || celula(linha, "tse_id");
        if (sequencial) sequenciais.add(sequencial);
        const valor = valorDecimal(linha[indice.get("vr_bem_candidato") ?? -1] ?? "");
        soma += centavos(valor);
        if (previa.length >= 8) continue;
        previa.push({
            ordem: celula(linha, "nr_ordem_bem_candidato"),
            tipo: celula(linha, "ds_tipo_bem_candidato"),
            descricao: celula(linha, "ds_bem_candidato"),
            valor
        });
    }

    return {
        total,
        candidaturas: sequenciais.size,
        soma: (soma / 100).toFixed(2),
        previa,
        erro: null
    };
}

export async function lerBemCandidatoArquivo(arquivo: File): Promise<LeituraBemCandidato> {
    const buffer = await arquivo.arrayBuffer();
    const utf8 = new TextDecoder("utf-8", { fatal: true });
    let texto: string;
    try {
        texto = utf8.decode(buffer);
    } catch {
        texto = new TextDecoder("iso-8859-1").decode(buffer);
    }
    return lerBemCandidatoTexto(texto);
}
