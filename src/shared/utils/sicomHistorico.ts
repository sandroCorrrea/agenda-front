import type { SicomHistoricoConta, SicomHistoricoGravacaoItem } from "@/domain/sicom/historico";
import type { SicomPrevisaoConta, SicomPrevisaoMetodo } from "@/domain/sicom/previsao";
import type { SicomRelatorioSituacao } from "@/domain/sicom/relatorio";
import { formatarReais } from "@/shared/utils/sicomRelatorio";
import { extensaoAceita } from "@/shared/utils/sicomValidacao";

export const TAMANHO_PAGINA_HISTORICO = 20;
export const LIMITE_ZIP_BYTES = 40 * 1024 * 1024;

export function formatarGravadoEm(valor: string | null): string {
    if (!valor) return "—";
    const encontrado = valor.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    if (!encontrado) return valor;
    return `${encontrado[3]}/${encontrado[2]}/${encontrado[1]} ${encontrado[4]}:${encontrado[5]}`;
}

export function formatarVariacao(valor: number | null): string {
    if (valor == null || !Number.isFinite(valor)) return "—";
    const texto = Math.abs(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    if (valor > 0) return `+${texto}%`;
    if (valor < 0) return `-${texto}%`;
    return `${texto}%`;
}

export function classeVariacao(valor: number | null): string {
    if (valor == null || valor === 0) return "";
    return valor < 0 ? "relatorio-valor--deficit" : "relatorio-valor--superavit";
}

export function seloMetodo(metodo: SicomPrevisaoMetodo | null): string | null {
    if (metodo === "tendencia") return "Tendência";
    if (metodo === "crescimento") return "Crescimento";
    if (metodo === "insuficiente") return "Sem base";
    if (metodo === "encerrada") return "Encerrada";
    return null;
}

export function rotuloSituacaoHistorico(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "superavit") return "Superávit";
    if (situacao === "deficit") return "Déficit";
    if (situacao === "equilibrado") return "Equilibrado";
    return "—";
}

export function frasesGravacao(
    mensagem: string | null,
    remessas: SicomHistoricoGravacaoItem[]
): { verdes: string[]; amarelas: string[] } {
    const novos = remessas.filter((item) => !item.substituido);
    const atualizados = remessas.filter((item) => item.substituido);
    const amarelas = atualizados.map(
        (item) => `O exercício ${item.exercicio ?? "—"} do município ${item.municipio ?? "—"} foi atualizado.`
    );
    if (atualizados.length === 0) return { verdes: mensagem ? [mensagem] : [], amarelas };
    return {
        verdes: novos.map((item) => `Exercício ${item.exercicio ?? "—"} gravado.`),
        amarelas
    };
}

export function validarSelecaoHistorico(zips: File[], nomeXlsx: string | null): string | null {
    if (zips.length === 0) return "Adicione ao menos um ZIP.";
    const nomes = new Set<string>();
    for (const arquivo of zips) {
        if (!extensaoAceita(arquivo.name, ".zip")) return `${arquivo.name} não é um ZIP.`;
        if (arquivo.size > LIMITE_ZIP_BYTES) return `${arquivo.name} passa de 40 MB.`;
        const nome = arquivo.name.toLowerCase();
        if (nomes.has(nome)) return `Há dois arquivos chamados ${arquivo.name}.`;
        nomes.add(nome);
    }
    if (!nomeXlsx) return "Selecione o ementário.";
    if (!extensaoAceita(nomeXlsx, ".xlsx")) return `${nomeXlsx} não é um XLSX.`;
    return null;
}

function casa(valor: string | null, busca: string): boolean {
    return (valor ?? "").toLocaleLowerCase("pt-BR").includes(busca);
}

export function filtrarContasHistorico<T extends Pick<SicomHistoricoConta, "nome" | "codigo">>(
    itens: T[],
    busca: string
): T[] {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return itens;
    return itens.filter((item) => casa(item.nome, termo) || casa(item.codigo, termo));
}

export function filtrarContasPrevisao(itens: SicomPrevisaoConta[], busca: string, metodo: string): SicomPrevisaoConta[] {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return itens.filter((item) => {
        if (metodo && item.metodo !== metodo) return false;
        if (!termo) return true;
        return casa(item.nome, termo) || casa(item.codigo, termo);
    });
}

export function linhasPrevisto(conta: Pick<SicomPrevisaoConta, "previsao">, horizonte: number): string[] {
    if (conta.previsao.length === 0) return ["—"];
    if (horizonte <= 1) return [formatarReais(conta.previsao[0]?.valor ?? null)];
    return conta.previsao.map((item) => `${item.exercicio ?? "—"}: ${formatarReais(item.valor)}`);
}
