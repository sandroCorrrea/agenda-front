import type {
    SicomRelatorioDespesa,
    SicomRelatorioDeducao,
    SicomRelatorioFonte,
    SicomRelatorioReceita,
    SicomRelatorioReparticao,
    SicomRelatorioResposta,
    SicomRelatorioResumo,
    SicomRelatorioSituacao
} from "@/domain/sicom/relatorio";

export const TAMANHO_PAGINA_RELATORIO = 20;

export type TomRelatorio = "ok" | "aviso" | "erro" | "superavit";

export function textoPreenchido(valor: string | null | undefined): boolean {
    return valor != null && valor.trim() !== "";
}

export function formatarReais(valor: number | null, comSinal = false): string {
    if (valor == null || !Number.isFinite(valor)) return "—";
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        signDisplay: comSinal ? "exceptZero" : "auto"
    });
}

export function formatarReaisAbsoluto(valor: number | null): string {
    if (valor == null || !Number.isFinite(valor)) return "—";
    return formatarReais(Math.abs(valor));
}

export function tomRelatorio(resumo: Pick<SicomRelatorioResumo, "situacao" | "fontesDesequilibradas"> | null): TomRelatorio {
    if (resumo?.situacao === "deficit") return "erro";
    if (resumo?.situacao === "superavit") return "superavit";
    if (resumo?.situacao === "equilibrado" && (resumo.fontesDesequilibradas ?? 0) > 0) return "aviso";
    return "ok";
}

export function classeSituacao(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "deficit") return "relatorio-linha--deficit";
    if (situacao === "superavit") return "relatorio-linha--superavit";
    return "";
}

export function tituloFonte(fonte: Pick<SicomRelatorioFonte, "nome" | "fonte">): string {
    if (textoPreenchido(fonte.nome)) return fonte.nome as string;
    if (textoPreenchido(fonte.fonte)) return fonte.fonte as string;
    return "—";
}

export function complementoFonte(fonte: Pick<SicomRelatorioFonte, "nome" | "fonte" | "bloco" | "detalhamento">): string {
    const partes: string[] = [];
    if (textoPreenchido(fonte.nome) && textoPreenchido(fonte.fonte)) partes.push(fonte.fonte as string);
    if (textoPreenchido(fonte.bloco)) partes.push(fonte.bloco as string);
    if (textoPreenchido(fonte.detalhamento)) partes.push(`detalhe ${fonte.detalhamento}`);
    return partes.join(" · ");
}

export function tituloNatureza(nome: string | null, codigo: string | null): string {
    if (textoPreenchido(nome)) return nome as string;
    if (textoPreenchido(codigo)) return codigo as string;
    return "—";
}

export function subtituloReceita(receita: Pick<SicomRelatorioReceita, "nome" | "codigo" | "codigoConta">): string {
    const partes: string[] = [];
    if (textoPreenchido(receita.nome) && textoPreenchido(receita.codigo)) partes.push(receita.codigo as string);
    if (textoPreenchido(receita.codigoConta) && receita.codigoConta !== receita.codigo) {
        partes.push(`conta ${receita.codigoConta}`);
    }
    return partes.join(" · ");
}

export function classificacaoDespesa(despesa: Pick<SicomRelatorioDespesa, "categoria" | "grupo" | "modalidade">): string {
    return [despesa.categoria, despesa.grupo, despesa.modalidade].filter(textoPreenchido).join(" · ");
}

export function rotuloDeducao(deducao: Pick<SicomRelatorioDeducao, "descricao" | "identificador">): string {
    if (textoPreenchido(deducao.descricao)) return deducao.descricao as string;
    if (textoPreenchido(deducao.identificador)) return `Identificador ${deducao.identificador}`;
    return "—";
}

export function tituloReparticao(item: Pick<SicomRelatorioReparticao, "nome" | "codigo">): string {
    if (textoPreenchido(item.nome)) return item.nome as string;
    if (textoPreenchido(item.codigo)) return item.codigo as string;
    return "—";
}

export function contextoRelatorio(resposta: Pick<SicomRelatorioResposta, "exercicio" | "ementario" | "remessa">): string {
    const partes: string[] = [];
    if (textoPreenchido(resposta.exercicio)) partes.push(resposta.exercicio as string);
    if (textoPreenchido(resposta.ementario?.arquivo)) partes.push(resposta.ementario?.arquivo as string);
    if (textoPreenchido(resposta.remessa?.arquivo)) partes.push(resposta.remessa?.arquivo as string);
    return partes.join(" · ");
}

export function tituloRelatorio(exercicio: string | null): string {
    return textoPreenchido(exercicio) ? `Orçamento ${exercicio}` : "Relatório";
}

function casa(valor: string | null, busca: string): boolean {
    return (valor ?? "").toLocaleLowerCase("pt-BR").includes(busca);
}

function termo(busca: string): string {
    return busca.trim().toLocaleLowerCase("pt-BR");
}

export function filtrarFontes(itens: SicomRelatorioFonte[], busca: string): SicomRelatorioFonte[] {
    const q = termo(busca);
    if (!q) return itens;
    return itens.filter((item) => casa(item.nome, q) || casa(item.fonte, q));
}

export function filtrarReceitas(itens: SicomRelatorioReceita[], busca: string): SicomRelatorioReceita[] {
    const q = termo(busca);
    if (!q) return itens;
    return itens.filter((item) => casa(item.nome, q) || casa(item.codigo, q));
}

export function filtrarDespesas(itens: SicomRelatorioDespesa[], busca: string): SicomRelatorioDespesa[] {
    const q = termo(busca);
    if (!q) return itens;
    return itens.filter((item) => casa(item.nome, q) || casa(item.codigo, q));
}

export function filtrarDeducoes(itens: SicomRelatorioDeducao[], busca: string): SicomRelatorioDeducao[] {
    const q = termo(busca);
    if (!q) return itens;
    return itens.filter((item) => casa(item.nome, q) || casa(item.codigo, q));
}

export function fatiaPagina<T>(itens: T[], pagina: number, tamanho = TAMANHO_PAGINA_RELATORIO): T[] {
    const totalPaginas = itens.length === 0 ? 1 : Math.ceil(itens.length / tamanho);
    const atual = Math.min(Math.max(1, pagina), totalPaginas);
    const inicio = (atual - 1) * tamanho;
    return itens.slice(inicio, inicio + tamanho);
}

export function maiorValor(itens: Array<{ valor: number | null }>): number {
    return itens.reduce((maior, item) => Math.max(maior, Math.abs(item.valor ?? 0)), 0);
}

export function larguraBarra(valor: number | null, maior: number): string {
    if (valor == null || maior <= 0) return "0%";
    return `${Math.min(100, (Math.abs(valor) / maior) * 100)}%`;
}
