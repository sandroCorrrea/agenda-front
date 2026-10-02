export type PreviaCandidato = {
    numero: string;
    nomeUrna: string;
    nome: string;
    cargo: string;
    partido: string;
    uf: string;
    detalhe: string;
};

export type LeituraConsultaCand = {
    total: number;
    previa: PreviaCandidato[];
    semCargo: number;
    colunasSensiveis: string[];
    erro: string | null;
    eleicao: string | null;
    ufArquivo: string | null;
    ano: string | null;
};

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

const SENSIVEIS = ["nr_cpf_candidato", "ds_email", "nr_titulo_eleitoral_candidato", "dt_nascimento"];

const VAZIOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "NAO DIVULGAVEL", "-1", "-3", "-4"]);

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

function tituloCargo(codigo: string, texto: string): string {
    const cd = codigo.replace(/^0+/, "");
    if (cd && CARGO_POR_CODIGO[cd]) return CARGO_POR_CODIGO[cd];
    const base = texto
        .toLowerCase()
        .replace(/[º°ª]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    return base ? base.replace(/\b\w/g, (letra) => letra.toUpperCase()) : "";
}

export function parseCsv(texto: string, delimitador = ";"): string[][] {
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

export function lerConsultaCandTexto(texto: string): LeituraConsultaCand {
    const vazio: LeituraConsultaCand = {
        total: 0,
        previa: [],
        semCargo: 0,
        colunasSensiveis: [],
        erro: null,
        eleicao: null,
        ufArquivo: null,
        ano: null
    };
    const delimitador = (texto.split(/\r?\n/, 1)[0]?.split(";").length ?? 0) >= (texto.split(/\r?\n/, 1)[0]?.split(",").length ?? 0) ? ";" : ",";
    const tabela = parseCsv(texto, delimitador);
    const primeira = tabela[0];
    if (!primeira) {
        return { ...vazio, erro: "O arquivo não tem cabeçalho." };
    }

    const indice = new Map<string, number>();
    const sensiveis: string[] = [];
    primeira.forEach((coluna, posicao) => {
        const nome = cabecalho(coluna);
        if (SENSIVEIS.includes(nome)) sensiveis.push(nome);
        else if (!indice.has(nome)) indice.set(nome, posicao);
    });

    const temCargo = indice.has("ds_cargo") || indice.has("cd_cargo") || indice.has("cargo_codigo");
    const temIdentidade =
        (indice.has("sq_candidato") || indice.has("tse_id")) &&
        (indice.has("nr_candidato") || indice.has("numero")) &&
        (indice.has("nm_candidato") || indice.has("nome"));
    if (!temIdentidade || !temCargo) {
        return {
            ...vazio,
            colunasSensiveis: sensiveis,
            erro: "Este arquivo não é um consulta_cand. Faltam SQ_CANDIDATO, NR_CANDIDATO, NM_CANDIDATO e o cargo."
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

    const previa: PreviaCandidato[] = [];
    let total = 0;
    let semCargo = 0;
    let eleicao: string | null = null;
    let ufArquivo: string | null = null;
    let ano: string | null = null;

    for (const linha of tabela.slice(1)) {
        total += 1;
        const cargo = tituloCargo(celula(linha, ["cd_cargo"]), celula(linha, ["ds_cargo", "cargo_codigo", "cargo"]));
        if (!cargo) semCargo += 1;
        if (!eleicao) eleicao = celula(linha, ["ds_eleicao"]) || null;
        if (!ufArquivo) ufArquivo = celula(linha, ["sg_uf", "uf"]) || null;
        if (!ano) ano = celula(linha, ["ano_eleicao"]) || null;
        if (previa.length >= 8) continue;
        const nome = celula(linha, ["nm_candidato", "nome"]);
        const urna = celula(linha, ["nm_urna_candidato", "nome_urna"]) || celula(linha, ["nm_social_candidato"]) || nome;
        previa.push({
            numero: celula(linha, ["nr_candidato", "numero"]),
            nomeUrna: urna,
            nome,
            cargo,
            partido: celula(linha, ["sg_partido", "partido_sigla"]),
            uf: celula(linha, ["sg_uf", "uf"]),
            detalhe: [
                celula(linha, ["ds_genero"]),
                celula(linha, ["ds_grau_instrucao"]),
                celula(linha, ["ds_ocupacao"]),
                celula(linha, ["ds_cor_raca"])
            ].filter(Boolean).join(" · ")
        });
    }

    return {
        total,
        previa,
        semCargo,
        colunasSensiveis: sensiveis,
        erro: null,
        eleicao,
        ufArquivo,
        ano
    };
}

export async function lerConsultaCandArquivo(arquivo: File): Promise<LeituraConsultaCand> {
    const buffer = await arquivo.arrayBuffer();
    const utf8 = new TextDecoder("utf-8", { fatal: true });
    let texto: string;
    try {
        texto = utf8.decode(buffer);
    } catch {
        texto = new TextDecoder("iso-8859-1").decode(buffer);
    }
    return lerConsultaCandTexto(texto);
}
