export type PreviaRede = {
    sequencial: string;
    ordem: string;
    url: string;
};

export type LeituraRedeSocial = {
    linhas: number;
    sequenciais: number;
    previa: PreviaRede[];
    erro: string | null;
};

const VAZIOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "NAO DIVULGAVEL", "-1", "-3", "-4"]);
const ROTULOS: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    youtube: "YouTube",
    threads: "Threads",
    linkedin: "LinkedIn",
    kwai: "Kwai",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    twitch: "Twitch",
    spotify: "Spotify",
    x: "X"
};

export function rotuloRede(rede: string | null): string {
    if (!rede) return "";
    return ROTULOS[rede] ?? rede;
}

export function enderecoHttp(url: string): string | null {
    const trecho = url.match(/https?:\/\/\S+/i);
    return trecho ? trecho[0] : null;
}

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

export function lerRedeSocialTexto(texto: string): LeituraRedeSocial {
    const vazio: LeituraRedeSocial = { linhas: 0, sequenciais: 0, previa: [], erro: null };
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

    if ((indice.has("nm_candidato") || indice.has("nome")) && !indice.has("ds_url")) {
        return { ...vazio, erro: "Este arquivo é o consulta_cand. Use o campo de candidatos." };
    }
    if (indice.has("ds_tipo_bem_candidato") || indice.has("vr_bem_candidato")) {
        return { ...vazio, erro: "Este arquivo é o de bens. Use o campo de bens." };
    }
    if (indice.has("ds_situacao_julgamento")) {
        return { ...vazio, erro: "Este arquivo é o complementar. Use o campo de informações complementares." };
    }
    if (indice.has("tp_agremiacao") || indice.has("sq_coligacao")) {
        return { ...vazio, erro: "Este arquivo é o de coligações. Use o campo de coligações." };
    }
    if (indice.has("qt_vaga") || indice.has("qt_vagas")) {
        return { ...vazio, erro: "Este arquivo é o de vagas. Use o campo de vagas." };
    }
    if (indice.has("ds_motivo") || indice.has("ds_tp_motivo")) {
        return { ...vazio, erro: "Este arquivo é o de motivos. Use o campo de motivos." };
    }
    if (!indice.has("sq_candidato")) {
        return { ...vazio, erro: "O CSV de redes sociais precisa de SQ_CANDIDATO." };
    }
    if (!indice.has("ds_url")) {
        return { ...vazio, erro: "O CSV de redes sociais precisa de DS_URL." };
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

    const registros = tabela.slice(1).map((linha) => ({
        sequencial: celula(linha, ["sq_candidato"]),
        ordem: celula(linha, ["nr_ordem_rede_social", "nr_ordem"]),
        url: celula(linha, ["ds_url"])
    }));
    const sequenciais = new Set(registros.map((item) => item.sequencial).filter(Boolean));

    return {
        linhas: registros.length,
        sequenciais: sequenciais.size,
        previa: registros.slice(0, 8),
        erro: null
    };
}

export async function lerRedeSocialArquivo(arquivo: File): Promise<LeituraRedeSocial> {
    const buffer = await arquivo.arrayBuffer();
    const utf8 = new TextDecoder("utf-8", { fatal: true });
    let texto: string;
    try {
        texto = utf8.decode(buffer);
    } catch {
        texto = new TextDecoder("iso-8859-1").decode(buffer);
    }
    return lerRedeSocialTexto(texto);
}
