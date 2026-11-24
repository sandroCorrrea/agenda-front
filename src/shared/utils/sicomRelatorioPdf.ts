import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { SicomRelatorioResposta, SicomRelatorioSituacao } from "@/domain/sicom/relatorio";
import { dispararDownloadBlob } from "@/shared/utils/downloadBlob";
import {
    classificacaoDespesa,
    complementoFonte,
    formatarReais,
    formatarReaisAbsoluto,
    rotuloDeducao,
    subtituloReceita,
    textoPreenchido,
    tituloFonte,
    tituloNatureza,
    tituloReparticao,
    tomRelatorio
} from "@/shared/utils/sicomRelatorio";

const LARGURA = 595.28;
const ALTURA = 841.89;
const MARGEM = 36;
const RODAPE = 46;
const NAVY = rgb(0.043, 0.122, 0.227);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINHA = rgb(0.9, 0.91, 0.95);
const ZEBRADO = rgb(0.976, 0.98, 0.984);
const FUNDO = rgb(0.953, 0.961, 0.973);
const VERMELHO = rgb(0.62, 0.17, 0.17);
const VERMELHO_FUNDO = rgb(1, 0.965, 0.965);
const AZUL = rgb(0.12, 0.23, 0.54);
const AZUL_FUNDO = rgb(0.957, 0.968, 1);
const VERDE = rgb(0.11, 0.43, 0.25);
const AMBAR_FUNDO = rgb(1, 0.973, 0.91);

const TROCAS: Record<string, string> = {
    "\u2014": "-",
    "\u2013": "-",
    "\u2212": "-",
    "\u2018": "'",
    "\u2019": "'",
    "\u201C": "\"",
    "\u201D": "\"",
    "\u2026": "...",
    "\u00A0": " ",
    "\u202F": " ",
    "\u203A": ">",
    "\u2022": "-"
};

const EXTRAS = "ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿºª·°«»";

export function textoPdf(valor: string): string {
    let saida = "";
    for (const char of valor) {
        const trocado = TROCAS[char] ?? char;
        for (const parte of trocado) {
            const codigo = parte.codePointAt(0) ?? 0;
            if ((codigo >= 32 && codigo <= 126) || EXTRAS.includes(parte)) saida += parte;
        }
    }
    return saida;
}

export function nomeArquivoRelatorio(exercicio: string | null): string {
    const ano = (exercicio ?? "").replace(/\D/g, "");
    return ano ? `relatorio-orcamento-${ano}.pdf` : "relatorio-orcamento.pdf";
}

type Cursor = {
    doc: PDFDocument;
    page: PDFPage;
    y: number;
    font: PDFFont;
    bold: PDFFont;
    documento: string;
    capa: boolean;
};

type Coluna = { titulo: string; largura: number; direita?: boolean };

function larguraUtil(): number {
    return LARGURA - MARGEM * 2;
}

function quebrar(font: PDFFont, texto: string, tamanho: number, largura: number): string[] {
    const limpo = textoPdf(texto).replace(/\s+/g, " ").trim();
    if (!limpo) return ["-"];
    const limite = Math.max(largura, 8);
    const cabe = (valor: string) => font.widthOfTextAtSize(valor, tamanho) <= limite;
    const linhas: string[] = [];
    let atual = "";

    for (const palavra of limpo.split(" ")) {
        const candidato = atual ? `${atual} ${palavra}` : palavra;
        if (cabe(candidato)) {
            atual = candidato;
            continue;
        }
        if (atual) linhas.push(atual);
        if (cabe(palavra)) {
            atual = palavra;
            continue;
        }
        let pedaco = "";
        for (const char of palavra) {
            if (cabe(pedaco + char)) pedaco += char;
            else {
                if (pedaco) linhas.push(pedaco);
                pedaco = char;
            }
        }
        atual = pedaco;
    }
    if (atual) linhas.push(atual);
    return linhas.length ? linhas : ["-"];
}

function novaPagina(cursor: Cursor) {
    cursor.page = cursor.doc.addPage([LARGURA, ALTURA]);
    if (cursor.capa) {
        cursor.y = ALTURA - 42;
        return;
    }
    const marca = textoPdf("AGENDA ASSESSORIA CONTÁBIL");
    cursor.page.drawText(marca, { x: MARGEM, y: ALTURA - 24, size: 8, font: cursor.bold, color: NAVY });
    const larguraDocumento = cursor.font.widthOfTextAtSize(cursor.documento, 8);
    cursor.page.drawText(cursor.documento, {
        x: LARGURA - MARGEM - larguraDocumento,
        y: ALTURA - 24,
        size: 8,
        font: cursor.font,
        color: MUTED
    });
    cursor.page.drawLine({
        start: { x: MARGEM, y: ALTURA - 30 },
        end: { x: LARGURA - MARGEM, y: ALTURA - 30 },
        thickness: 1.4,
        color: NAVY
    });
    cursor.y = ALTURA - 48;
}

function garantir(cursor: Cursor, altura: number) {
    if (cursor.y - altura < RODAPE) novaPagina(cursor);
}

function tituloSecao(cursor: Cursor, texto: string) {
    garantir(cursor, 24);
    cursor.page.drawText(textoPdf(texto), { x: MARGEM, y: cursor.y, size: 12, font: cursor.bold, color: NAVY });
    cursor.y -= 6;
    cursor.page.drawLine({
        start: { x: MARGEM, y: cursor.y },
        end: { x: LARGURA - MARGEM, y: cursor.y },
        thickness: 1,
        color: NAVY
    });
    cursor.y -= 14;
}

function paragrafo(cursor: Cursor, texto: string, tamanho = 9, cor = NAVY, fonte?: PDFFont) {
    const linhas = quebrar(fonte ?? cursor.font, texto, tamanho, larguraUtil());
    garantir(cursor, linhas.length * (tamanho + 3));
    for (const linha of linhas) {
        cursor.page.drawText(linha, {
            x: MARGEM,
            y: cursor.y,
            size: tamanho,
            font: fonte ?? cursor.font,
            color: cor
        });
        cursor.y -= tamanho + 3;
    }
    cursor.y -= 4;
}

function corSituacao(situacao: SicomRelatorioSituacao | null) {
    if (situacao === "deficit") return VERMELHO;
    if (situacao === "superavit") return AZUL;
    if (situacao === "equilibrado") return VERDE;
    return NAVY;
}

function fundoSituacao(situacao: SicomRelatorioSituacao | null) {
    if (situacao === "deficit") return VERMELHO_FUNDO;
    if (situacao === "superavit") return AZUL_FUNDO;
    return null;
}

function desenharTabela(cursor: Cursor, colunas: Coluna[], linhas: Array<{ celulas: string[]; situacao?: SicomRelatorioSituacao | null }>) {
    const desenharCabecalho = () => {
        if (cursor.y - 56 < RODAPE) novaPagina(cursor);
        garantir(cursor, 18);
        cursor.page.drawRectangle({
            x: MARGEM,
            y: cursor.y - 4,
            width: larguraUtil(),
            height: 16,
            color: NAVY
        });
        let x = MARGEM;
        for (const coluna of colunas) {
            cursor.page.drawText(textoPdf(coluna.titulo), {
                x: x + 4,
                y: cursor.y,
                size: 7.5,
                font: cursor.bold,
                color: rgb(1, 1, 1)
            });
            x += coluna.largura;
        }
        cursor.y -= 18;
    };

    desenharCabecalho();
    linhas.forEach((linha, indice) => {
        const quebradas = colunas.map((coluna, colunaIndice) =>
            quebrar(cursor.font, linha.celulas[colunaIndice] ?? "", 8, coluna.largura - 8)
        );
        const quantidade = Math.max(1, ...quebradas.map((item) => item.length));
        const altura = quantidade * 11 + 6;
        if (cursor.y - altura < RODAPE) {
            novaPagina(cursor);
            desenharCabecalho();
        }
        const fundo = fundoSituacao(linha.situacao ?? null) ?? (indice % 2 === 1 ? ZEBRADO : rgb(1, 1, 1));
        cursor.page.drawRectangle({
            x: MARGEM,
            y: cursor.y - altura + 12,
            width: larguraUtil(),
            height: altura,
            color: fundo
        });
        let x = MARGEM;
        colunas.forEach((coluna, colunaIndice) => {
            const textos = quebradas[colunaIndice] ?? [];
            textos.forEach((texto, linhaIndice) => {
                const larguraTexto = cursor.font.widthOfTextAtSize(texto, 8);
                const deslocamento = coluna.direita ? Math.max(4, coluna.largura - larguraTexto - 4) : 4;
                cursor.page.drawText(texto, {
                    x: x + deslocamento,
                    y: cursor.y - linhaIndice * 11,
                    size: 8,
                    font: cursor.font,
                    color: coluna.direita ? corSituacao(linha.situacao ?? null) : NAVY
                });
            });
            x += coluna.largura;
        });
        cursor.y -= altura;
        cursor.page.drawLine({
            start: { x: MARGEM, y: cursor.y + 10 },
            end: { x: LARGURA - MARGEM, y: cursor.y + 10 },
            thickness: 0.4,
            color: LINHA
        });
    });
    cursor.y -= 8;
}

function cartoes(cursor: Cursor, itens: Array<{ rotulo: string; valor: string; situacao?: SicomRelatorioSituacao | null }>) {
    const colunas = 3;
    const intervalo = 8;
    const largura = (larguraUtil() - intervalo * (colunas - 1)) / colunas;
    const altura = 40;
    for (let inicio = 0; inicio < itens.length; inicio += colunas) {
        garantir(cursor, altura + 8);
        const grupo = itens.slice(inicio, inicio + colunas);
        grupo.forEach((item, indice) => {
            const x = MARGEM + indice * (largura + intervalo);
            cursor.page.drawRectangle({ x, y: cursor.y - altura + 12, width: largura, height: altura, color: FUNDO });
            cursor.page.drawRectangle({ x, y: cursor.y - altura + 12, width: 3, height: altura, color: NAVY });
            cursor.page.drawText(textoPdf(item.rotulo), { x: x + 8, y: cursor.y - 2, size: 7, font: cursor.bold, color: MUTED });
            cursor.page.drawText(textoPdf(item.valor), {
                x: x + 8,
                y: cursor.y - 18,
                size: 10,
                font: cursor.bold,
                color: corSituacao(item.situacao ?? null)
            });
        });
        cursor.y -= altura + 8;
    }
}

function textoCentro(cursor: Cursor, texto: string, y: number, tamanho: number, fonte: PDFFont, cor = NAVY) {
    const limpo = textoPdf(texto);
    const largura = fonte.widthOfTextAtSize(limpo, tamanho);
    cursor.page.drawText(limpo, { x: (LARGURA - largura) / 2, y, size: tamanho, font: fonte, color: cor });
}

function rotuloSituacao(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "deficit") return "Déficit";
    if (situacao === "superavit") return "Superávit";
    if (situacao === "equilibrado") return "Equilibrado";
    return "—";
}

function leituraFiscal(resposta: SicomRelatorioResposta): string {
    const resumo = resposta.resumo;
    if (resumo?.situacao === "deficit") {
        return "A despesa fixada supera a receita líquida prevista. O fiscal confere primeiro o resultado geral e, em seguida, quais fontes ficaram descobertas.";
    }
    if (resumo?.situacao === "superavit") {
        return "A receita líquida prevista supera a despesa fixada. O superávit do total não dispensa a leitura de cada fonte.";
    }
    if ((resumo?.fontesDesequilibradas ?? 0) > 0) {
        return "O total fecha, mas há fonte descoberta. Sobra de recurso livre não cobre vinculação de outra fonte.";
    }
    return "A receita líquida prevista cobre a despesa fixada e as fontes fecham entre si.";
}

function caixa(cursor: Cursor, titulo: string, texto: string, fundo: ReturnType<typeof rgb>, corTexto: ReturnType<typeof rgb>) {
    const linhas = quebrar(cursor.font, texto, 9, larguraUtil() - 24);
    const altura = linhas.length * 12 + 28;
    garantir(cursor, altura + 6);
    cursor.page.drawRectangle({
        x: MARGEM,
        y: cursor.y - altura + 14,
        width: larguraUtil(),
        height: altura,
        color: fundo
    });
    cursor.page.drawText(textoPdf(titulo), {
        x: MARGEM + 12,
        y: cursor.y,
        size: 8,
        font: cursor.bold,
        color: corTexto
    });
    linhas.forEach((linha, indice) => {
        cursor.page.drawText(linha, {
            x: MARGEM + 12,
            y: cursor.y - 16 - indice * 12,
            size: 9,
            font: cursor.font,
            color: corTexto
        });
    });
    cursor.y -= altura + 8;
}

async function desenharCapa(cursor: Cursor, resposta: SicomRelatorioResposta, logo: PDFImage | null) {
    if (logo) {
        const larguraLogo = Math.min(170, logo.width);
        const alturaLogo = (logo.height / logo.width) * larguraLogo;
        const alturaMaxima = 132;
        const escala = alturaLogo > alturaMaxima ? alturaMaxima / alturaLogo : 1;
        const larguraFinal = larguraLogo * escala;
        const alturaFinal = alturaLogo * escala;
        cursor.page.drawImage(logo, {
            x: (LARGURA - larguraFinal) / 2,
            y: cursor.y - alturaFinal,
            width: larguraFinal,
            height: alturaFinal
        });
        cursor.y -= alturaFinal + 16;
    }

    const selo = textoPdf("RELATÓRIO ORÇAMENTÁRIO");
    const larguraSelo = cursor.bold.widthOfTextAtSize(selo, 8) + 28;
    cursor.page.drawRectangle({
        x: (LARGURA - larguraSelo) / 2,
        y: cursor.y - 6,
        width: larguraSelo,
        height: 18,
        borderColor: MUTED,
        borderWidth: 0.8
    });
    textoCentro(cursor, selo, cursor.y, 8, cursor.bold, MUTED);
    cursor.y -= 36;

    textoCentro(cursor, "Receita, despesa e fontes", cursor.y, 22, cursor.bold);
    cursor.y -= 22;
    textoCentro(cursor, "Conferência da previsão com a despesa fixada", cursor.y, 11, cursor.font, MUTED);
    cursor.y -= 18;
    if (textoPreenchido(resposta.exercicio)) {
        textoCentro(cursor, `LOA ${resposta.exercicio}`, cursor.y, 12, cursor.bold);
        cursor.y -= 22;
    }

    const resumo = resposta.resumo;
    const pares: Array<[string, string]> = [
        ["Exercício", textoPreenchido(resposta.exercicio) ? (resposta.exercicio as string) : "—"],
        ["Remessa", resposta.remessa?.arquivo ?? "—"],
        ["Ementário", resposta.ementario?.arquivo ?? "—"],
        ["Planilha", resposta.ementario?.planilha ?? "—"],
        ["Situação", rotuloSituacao(resumo?.situacao ?? null)],
        ["Resultado", formatarReais(resumo?.resultado ?? null, true)],
        ["Fontes", resumo?.fontes == null ? "—" : `${resumo.fontes} no total`],
        ["Fontes descobertas", resumo?.fontesDesequilibradas == null ? "—" : String(resumo.fontesDesequilibradas)],
        ["Elaborado em", new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })]
    ];
    cursor.page.drawLine({
        start: { x: MARGEM + 70, y: cursor.y + 8 },
        end: { x: LARGURA - MARGEM - 70, y: cursor.y + 8 },
        thickness: 0.6,
        color: LINHA
    });
    for (const [rotulo, valor] of pares) {
        cursor.page.drawText(textoPdf(rotulo).toUpperCase(), {
            x: MARGEM + 78,
            y: cursor.y - 8,
            size: 7.5,
            font: cursor.bold,
            color: MUTED
        });
        const linhas = quebrar(cursor.bold, valor, 10, 250);
        cursor.page.drawText(linhas[0] ?? "-", {
            x: MARGEM + 230,
            y: cursor.y - 8,
            size: 10,
            font: cursor.bold,
            color: NAVY
        });
        cursor.y -= 18;
    }
    cursor.page.drawLine({
        start: { x: MARGEM + 70, y: cursor.y + 6 },
        end: { x: LARGURA - MARGEM - 70, y: cursor.y + 6 },
        thickness: 0.6,
        color: LINHA
    });
}

function barras(cursor: Cursor, itens: Array<{ nome: string; valor: number | null }>) {
    if (itens.length === 0) {
        paragrafo(cursor, "—", 9, MUTED);
        return;
    }
    const maior = Math.max(...itens.map((item) => Math.abs(item.valor ?? 0)), 1);
    for (const item of itens) {
        garantir(cursor, 22);
        const nomeCompleto = textoPdf(item.nome);
        let nome = nomeCompleto;
        while (nome.length > 1 && cursor.font.widthOfTextAtSize(nome, 8) > 230) nome = nome.slice(0, -1);
        if (nome !== nomeCompleto) nome = `${nome.slice(0, -1)}...`;
        cursor.page.drawText(nome, {
            x: MARGEM,
            y: cursor.y,
            size: 8,
            font: cursor.font,
            color: NAVY
        });
        const valor = textoPdf(formatarReais(item.valor));
        const larguraValor = cursor.font.widthOfTextAtSize(valor, 8);
        cursor.page.drawText(valor, {
            x: LARGURA - MARGEM - larguraValor,
            y: cursor.y,
            size: 8,
            font: cursor.bold,
            color: NAVY
        });
        const trilha = 180;
        const xTrilha = LARGURA - MARGEM - larguraValor - trilha - 10;
        cursor.page.drawRectangle({ x: xTrilha, y: cursor.y - 1, width: trilha, height: 7, color: rgb(0.91, 0.93, 0.95) });
        cursor.page.drawRectangle({
            x: xTrilha,
            y: cursor.y - 1,
            width: trilha * (Math.abs(item.valor ?? 0) / maior),
            height: 7,
            color: rgb(0.18, 0.63, 0.66)
        });
        cursor.y -= 18;
    }
    cursor.y -= 6;
}

function numerar(cursor: Cursor) {
    const paginas = cursor.doc.getPages();
    paginas.forEach((page, indice) => {
        if (indice === 0) {
            textoCentro(
                { ...cursor, page },
                "AGENDA ASSESSORIA CONTÁBIL   ·   CONFERÊNCIA ORÇAMENTÁRIA",
                28,
                8,
                cursor.bold,
                MUTED
            );
            return;
        }
        const rodape = textoPdf(
            `Agenda Assessoria Contábil  ·  Receita e despesa  ·  Página ${indice + 1} de ${paginas.length}`
        );
        const largura = cursor.font.widthOfTextAtSize(rodape, 8);
        page.drawText(rodape, { x: (LARGURA - largura) / 2, y: 22, size: 8, font: cursor.font, color: MUTED });
    });
}

export async function montarPdfRelatorio(resposta: SicomRelatorioResposta, logo?: Uint8Array): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const exercicio = textoPreenchido(resposta.exercicio) ? `LOA ${resposta.exercicio}` : "Receita e despesa";
    const cursor: Cursor = {
        doc,
        page: undefined as unknown as PDFPage,
        y: 0,
        font,
        bold,
        documento: textoPdf(exercicio),
        capa: true
    };
    let imagem: PDFImage | null = null;
    if (logo && logo.byteLength > 0) {
        try {
            imagem = await doc.embedJpg(logo);
        } catch {
            imagem = null;
        }
    }

    novaPagina(cursor);
    await desenharCapa(cursor, resposta, imagem);
    cursor.capa = false;
    novaPagina(cursor);

    const tom = tomRelatorio(resposta.resumo);
    const fundoAchado = tom === "erro" ? VERMELHO : tom === "superavit" ? AZUL : tom === "aviso" ? rgb(0.48, 0.36, 0.07) : NAVY;
    tituloSecao(cursor, "1. Sumário executivo");
    paragrafo(cursor, leituraFiscal(resposta), 10);
    caixa(cursor, "ACHADO PRINCIPAL", resposta.mensagem ?? "—", fundoAchado, rgb(1, 1, 1));
    if (resposta.avisos.length) {
        caixa(cursor, "AVISOS", resposta.avisos.join("  ·  "), AMBAR_FUNDO, rgb(0.35, 0.25, 0.05));
    }

    const resumo = resposta.resumo;
    cartoes(cursor, [
        { rotulo: "RECEITA BRUTA", valor: formatarReais(resumo?.receitaBruta ?? null) },
        { rotulo: "DEDUÇÕES", valor: formatarReais(resumo?.deducoes ?? null) },
        { rotulo: "RECEITA LÍQUIDA", valor: formatarReais(resumo?.receitaLiquida ?? null) },
        { rotulo: "DESPESA FIXADA", valor: formatarReais(resumo?.despesaFixada ?? null) },
        { rotulo: "RESULTADO", valor: formatarReais(resumo?.resultado ?? null, true), situacao: resumo?.situacao ?? null },
        {
            rotulo: "FONTES DESCOBERTAS",
            valor: resumo?.fontesDesequilibradas == null ? "—" : String(resumo.fontesDesequilibradas),
            situacao: (resumo?.fontesDesequilibradas ?? 0) > 0 ? "deficit" : "equilibrado"
        }
    ]);
    paragrafo(
        cursor,
        [
            `Receita corrente líquida ${formatarReais(resumo?.receitaCorrenteLiquida ?? null)}`,
            `Despesa corrente ${formatarReais(resumo?.despesaCorrente ?? null)}`,
            `Resultado corrente ${formatarReais(resumo?.resultadoCorrente ?? null, true)}`,
            `Receita de capital líquida ${formatarReais(resumo?.receitaCapitalLiquida ?? null)}`,
            `Despesa de capital ${formatarReais(resumo?.despesaCapital ?? null)}`,
            `Reserva de contingência ${formatarReais(resumo?.reservaContingencia ?? null)}`
        ].join("   ·   "),
        8,
        MUTED
    );

    tituloSecao(cursor, "2. Como ler este relatório");
    paragrafo(cursor, "Resultado é a receita líquida menos a despesa fixada. Positivo é sobra de previsão, zero fecha e negativo é falta de recurso.");
    paragrafo(cursor, "Cada fonte precisa se sustentar. Uma sobra em recurso livre não cobre o déficit de uma vinculação.");
    paragrafo(cursor, "A coluna de receita mostra a previsão bruta. A dedução aparece na seção própria e no selo Dedução, quando o valor da fonte já vem negativo.");
    paragrafo(cursor, "Na tabela de fontes, a linha vermelha é déficit, a azul é superávit e a neutra é equilíbrio. A ordem recebida é mantida: o déficit permanece no topo.");

    tituloSecao(cursor, "3. Fontes de recurso");
    desenharTabela(
        cursor,
        [
            { titulo: "Fonte", largura: 223 },
            { titulo: "Receita líquida", largura: 100, direita: true },
            { titulo: "Despesa fixada", largura: 100, direita: true },
            { titulo: "Resultado", largura: larguraUtil() - 423, direita: true }
        ],
        resposta.cruzamento.length
            ? resposta.cruzamento.map((fonte) => ({
                  celulas: [
                      [tituloFonte(fonte), complementoFonte(fonte)].filter(Boolean).join(" "),
                      formatarReais(fonte.receitaLiquida),
                      formatarReais(fonte.despesaFixada),
                      formatarReais(fonte.resultado, true)
                  ],
                  situacao: fonte.situacao
              }))
            : [{ celulas: ["Não há fontes para cruzar.", "—", "—", "—"], situacao: null }]
    );

    tituloSecao(cursor, "4. Fontes que pedem atenção");
    const atencao = resposta.cruzamento.filter((fonte) => fonte.situacao === "deficit" || fonte.situacao === "superavit");
    if (atencao.length === 0) {
        caixa(cursor, "LEITURA", "Nenhuma fonte ficou descoberta nem com sobra isolada.", FUNDO, NAVY);
    } else {
        for (const fonte of atencao) {
            paragrafo(
                cursor,
                `${rotuloSituacao(fonte.situacao)} · ${tituloFonte(fonte)} · ${formatarReais(fonte.resultado, true)}`,
                10,
                corSituacao(fonte.situacao),
                cursor.bold
            );
            const receitas = fonte.receitas.map((item) => {
                const selo = item.deducao ? " · Dedução" : "";
                return `Receita: ${tituloNatureza(item.nome, item.codigo)}${textoPreenchido(item.codigo) ? ` · ${item.codigo}` : ""}${selo} · ${formatarReais(item.valor)}`;
            });
            const despesas = fonte.despesas.map(
                (item) =>
                    `Despesa: ${tituloNatureza(item.nome, item.codigo)}${textoPreenchido(item.codigo) ? ` · ${item.codigo}` : ""} · ${formatarReais(item.valor)}`
            );
            for (const linha of [...receitas, ...despesas]) paragrafo(cursor, linha, 8, MUTED);
        }
    }

    tituloSecao(cursor, "5. Receitas previstas");
    paragrafo(cursor, "Valor bruto da natureza, antes da dedução. Quando o código da remessa difere da conta do ementário, os dois aparecem.", 8, MUTED);
    desenharTabela(
        cursor,
        [
            { titulo: "Natureza", largura: 250 },
            { titulo: "Categoria", largura: 160 },
            { titulo: "Valor", largura: larguraUtil() - 410, direita: true }
        ],
        resposta.receitas.length
            ? resposta.receitas.map((item) => ({
                  celulas: [
                      [tituloNatureza(item.nome, item.codigo), subtituloReceita(item)].filter(Boolean).join(" "),
                      textoPreenchido(item.categoria) ? (item.categoria as string) : "—",
                      formatarReais(item.valor)
                  ]
              }))
            : [{ celulas: ["—", "—", "—"] }]
    );

    tituloSecao(cursor, "6. Despesas fixadas");
    desenharTabela(
        cursor,
        [
            { titulo: "Natureza", largura: 210 },
            { titulo: "Classificação", largura: 200 },
            { titulo: "Valor", largura: larguraUtil() - 410, direita: true }
        ],
        resposta.despesas.length
            ? resposta.despesas.map((item) => ({
                  celulas: [
                      [tituloNatureza(item.nome, item.codigo), textoPreenchido(item.nome) && textoPreenchido(item.codigo) ? item.codigo : ""]
                          .filter(Boolean)
                          .join(" "),
                      classificacaoDespesa(item) || "—",
                      formatarReais(item.valor)
                  ]
              }))
            : [{ celulas: ["—", "—", "—"] }]
    );

    tituloSecao(cursor, "7. Deduções da receita");
    paragrafo(cursor, "O valor é apresentado em módulo. O sinal negativo não se repete aqui.", 8, MUTED);
    desenharTabela(
        cursor,
        [
            { titulo: "Natureza", largura: 210 },
            { titulo: "Dedução", largura: 200 },
            { titulo: "Valor", largura: larguraUtil() - 410, direita: true }
        ],
        resposta.deducoes.length
            ? resposta.deducoes.map((item) => ({
                  celulas: [tituloNatureza(item.nome, item.codigo), rotuloDeducao(item), formatarReaisAbsoluto(item.valor)]
              }))
            : [{ celulas: ["—", "—", "—"] }]
    );

    tituloSecao(cursor, "8. Para onde vai a despesa");
    paragrafo(cursor, "Função", 11, NAVY, cursor.bold);
    barras(cursor, resposta.porFuncao.map((item) => ({ nome: tituloReparticao(item), valor: item.valor })));
    paragrafo(cursor, "Unidade", 11, NAVY, cursor.bold);
    barras(cursor, resposta.porUnidade.map((item) => ({ nome: tituloReparticao(item), valor: item.valor })));
    paragrafo(cursor, "Programa", 11, NAVY, cursor.bold);
    barras(cursor, resposta.porPrograma.map((item) => ({ nome: tituloReparticao(item), valor: item.valor })));

    numerar(cursor);
    return doc.save();
}

export async function exportarRelatorioPdf(resposta: SicomRelatorioResposta, logo?: Uint8Array): Promise<void> {
    const bytes = await montarPdfRelatorio(resposta, logo);
    const arquivo = new Uint8Array(bytes.byteLength);
    arquivo.set(bytes);
    dispararDownloadBlob(new Blob([arquivo], { type: "application/pdf" }), nomeArquivoRelatorio(resposta.exercicio));
}
