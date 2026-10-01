import type { PerguntaSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import type { PesquisaPergunta, TipoPergunta } from "@/domain/politica/tipos";
import { valorOpcao } from "@/shared/utils/politicaLabels";

export type OpcaoEditor = {
    chave: string;
    id?: number;
    rotulo: string;
    valor: string;
    candidatoId: number | null;
    codigoEspecial: string | null;
    ordem: number;
};

export type PerguntaEditor = {
    chave: string;
    id?: number;
    tipo: TipoPergunta;
    titulo: string;
    descricao: string;
    obrigatoria: boolean;
    ordem: number;
    ativo: boolean;
    configuracao: Record<string, unknown>;
    opcoes: OpcaoEditor[];
};

export function perguntasDoDetalhe(lista: PesquisaPergunta[]): PerguntaEditor[] {
    return lista.map((pergunta) => ({
        chave: `id-${pergunta.id}`,
        id: pergunta.id,
        tipo: pergunta.tipo as TipoPergunta,
        titulo: pergunta.titulo,
        descricao: pergunta.descricao ?? "",
        obrigatoria: pergunta.obrigatoria,
        ordem: pergunta.ordem,
        ativo: pergunta.ativo,
        configuracao: { ...pergunta.configuracao },
        opcoes: pergunta.opcoes.map((opcao) => ({
            chave: `op-${opcao.id}`,
            id: opcao.id,
            rotulo: opcao.rotulo,
            valor: opcao.valor,
            candidatoId: opcao.candidatoId,
            codigoEspecial: opcao.codigoEspecial,
            ordem: opcao.ordem
        }))
    }));
}

export function perguntasParaDto(lista: PerguntaEditor[]): PerguntaSalvarDTO[] {
    return lista.map((pergunta, indice) => ({
        id: pergunta.id,
        tipo: pergunta.tipo,
        titulo: pergunta.titulo.trim(),
        descricao: pergunta.descricao.trim() || null,
        obrigatoria: pergunta.obrigatoria,
        ordem: indice,
        ativo: pergunta.ativo,
        configuracao: pergunta.configuracao,
        opcoes: pergunta.opcoes.map((opcao, ordem) => ({
            id: opcao.id,
            rotulo: opcao.rotulo.trim(),
            valor: (opcao.valor.trim() || valorOpcao(opcao.rotulo)).slice(0, 120),
            candidato_id: opcao.candidatoId,
            codigo_especial: opcao.codigoEspecial,
            ordem
        }))
    }));
}
