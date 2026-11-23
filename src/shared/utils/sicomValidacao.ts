import type { SicomValidacaoOcorrencia, SicomValidacaoResposta } from "@/domain/sicom/validacao";

export const TAMANHO_PAGINA_ERROS = 20;

export interface SicomGrupoErro {
    arquivo: string | null;
    mensagem: string;
    quantidade: number;
    linhas: number[];
}

export function celulaSicom(valor: string | number | null | undefined): string {
    if (valor == null || valor === "") return "—";
    return String(valor);
}

export function podeSeguirValidacao(resposta: Pick<SicomValidacaoResposta, "status" | "erros"> | null): boolean {
    if (!resposta) return false;
    return resposta.status === "valido" && resposta.erros.length === 0;
}

export function textoIntervalo(pagina: number, total: number, tamanho = TAMANHO_PAGINA_ERROS): string {
    if (total <= 0) return "Mostrando 0 de 0";
    const atual = Math.max(1, pagina);
    const inicio = (atual - 1) * tamanho + 1;
    const fim = Math.min(atual * tamanho, total);
    return `Mostrando ${inicio}–${fim} de ${total}`;
}

export function textoQuantidade(valor: number | null, singular: string, plural: string): string {
    if (valor == null) return `— ${plural}`;
    const rotulo = valor === 1 ? singular : plural;
    return `${valor.toLocaleString("pt-BR")} ${rotulo}`;
}

export function textoLinhasArquivo(linhas: number | null): string {
    return textoQuantidade(linhas, "linha", "linhas");
}

export function textoLinhas(linhas: number[]): string {
    if (linhas.length === 0) return "—";
    return `linhas ${linhas.join(", ")}`;
}

export function ordenarErros(
    erros: SicomValidacaoOcorrencia[],
    ordemArquivos: Array<string | null>
): SicomValidacaoOcorrencia[] {
    const indice = new Map<string, number>();
    ordemArquivos.forEach((arquivo, posicao) => {
        if (arquivo != null && !indice.has(arquivo)) indice.set(arquivo, posicao);
    });
    return [...erros].sort((a, b) => {
        const ia = a.arquivo != null && indice.has(a.arquivo) ? indice.get(a.arquivo)! : Number.MAX_SAFE_INTEGER;
        const ib = b.arquivo != null && indice.has(b.arquivo) ? indice.get(b.arquivo)! : Number.MAX_SAFE_INTEGER;
        if (ia !== ib) return ia - ib;
        const nomeA = a.arquivo ?? "";
        const nomeB = b.arquivo ?? "";
        if (nomeA !== nomeB) return nomeA.localeCompare(nomeB, "pt-BR");
        if (a.linha == null && b.linha == null) return 0;
        if (a.linha == null) return -1;
        if (b.linha == null) return 1;
        return a.linha - b.linha;
    });
}

export function filtrarErros(
    erros: SicomValidacaoOcorrencia[],
    busca: string,
    arquivo: string | null
): SicomValidacaoOcorrencia[] {
    const termo = busca.trim().toLowerCase();
    return erros.filter((erro) => {
        if (arquivo != null && erro.arquivo !== arquivo) return false;
        if (!termo) return true;
        const alvo = [erro.arquivo, erro.campo, erro.valor, erro.mensagem]
            .filter((item): item is string => item != null)
            .join("\n")
            .toLowerCase();
        return alvo.includes(termo);
    });
}

export function agruparErros(erros: SicomValidacaoOcorrencia[]): SicomGrupoErro[] {
    const grupos: SicomGrupoErro[] = [];
    const indice = new Map<string, SicomGrupoErro>();
    for (const erro of erros) {
        const mensagem = erro.mensagem ?? "";
        const chave = `${erro.arquivo ?? ""}\0${mensagem}`;
        const existente = indice.get(chave);
        if (existente) {
            existente.quantidade += 1;
            if (erro.linha != null) existente.linhas.push(erro.linha);
            continue;
        }
        const grupo: SicomGrupoErro = {
            arquivo: erro.arquivo,
            mensagem,
            quantidade: 1,
            linhas: erro.linha != null ? [erro.linha] : []
        };
        indice.set(chave, grupo);
        grupos.push(grupo);
    }
    return grupos;
}

export function extensaoAceita(nome: string, extensao: string): boolean {
    return nome.trim().toLowerCase().endsWith(extensao.toLowerCase());
}
