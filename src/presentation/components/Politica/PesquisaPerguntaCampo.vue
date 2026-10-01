<script setup lang="ts">
import { computed } from "vue";
import type { Candidato, PesquisaPergunta } from "@/domain/politica/tipos";
import type { RespostaLocal } from "@/presentation/composables/Politica/usePesquisaPublica";
import { resolvePublicAssetUrl } from "@/shared/utils/mediaUrl";

const props = defineProps<{
    pergunta: PesquisaPergunta;
    candidatos: Candidato[];
    resposta: RespostaLocal;
    desabilitado?: boolean;
}>();

const emit = defineEmits<{
    alterar: [resposta: RespostaLocal];
}>();

const especiais = computed(() =>
    [...props.pergunta.opcoes]
        .filter((opcao) => opcao.codigoEspecial)
        .sort((a, b) => a.ordem - b.ordem)
);

const regulares = computed(() =>
    [...props.pergunta.opcoes]
        .filter((opcao) => !opcao.codigoEspecial)
        .sort((a, b) => a.ordem - b.ordem)
);

const limites = computed(() => {
    if (props.pergunta.escala) return props.pergunta.escala;
    const min = Number(props.pergunta.configuracao.min ?? 0);
    const max = Number(props.pergunta.configuracao.max ?? 10);
    return {
        min: Number.isFinite(min) ? min : 0,
        max: Number.isFinite(max) ? max : 10
    };
});

const pontosEscala = computed(() => {
    const { min, max } = limites.value;
    const tamanho = max - min;
    if (tamanho < 0 || tamanho > 12) return [];
    return Array.from({ length: tamanho + 1 }, (_, indice) => min + indice);
});

const marcadas = computed(() => props.resposta.opcaoIds.length);

function candidatoDe(id: number | null) {
    if (id == null) return null;
    return props.candidatos.find((item) => item.id === id) ?? null;
}

function fotoDe(id: number | null) {
    return resolvePublicAssetUrl(candidatoDe(id)?.fotoUrl);
}

function escolherUma(opcaoId: number) {
    if (props.desabilitado) return;
    emit("alterar", { ...props.resposta, opcaoId, opcaoIds: [opcaoId] });
}

function alternarVarias(opcaoId: number) {
    if (props.desabilitado) return;
    const atual = new Set(props.resposta.opcaoIds);
    if (atual.has(opcaoId)) atual.delete(opcaoId);
    else atual.add(opcaoId);
    const opcaoIds = [...atual];
    emit("alterar", { ...props.resposta, opcaoIds, opcaoId: opcaoIds[0] ?? null });
}

function texto(valor: string) {
    emit("alterar", { ...props.resposta, valorTexto: valor, opcaoId: null, opcaoIds: [] });
}

function numero(valor: string) {
    const limpo = valor.trim();
    emit("alterar", {
        ...props.resposta,
        valorNumerico: limpo === "" ? null : Number(limpo),
        opcaoId: null,
        opcaoIds: []
    });
}

function selecionada(opcaoId: number) {
    return props.resposta.opcaoId === opcaoId || props.resposta.opcaoIds.includes(opcaoId);
}
</script>

<template>
    <div class="campo">
        <p v-if="pergunta.descricao" class="campo__apoio">{{ pergunta.descricao }}</p>

        <div v-if="pergunta.tipo === 'texto'" class="campo__texto">
            <label class="visually-hidden" :for="`texto-${pergunta.id}`">Resposta</label>
            <textarea
                :id="`texto-${pergunta.id}`"
                :value="resposta.valorTexto"
                rows="5"
                maxlength="2000"
                placeholder="Escreva com suas palavras."
                autocomplete="off"
                :disabled="desabilitado"
                @input="texto(($event.target as HTMLTextAreaElement).value)"
            />
        </div>

        <div v-else-if="pergunta.tipo === 'numero'" class="campo__numero">
            <label class="visually-hidden" :for="`num-${pergunta.id}`">Valor</label>
            <input
                :id="`num-${pergunta.id}`"
                :value="resposta.valorNumerico ?? ''"
                type="number"
                inputmode="decimal"
                :disabled="desabilitado"
                @input="numero(($event.target as HTMLInputElement).value)"
            />
        </div>

        <div v-else-if="pergunta.tipo === 'escala'" class="campo__escala">
            <div v-if="pontosEscala.length" class="campo__escala-pontos" role="radiogroup">
                <button
                    v-for="ponto in pontosEscala"
                    :key="ponto"
                    type="button"
                    class="campo__ponto"
                    :class="{ 'is-on': resposta.valorNumerico === ponto }"
                    :disabled="desabilitado"
                    @click="numero(String(ponto))"
                >
                    {{ ponto }}
                </button>
            </div>
            <input
                v-else
                :value="resposta.valorNumerico ?? ''"
                type="number"
                :min="limites.min"
                :max="limites.max"
                :disabled="desabilitado"
                @input="numero(($event.target as HTMLInputElement).value)"
            />
            <small>{{ limites.min }} a {{ limites.max }}</small>
        </div>

        <div v-else-if="pergunta.tipo === 'escolha_multipla'" class="campo__lista">
            <p class="campo__conta">{{ marcadas }} selecionada(s)</p>
            <button
                v-for="opcao in regulares"
                :key="opcao.id"
                type="button"
                class="campo__cartao"
                :class="{ 'is-on': selecionada(opcao.id) }"
                :disabled="desabilitado"
                @click="alternarVarias(opcao.id)"
            >
                <span>{{ opcao.rotulo }}</span>
            </button>
        </div>

        <div v-else-if="pergunta.tipo === 'candidato'" class="campo__lista">
            <button
                v-for="opcao in regulares"
                :key="opcao.id"
                type="button"
                class="campo__cartao campo__cartao--pessoa"
                :class="{ 'is-on': selecionada(opcao.id) }"
                :disabled="desabilitado"
                @click="escolherUma(opcao.id)"
            >
                <img
                    v-if="fotoDe(opcao.candidatoId)"
                    :src="fotoDe(opcao.candidatoId) || ''"
                    alt=""
                    class="campo__foto"
                />
                <span v-else class="campo__foto campo__foto--vazia">
                    {{ (candidatoDe(opcao.candidatoId)?.nomeUrna || opcao.rotulo).slice(0, 1) }}
                </span>
                <span class="campo__pessoa">
                    <strong>{{ candidatoDe(opcao.candidatoId)?.numero || "" }}</strong>
                    <span>{{ candidatoDe(opcao.candidatoId)?.nomeUrna || opcao.rotulo }}</span>
                    <small>{{ candidatoDe(opcao.candidatoId)?.partidoSigla || "Sem partido" }}</small>
                </span>
            </button>
            <button
                v-for="opcao in especiais"
                :key="opcao.id"
                type="button"
                class="campo__cartao campo__cartao--quieto"
                :class="{ 'is-on': selecionada(opcao.id) }"
                :disabled="desabilitado"
                @click="escolherUma(opcao.id)"
            >
                {{ opcao.rotulo }}
            </button>
        </div>

        <div v-else class="campo__lista">
            <button
                v-for="opcao in [...regulares, ...especiais]"
                :key="opcao.id"
                type="button"
                class="campo__cartao"
                :class="{ 'is-on': selecionada(opcao.id) }"
                :disabled="desabilitado"
                @click="escolherUma(opcao.id)"
            >
                {{ opcao.rotulo }}
            </button>
            <p v-if="pergunta.opcoes.length === 0" class="campo__vazio">Esta pergunta ainda não tem opções.</p>
        </div>
    </div>
</template>

<style scoped>
.campo__apoio {
    color: #5c6b84;
    margin: 0 0 1rem;
}

.campo__lista,
.campo__escala-pontos {
    display: grid;
    gap: 0.65rem;
}

.campo__conta {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 700;
    color: #1f8a84;
}

.campo__cartao {
    width: 100%;
    text-align: left;
    border: 1px solid rgba(20, 35, 63, 0.1);
    background: #fff;
    border-radius: 16px;
    min-height: 56px;
    padding: 0.85rem 1rem;
    font-weight: 700;
    color: #14233f;
    box-shadow: 0 8px 20px rgba(20, 35, 63, 0.04);
}

.campo__cartao.is-on {
    border-color: #1f8a84;
    background: #e7f6f4;
    box-shadow: inset 0 0 0 1px #1f8a84;
}

.campo__cartao--pessoa {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.campo__cartao--quieto {
    background: transparent;
    box-shadow: none;
    color: #5c6b84;
    font-weight: 600;
}

.campo__foto {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    object-fit: cover;
    flex-shrink: 0;
}

.campo__foto--vazia {
    display: grid;
    place-items: center;
    background: #14233f;
    color: #fff;
    font-weight: 800;
}

.campo__pessoa {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
}

.campo__pessoa strong {
    color: #1f8a84;
    font-size: 0.95rem;
}

.campo__pessoa small {
    color: #6b7c9f;
    font-weight: 700;
}

.campo__texto textarea,
.campo__numero input,
.campo__escala input {
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(20, 35, 63, 0.12);
    padding: 0.9rem 1rem;
    font-size: 1.05rem;
}

.campo__escala-pontos {
    grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
}

.campo__ponto {
    min-height: 52px;
    border-radius: 14px;
    border: 1px solid rgba(20, 35, 63, 0.1);
    background: #fff;
    font-weight: 800;
    color: #14233f;
}

.campo__ponto.is-on {
    background: #14233f;
    color: #fff;
}

.campo__vazio,
.campo__escala small {
    color: #6b7c9f;
}
</style>
