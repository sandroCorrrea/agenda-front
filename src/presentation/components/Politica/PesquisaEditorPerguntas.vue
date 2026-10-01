<script setup lang="ts">
import { computed, ref } from "vue";
import {
    RiAddLine,
    RiArrowDownSLine,
    RiArrowUpSLine,
    RiDeleteBinLine,
    RiFileCopyLine
} from "@remixicon/vue";
import type { Candidato, Cargo, MunicipioPolitica, PesquisaPergunta } from "@/domain/politica/tipos";
import PesquisaPerguntaCampo from "@/presentation/components/Politica/PesquisaPerguntaCampo.vue";
import type { PerguntaEditor } from "@/presentation/components/Politica/pesquisaPerguntaEditor";
import type { RespostaLocal } from "@/presentation/composables/Politica/usePesquisaPublica";
import { TIPOS_PERGUNTA, tipoPerguntaPedeOpcoes } from "@/shared/utils/politicaLabels";

const props = defineProps<{
    cargos: Cargo[];
    municipios: MunicipioPolitica[];
    candidatos: Candidato[];
}>();

const perguntas = defineModel<PerguntaEditor[]>({ required: true });
const ativa = ref(0);
const buscaCidade = ref("");
let sequencia = 1;

const atual = computed(() => perguntas.value[ativa.value] ?? null);

const cidadesFiltradas = computed(() => {
    const q = buscaCidade.value.trim().toLowerCase();
    return props.municipios
        .filter((item) => !q || item.nome.toLowerCase().includes(q) || item.ibge.includes(q))
        .slice(0, 12);
});

const previa = computed<PesquisaPergunta | null>(() => {
    const pergunta = atual.value;
    if (!pergunta) return null;
    return {
        id: pergunta.id ?? 0,
        tipo: pergunta.tipo,
        titulo: pergunta.titulo || "Título da pergunta",
        descricao: pergunta.descricao || null,
        obrigatoria: pergunta.obrigatoria,
        ordem: pergunta.ordem,
        ativo: pergunta.ativo,
        configuracao: pergunta.configuracao,
        escala:
            pergunta.tipo === "escala"
                ? {
                      min: Number(pergunta.configuracao.min ?? 0),
                      max: Number(pergunta.configuracao.max ?? 10)
                  }
                : null,
        opcoes: pergunta.opcoes.map((opcao, indice) => ({
            id: opcao.id ?? indice + 1,
            rotulo: opcao.rotulo || "Opção",
            valor: opcao.valor,
            candidatoId: opcao.candidatoId,
            codigoEspecial: opcao.codigoEspecial,
            ordem: indice
        }))
    };
});

const respostaPrevia = ref<RespostaLocal>({
    opcaoId: null,
    opcaoIds: [],
    valorTexto: "",
    valorNumerico: null
});

function chave() {
    sequencia += 1;
    return `tmp-${Date.now()}-${sequencia}`;
}

function adicionar() {
    perguntas.value.push({
        chave: chave(),
        tipo: "escolha_unica",
        titulo: "",
        descricao: "",
        obrigatoria: true,
        ordem: perguntas.value.length,
        ativo: true,
        configuracao: {},
        opcoes: []
    });
    ativa.value = perguntas.value.length - 1;
    respostaPrevia.value = { opcaoId: null, opcaoIds: [], valorTexto: "", valorNumerico: null };
}

function duplicar(indice: number) {
    const origem = perguntas.value[indice];
    if (!origem) return;
    perguntas.value.splice(indice + 1, 0, {
        ...origem,
        chave: chave(),
        id: undefined,
        titulo: origem.titulo ? `${origem.titulo} (cópia)` : "",
        opcoes: origem.opcoes.map((opcao) => ({ ...opcao, chave: chave(), id: undefined }))
    });
    reordenar();
    ativa.value = indice + 1;
}

function remover(indice: number) {
    perguntas.value.splice(indice, 1);
    reordenar();
    ativa.value = Math.max(0, Math.min(ativa.value, perguntas.value.length - 1));
}

function mover(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= perguntas.value.length) return;
    const [item] = perguntas.value.splice(indice, 1);
    if (!item) return;
    perguntas.value.splice(destino, 0, item);
    reordenar();
    ativa.value = destino;
}

function reordenar() {
    perguntas.value.forEach((item, indice) => {
        item.ordem = indice;
    });
}

function adicionarOpcao() {
    const pergunta = atual.value;
    if (!pergunta) return;
    pergunta.opcoes.push({
        chave: chave(),
        rotulo: "",
        valor: "",
        candidatoId: null,
        codigoEspecial: null,
        ordem: pergunta.opcoes.length
    });
}

function adicionarCidade(cidade: MunicipioPolitica) {
    const pergunta = atual.value;
    if (!pergunta) return;
    if (pergunta.opcoes.some((opcao) => opcao.valor === cidade.ibge)) return;
    pergunta.opcoes.push({
        chave: chave(),
        rotulo: cidade.uf ? `${cidade.nome}/${cidade.uf}` : cidade.nome,
        valor: cidade.ibge,
        candidatoId: null,
        codigoEspecial: null,
        ordem: pergunta.opcoes.length
    });
}

function removerOpcao(indice: number) {
    atual.value?.opcoes.splice(indice, 1);
}

function flag(nome: string): boolean {
    return Boolean(atual.value?.configuracao[nome]);
}

function alternarFlag(nome: string, valor: boolean) {
    if (!atual.value) return;
    atual.value.configuracao = { ...atual.value.configuracao, [nome]: valor };
}

function cargoConfig(): string {
    const valor = atual.value?.configuracao.cargo_id;
    return valor == null || valor === "" ? "" : String(valor);
}

function definirCargo(valor: string) {
    if (!atual.value) return;
    atual.value.configuracao = {
        ...atual.value.configuracao,
        cargo_id: valor ? Number(valor) : null
    };
}

function numeroConfig(nome: "min" | "max"): number {
    const valor = Number(atual.value?.configuracao[nome] ?? (nome === "min" ? 0 : 10));
    return Number.isFinite(valor) ? valor : 0;
}

function definirNumeroConfig(nome: "min" | "max", valor: string) {
    if (!atual.value) return;
    atual.value.configuracao = { ...atual.value.configuracao, [nome]: Number(valor) };
}
</script>

<template>
    <div class="editor">
        <div class="editor__lista">
            <button type="button" class="btn pol-btn mb-3" @click="adicionar">
                <RiAddLine class="me-1" /> Nova pergunta
            </button>
            <p v-if="perguntas.length === 0" class="text-muted">Nenhuma pergunta ainda. O tipo só define o formato da resposta.</p>
            <button
                v-for="(pergunta, indice) in perguntas"
                :key="pergunta.chave"
                type="button"
                class="editor__item"
                :class="{ 'is-on': indice === ativa, 'is-off': !pergunta.ativo }"
                @click="ativa = indice"
            >
                <strong>{{ indice + 1 }}. {{ pergunta.titulo || "Sem título" }}</strong>
                <small>{{ TIPOS_PERGUNTA.find((item) => item.value === pergunta.tipo)?.label }}</small>
            </button>
        </div>

        <div v-if="atual" class="editor__form">
            <div class="d-flex flex-wrap gap-2 mb-3">
                <button type="button" class="btn pol-btn--ghost btn-sm" @click="mover(ativa, -1)"><RiArrowUpSLine /> Subir</button>
                <button type="button" class="btn pol-btn--ghost btn-sm" @click="mover(ativa, 1)"><RiArrowDownSLine /> Descer</button>
                <button type="button" class="btn pol-btn--ghost btn-sm" @click="duplicar(ativa)"><RiFileCopyLine /> Duplicar</button>
                <button type="button" class="btn pol-btn--danger btn-sm" @click="remover(ativa)"><RiDeleteBinLine /> Excluir</button>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Tipo</label>
                    <select v-model="atual.tipo" class="form-select">
                        <option v-for="tipo in TIPOS_PERGUNTA" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
                    </select>
                </div>
                <div class="col-md-6 d-flex align-items-end gap-3">
                    <label class="form-check">
                        <input v-model="atual.obrigatoria" class="form-check-input" type="checkbox" />
                        <span class="form-check-label">Obrigatória</span>
                    </label>
                    <label class="form-check">
                        <input v-model="atual.ativo" class="form-check-input" type="checkbox" />
                        <span class="form-check-label">Ativa</span>
                    </label>
                </div>
                <div class="col-12">
                    <label class="form-label">Título</label>
                    <input v-model="atual.titulo" class="form-control" maxlength="255" placeholder="Escreva a pergunta" />
                </div>
                <div class="col-12">
                    <label class="form-label">Descrição</label>
                    <textarea v-model="atual.descricao" class="form-control" rows="2" />
                </div>
            </div>

            <div v-if="atual.tipo === 'candidato'" class="mt-3">
                <label class="form-label">Cargo desta pergunta</label>
                <select class="form-select" :value="cargoConfig()" @change="definirCargo(($event.target as HTMLSelectElement).value)">
                    <option value="">Todos os cargos vinculados</option>
                    <option v-for="cargo in cargos" :key="cargo.id" :value="cargo.id">{{ cargo.nome }}</option>
                </select>
                <div class="d-flex flex-column gap-1 mt-2">
                    <label class="form-check">
                        <input class="form-check-input" type="checkbox" :checked="flag('permitir_indeciso')" @change="alternarFlag('permitir_indeciso', ($event.target as HTMLInputElement).checked)" />
                        <span class="form-check-label">Permitir indeciso</span>
                    </label>
                    <label class="form-check">
                        <input class="form-check-input" type="checkbox" :checked="flag('permitir_nao_vota')" @change="alternarFlag('permitir_nao_vota', ($event.target as HTMLInputElement).checked)" />
                        <span class="form-check-label">Permitir “não pretendo votar”</span>
                    </label>
                    <label class="form-check">
                        <input class="form-check-input" type="checkbox" :checked="flag('permitir_nao_responde')" @change="alternarFlag('permitir_nao_responde', ($event.target as HTMLInputElement).checked)" />
                        <span class="form-check-label">Permitir “prefiro não responder”</span>
                    </label>
                </div>
                <p class="small text-muted mt-2 mb-0">
                    Se a lista de opções estiver vazia na primeira gravação, a API monta os candidatos vinculados e as respostas especiais marcadas.
                    Opção que já recebeu resposta não pode ser apagada.
                </p>
            </div>

            <div v-if="atual.tipo === 'escala'" class="row g-3 mt-1">
                <div class="col-6">
                    <label class="form-label">Mínimo</label>
                    <input class="form-control" type="number" :value="numeroConfig('min')" @input="definirNumeroConfig('min', ($event.target as HTMLInputElement).value)" />
                </div>
                <div class="col-6">
                    <label class="form-label">Máximo</label>
                    <input class="form-control" type="number" :value="numeroConfig('max')" @input="definirNumeroConfig('max', ($event.target as HTMLInputElement).value)" />
                </div>
            </div>

            <div v-if="tipoPerguntaPedeOpcoes(atual.tipo)" class="mt-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h3 class="h6 mb-0">Opções</h3>
                    <button type="button" class="btn pol-btn--ghost btn-sm" @click="adicionarOpcao">Adicionar opção</button>
                </div>
                <div v-if="atual.tipo === 'municipio'" class="mb-2">
                    <input v-model="buscaCidade" class="form-control form-control-sm" placeholder="Buscar município para virar opção" />
                    <div class="d-flex flex-wrap gap-1 mt-2">
                        <button
                            v-for="cidade in cidadesFiltradas"
                            :key="cidade.ibge"
                            type="button"
                            class="btn btn-sm pol-btn--ghost"
                            @click="adicionarCidade(cidade)"
                        >
                            {{ cidade.nome }}
                        </button>
                    </div>
                </div>
                <div v-for="(opcao, indice) in atual.opcoes" :key="opcao.chave" class="editor__opcao">
                    <input v-model="opcao.rotulo" class="form-control" placeholder="Rótulo" maxlength="255" />
                    <input v-model="opcao.valor" class="form-control" placeholder="Valor" maxlength="120" />
                    <button type="button" class="btn pol-btn--danger btn-sm" @click="removerOpcao(indice)">Remover</button>
                    <small v-if="opcao.codigoEspecial" class="text-muted">{{ opcao.codigoEspecial }}</small>
                </div>
            </div>
        </div>

        <aside class="editor__phone" aria-label="Prévia no celular">
            <div class="editor__moldura">
                <p class="editor__phone-kicker">Prévia</p>
                <h3>{{ previa?.titulo }}</h3>
                <PesquisaPerguntaCampo
                    v-if="previa"
                    :pergunta="previa"
                    :candidatos="candidatos"
                    :resposta="respostaPrevia"
                    @alterar="respostaPrevia = $event"
                />
            </div>
        </aside>
    </div>
</template>

<style scoped>
.editor {
    display: grid;
    gap: 1rem;
}

@media (min-width: 1100px) {
    .editor {
        grid-template-columns: 220px minmax(0, 1fr) 320px;
        align-items: start;
    }
}

.editor__item {
    width: 100%;
    text-align: left;
    border: 1px solid rgba(22, 37, 78, 0.08);
    background: #fff;
    border-radius: 12px;
    padding: 0.65rem 0.75rem;
    margin-bottom: 0.4rem;
    display: flex;
    flex-direction: column;
}

.editor__item.is-on {
    border-color: #2da0a8;
    box-shadow: inset 3px 0 0 #2da0a8;
}

.editor__item.is-off {
    opacity: 0.55;
}

.editor__item small {
    color: #6b7c9f;
}

.editor__opcao {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 0.4rem;
    margin-bottom: 0.45rem;
}

.editor__moldura {
    background: #14233f;
    color: #fff;
    border-radius: 28px;
    padding: 1rem;
    min-height: 420px;
}

.editor__moldura h3 {
    font-size: 1.15rem;
    margin-bottom: 0.8rem;
}

.editor__phone-kicker {
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.72rem;
    opacity: 0.7;
}

@media (max-width: 1099px) {
    .editor__phone {
        order: 3;
    }
}
</style>
