import type { ErroApi } from "@/shared/utils/apiMensagem";
import { formatarData } from "@/shared/utils/date.util";

export const MENSAGEM_ARQUIVO_GRANDE = "O arquivo é grande demais. O limite desta tela é 20 MB.";

export const LIMITE_ARQUIVO_BYTES = 20 * 1024 * 1024;
export const LIMITE_APELIDO = 120;
export const LIMITE_BUSCA = 160;
export const POR_PAGINA_RECEITA = 20;

const KB = 1024;
const MB = 1024 * 1024;

export function formatarTamanhoArquivo(bytes: number): string {
    const valor = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
    const unidade = valor < MB ? valor / KB : valor / MB;
    const sufixo = valor < MB ? "KB" : "MB";
    return `${unidade.toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    })} ${sufixo}`;
}

export function rotuloApelido(apelido: string | null): string {
    const texto = apelido?.trim();
    return texto ? texto : "Sem apelido";
}

export function rotuloSituacao(situacao: string): string {
    if (situacao === "processado") return "Processado";
    return situacao.trim() || "—";
}

export function celulaPrevia(valor: string): string {
    return valor === "" ? "—" : valor;
}

export function mensagemListaVazia(busca: string): string {
    return busca.trim()
        ? "Nenhum arquivo encontrado para esta busca."
        : "Nenhuma receita orçamentária enviada.";
}

export function textoBusca(valor: string): string | undefined {
    const texto = valor.trim().slice(0, LIMITE_BUSCA);
    return texto || undefined;
}

export function mensagemArquivoCliente(arquivo: File | null): string | null {
    if (!arquivo) return "Envie o arquivo da receita orçamentária.";
    if (!arquivo.name.toLowerCase().endsWith(".xlsx")) {
        return "O arquivo deve ser do tipo .xlsx.";
    }
    if (arquivo.size > LIMITE_ARQUIVO_BYTES) {
        return "O arquivo deve ter no máximo 20 MB.";
    }
    return null;
}

export function apelidoNormalizado(valor: string): { apelido?: string; erro?: string } {
    const texto = valor.trim();
    if (!texto) return {};
    if (texto.length > LIMITE_APELIDO) {
        return { erro: "O apelido deve ter no máximo 120 caracteres." };
    }
    return { apelido: texto };
}

export function formatarEnviadoEm(valor: string): string {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "—";
    return formatarData(data);
}

export function textoQuantidade(valor: number, singular: string, plural: string): string {
    return `${valor} ${valor === 1 ? singular : plural}`;
}

export function erroDeEnvio(lido: ErroApi): { erroEnvio: string | null; campos: Record<string, string> } {
    if (lido.status === 413) {
        return { erroEnvio: MENSAGEM_ARQUIVO_GRANDE, campos: {} };
    }
    const arquivo = lido.campos.arquivo;
    const apelido = lido.campos.apelido;
    return {
        campos: {
            ...(arquivo ? { arquivo } : {}),
            ...(apelido ? { apelido } : {})
        },
        erroEnvio: arquivo || apelido ? null : lido.mensagem
    };
}
