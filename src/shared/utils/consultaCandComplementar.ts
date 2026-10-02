import { parseCsv } from "@/shared/utils/consultaCand";

export type PreviaComplementar = {
    julgamento: string;
    inseridoUrna: string;
    municipioNascimento: string;
    etniaIndigena: string;
};

export type LeituraConsultaCandComplementar = {
    total: number;
    previa: PreviaComplementar[];
    erro: string | null;
};

const VAZIOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "NAO DIVULGAVEL", "-1", "-3", "-4"]);
const ETNIA_VAZIA = new Set(["NÃO INFORMADA", "NAO INFORMADA"]);
const COLUNAS = ["ds_situacao_julgamento", "st_candidato_inserido_urna", "vr_despesa_max_campanha"];

function cabecalho(nome: string): string {
    return nome
        .replace(/^\uFEFF/, "")
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
}

function limpo(valor: string, etnia = false): string {
    const texto = valor.trim();
    const marca = texto.toUpperCase();
    if (VAZIOS.has(marca) || (etnia && ETNIA_VAZIA.has(marca))) return "";
    return texto;
}

export function lerConsultaCandComplementarTexto(texto: string): LeituraConsultaCandComplementar {
    const vazio: LeituraConsultaCandComplementar = { total: 0, previa: [], erro: null };
    const primeiraLinha = texto.split(/\r?\n/, 1)[0] ?? "";
    if (!primeiraLinha.trim()) return { ...vazio, erro: "O arquivo não tem cabeçalho." };

    const delimitador = (primeiraLinha.split(";").length) >= (primeiraLinha.split(",").length) ? ";" : ",";
    const tabela = parseCsv(texto, delimitador);
    const primeira = tabela[0];
    if (!primeira) return { ...vazio, erro: "O arquivo não tem cabeçalho." };

    const indice = new Map<string, number>();
    primeira.forEach((coluna, posicao) => {
        const nome = cabecalho(coluna);
        if (!indice.has(nome)) indice.set(nome, posicao);
    });

    const temComplementar = COLUNAS.some((coluna) => indice.has(coluna));
    const temNome = indice.has("nm_candidato") || indice.has("nome");
    if (temNome && !temComplementar) {
        return { ...vazio, erro: "Este arquivo é o consulta_cand. Use o campo de candidatos." };
    }
    if (!indice.has("sq_candidato") && !indice.has("tse_id")) {
        return { ...vazio, erro: "O CSV complementar precisa da coluna SQ_CANDIDATO." };
    }
    if (!temComplementar) {
        return {
            ...vazio,
            erro: "O CSV complementar precisa de DS_SITUACAO_JULGAMENTO, ST_CANDIDATO_INSERIDO_URNA ou VR_DESPESA_MAX_CAMPANHA."
        };
    }

    const celula = (linha: string[], nome: string, etnia = false) => {
        const posicao = indice.get(nome);
        if (posicao == null) return "";
        return limpo(linha[posicao] ?? "", etnia);
    };

    const previa: PreviaComplementar[] = [];
    let total = 0;
    for (const linha of tabela.slice(1)) {
        total += 1;
        if (previa.length >= 8) continue;
        previa.push({
            julgamento: celula(linha, "ds_situacao_julgamento"),
            inseridoUrna: celula(linha, "st_candidato_inserido_urna"),
            municipioNascimento: celula(linha, "nm_municipio_nascimento"),
            etniaIndigena: celula(linha, "ds_etnia_indigena", true)
        });
    }

    return { total, previa, erro: null };
}

export async function lerConsultaCandComplementarArquivo(arquivo: File): Promise<LeituraConsultaCandComplementar> {
    const buffer = await arquivo.arrayBuffer();
    const utf8 = new TextDecoder("utf-8", { fatal: true });
    let texto: string;
    try {
        texto = utf8.decode(buffer);
    } catch {
        texto = new TextDecoder("iso-8859-1").decode(buffer);
    }
    return lerConsultaCandComplementarTexto(texto);
}
