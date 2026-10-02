<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RiArrowLeftLine, RiArrowRightLine, RiShieldCheckLine } from "@remixicon/vue";
import type { PesquisaPergunta } from "@/domain/politica/tipos";
import PesquisaPerguntaCampo from "@/presentation/components/Politica/PesquisaPerguntaCampo.vue";
import { usePesquisaPublica, type RespostaLocal } from "@/presentation/composables/Politica/usePesquisaPublica";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";
import BaseLoading from "@/presentation/components/Shared/BaseLoading.vue";
import logo from "@/presentation/assets/img/logo.jpeg";

const props = defineProps<{ token: string }>();

const matriz = useMatrizStore();
const marca = computed(() => matriz.matriz?.apelido?.trim() || "Agenda");
const tokenValido = computed(() => /^[a-f0-9]{32}$/.test(props.token));
const buscaCidade = ref("");
const aceite = ref(false);
const animacao = ref(0);

const {
    pesquisa,
    rascunho,
    carregando,
    enviando,
    erro,
    bloqueio,
    carregar,
    respostaDe,
    definirResposta,
    definirIbge,
    definirEtapa,
    enviarResposta
} = usePesquisaPublica(() => props.token);

type Etapa =
    | { id: string; kind: "abertura" | "privacidade" | "municipio" | "revisao" | "final" }
    | { id: string; kind: "pergunta"; indice: number };

const etapas = computed<Etapa[]>(() => {
    const lista: Etapa[] = [
        { id: "abertura", kind: "abertura" },
        { id: "privacidade", kind: "privacidade" }
    ];
    if ((pesquisa.value?.municipios.length ?? 0) > 0) {
        lista.push({ id: "municipio", kind: "municipio" });
    }
    (pesquisa.value?.perguntas ?? []).forEach((pergunta, indice) => {
        lista.push({ id: `pergunta-${pergunta.id}`, kind: "pergunta", indice });
    });
    if (pesquisa.value?.exibirRevisao) lista.push({ id: "revisao", kind: "revisao" });
    lista.push({ id: "final", kind: "final" });
    return lista;
});

const indiceEtapa = computed(() => {
    const maximo = Math.max(0, etapas.value.length - 1);
    return Math.min(Math.max(0, rascunho.value.etapa), maximo);
});

const etapa = computed(() => etapas.value[indiceEtapa.value]);
const perguntaAtual = computed(() => {
    if (etapa.value?.kind !== "pergunta") return null;
    return pesquisa.value?.perguntas[etapa.value.indice] ?? null;
});

const perguntas = computed(() => pesquisa.value?.perguntas ?? []);
const numeroPergunta = computed(() => {
    if (etapa.value?.kind !== "pergunta") return 0;
    return etapa.value.indice + 1;
});
const progresso = computed(() => ((indiceEtapa.value + 1) / Math.max(1, etapas.value.length)) * 100);

const cidades = computed(() => {
    const q = buscaCidade.value.trim().toLowerCase();
    return (pesquisa.value?.municipios ?? []).filter(
        (cidade) => !q || cidade.nome.toLowerCase().includes(q) || cidade.ibge.includes(q)
    );
});

const respostaAtual = computed(() =>
    perguntaAtual.value ? respostaDe(perguntaAtual.value.id) : vazia()
);

function vazia(): RespostaLocal {
    return { opcaoId: null, opcaoIds: [], valorTexto: "", valorNumerico: null };
}

function vaziaPergunta(pergunta: PesquisaPergunta, resposta: RespostaLocal): boolean {
    if (pergunta.tipo === "texto") return !resposta.valorTexto.trim();
    if (pergunta.tipo === "numero" || pergunta.tipo === "escala") return resposta.valorNumerico == null;
    if (pergunta.tipo === "escolha_multipla") return resposta.opcaoIds.length === 0;
    return resposta.opcaoId == null;
}

function textoBloqueio(pergunta: PesquisaPergunta): string {
    if (pergunta.tipo === "texto") return "Escreva uma resposta para continuar.";
    if (pergunta.tipo === "numero" || pergunta.tipo === "escala") return "Informe um valor para continuar.";
    if (pergunta.tipo === "escolha_multipla") return "Marque ao menos uma opção para continuar.";
    return "Escolha uma opção para continuar.";
}

function ir(proximo: number, manterAviso = false) {
    if (!manterAviso) bloqueio.value = null;
    animacao.value += 1;
    definirEtapa(proximo);
}

function voltar() {
    if (indiceEtapa.value <= 0) return;
    ir(indiceEtapa.value - 1);
}

function irParaPergunta(indice: number, manterAviso = false) {
    const posicao = etapas.value.findIndex((item) => item.kind === "pergunta" && item.indice === indice);
    if (posicao >= 0) ir(posicao, manterAviso);
}

async function continuar() {
    bloqueio.value = null;
    const atual = etapa.value;
    if (!atual || !pesquisa.value) return;

    if (atual.kind === "municipio" && !rascunho.value.ibge) {
        bloqueio.value = "Escolha o município para continuar.";
        return;
    }

    if (atual.kind === "pergunta" && perguntaAtual.value?.obrigatoria) {
        const resposta = respostaDe(perguntaAtual.value.id);
        if (vaziaPergunta(perguntaAtual.value, resposta)) {
            bloqueio.value = textoBloqueio(perguntaAtual.value);
            return;
        }
    }

    if (atual.kind === "final") {
        if (!aceite.value) {
            bloqueio.value = "Aceite o aviso de privacidade para concluir.";
            return;
        }
        const faltando = perguntas.value.find(
            (pergunta) => pergunta.obrigatoria && vaziaPergunta(pergunta, respostaDe(pergunta.id))
        );
        if (faltando) {
            bloqueio.value = `Ainda falta responder: ${faltando.titulo}`;
            irParaPergunta(perguntas.value.indexOf(faltando), true);
            return;
        }
        try {
            await enviarResposta(true, true);
        } catch {
            return;
        }
        return;
    }

    if (atual.kind !== "abertura") {
        void enviarResposta(false, aceite.value, true).catch(() => undefined);
    }
    ir(indiceEtapa.value + 1);
}

function resumo(pergunta: PesquisaPergunta): string {
    const resposta = respostaDe(pergunta.id);
    if (pergunta.tipo === "texto") return resposta.valorTexto.trim() || "Em branco";
    if (pergunta.tipo === "numero" || pergunta.tipo === "escala") {
        return resposta.valorNumerico == null ? "Em branco" : String(resposta.valorNumerico);
    }
    const ids = resposta.opcaoIds.length ? resposta.opcaoIds : resposta.opcaoId != null ? [resposta.opcaoId] : [];
    const rotulos = pergunta.opcoes.filter((opcao) => ids.includes(opcao.id)).map((opcao) => opcao.rotulo);
    return rotulos.join(", ") || "Em branco";
}

onMounted(() => {
    if (tokenValido.value) void carregar();
});

watch(
    () => props.token,
    () => {
        if (tokenValido.value) void carregar();
    }
);
</script>

<template>
    <article class="pesq">
        <header class="pesq__topo">
            <div class="pesq__marca">
                <img class="pesq__logo" :src="logo" alt="" width="44" height="44" />
                <div>
                    <p class="pesq__nome">{{ marca }}</p>
                    <p class="pesq__tag">Pesquisa anônima</p>
                </div>
            </div>
            <div
                v-if="pesquisa && !rascunho.concluida && !carregando"
                class="pesq__barra"
                role="progressbar"
                :aria-valuenow="Math.round(progresso)"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="etapa?.kind === 'pergunta' ? `Pergunta ${numeroPergunta} de ${perguntas.length}` : 'Andamento da pesquisa'"
            >
                <span :style="{ width: `${progresso}%` }" />
            </div>
        </header>

        <div class="pesq__shell">
            <BaseLoading v-if="tokenValido && carregando" text="Abrindo a pesquisa…" />

            <section v-else-if="!tokenValido || (erro && !pesquisa)" class="pesq__miolo">
                <p class="pesq__olho">Aviso</p>
                <h1 class="pesq__titulo">Pesquisa indisponível</h1>
                <p class="pesq__lead">{{ erro || "O link precisa ser o código enviado pela equipe." }}</p>
            </section>

            <section v-else-if="rascunho.concluida" class="pesq__miolo">
                <p class="pesq__olho">Pronto</p>
                <h1 class="pesq__titulo">{{ rascunho.mensagem || "Resposta enviada. Obrigado por participar." }}</h1>
                <p v-if="rascunho.protocolo" class="pesq__protocolo">Protocolo {{ rascunho.protocolo }}</p>
                <p class="pesq__nota">Sua resposta entrou na coleta. Este número não é uma previsão da eleição.</p>
            </section>

            <section v-else :key="animacao" class="pesq__miolo">
                <template v-if="etapa?.kind === 'abertura'">
                    <p class="pesq__olho">Uma pergunta de cada vez</p>
                    <h1 class="pesq__titulo">{{ pesquisa?.nome }}</h1>
                    <p v-if="pesquisa?.eleicao" class="pesq__eleicao">{{ pesquisa.eleicao.nome }}</p>
                    <p class="pesq__lead">{{ pesquisa?.descricao || "Leva pouco. Você pode voltar e mudar qualquer resposta." }}</p>
                    <p class="pesq__nota">{{ pesquisa?.aviso || "A resposta é anônima. Não pedimos CPF, título, nome, e-mail nem telefone." }}</p>
                </template>

                <template v-else-if="etapa?.kind === 'privacidade'">
                    <p class="pesq__olho"><RiShieldCheckLine /> Privacidade</p>
                    <h1 class="pesq__titulo">Antes de responder</h1>
                    <p class="pesq__aviso">{{ pesquisa?.avisoPrivacidade || "Suas respostas são usadas apenas nesta coleta." }}</p>
                    <p class="pesq__nota">O aceite fica para o final. Você pode voltar e mudar qualquer resposta.</p>
                </template>

                <template v-else-if="etapa?.kind === 'municipio'">
                    <p class="pesq__olho">Onde você está</p>
                    <h1 class="pesq__titulo">Qual é a sua cidade?</h1>
                    <input v-model="buscaCidade" class="pesq__busca" type="search" placeholder="Buscar cidade" />
                    <div class="pesq__cidades">
                        <button
                            v-for="cidade in cidades"
                            :key="cidade.ibge"
                            type="button"
                            class="pesq__cidade"
                            :class="{ 'is-on': rascunho.ibge === cidade.ibge }"
                            @click="definirIbge(cidade.ibge)"
                        >
                            <strong>{{ cidade.nome }}</strong>
                            <small>{{ cidade.uf }}</small>
                        </button>
                    </div>
                </template>

                <template v-else-if="etapa?.kind === 'pergunta' && perguntaAtual">
                    <p class="pesq__olho">Pergunta {{ numeroPergunta }} de {{ perguntas.length }}</p>
                    <h1 class="pesq__titulo">{{ perguntaAtual.titulo }}</h1>
                    <PesquisaPerguntaCampo
                        :pergunta="perguntaAtual"
                        :candidatos="pesquisa?.candidatos ?? []"
                        :resposta="respostaAtual"
                        @alterar="definirResposta(perguntaAtual.id, $event)"
                    />
                </template>

                <template v-else-if="etapa?.kind === 'revisao'">
                    <p class="pesq__olho">Quase lá</p>
                    <h1 class="pesq__titulo">Confira o que você marcou</h1>
                    <ul class="pesq__revisao">
                        <li v-for="(pergunta, indice) in perguntas" :key="pergunta.id">
                            <div>
                                <strong>{{ pergunta.titulo }}</strong>
                                <span>{{ resumo(pergunta) }}</span>
                            </div>
                            <button type="button" @click="irParaPergunta(indice)">Alterar</button>
                        </li>
                    </ul>
                </template>

                <template v-else>
                    <p class="pesq__olho">Concluir</p>
                    <h1 class="pesq__titulo">Pode enviar</h1>
                    <label class="pesq__aceite">
                        <input v-model="aceite" type="checkbox" />
                        <span>Li e aceito o aviso de privacidade.</span>
                    </label>
                </template>

                <p v-if="bloqueio" class="pesq__bloqueio" role="status">{{ bloqueio }}</p>
                <p v-if="erro" class="pesq__bloqueio">{{ erro }}</p>
            </section>

            <footer v-if="!carregando && pesquisa && !rascunho.concluida" class="pesq__dock">
                <button v-if="indiceEtapa > 0" type="button" class="pesq__voltar" @click="voltar">
                    <RiArrowLeftLine /> Voltar
                </button>
                <button type="button" class="pesq__seguir" :disabled="enviando" @click="continuar">
                    {{ etapa?.kind === "abertura" ? "Começar" : etapa?.kind === "final" ? (enviando ? "Enviando…" : "Finalizar") : "Continuar" }}
                    <RiArrowRightLine v-if="etapa?.kind !== 'final'" />
                </button>
            </footer>
        </div>
    </article>
</template>

<style scoped>
.pesq {
    --pesq-ink: #0f2744;
    --pesq-mute: #5a6b7d;
    --pesq-accent: #0d6e6e;
    min-height: 100dvh;
    width: 100%;
    min-width: 0;
    color: var(--pesq-ink);
    background:
        radial-gradient(circle at top right, #edf5ff 0%, #f6f8fc 42%, #eef4f3 100%);
}

.pesq__topo {
    width: min(640px, calc(100% - 1.5rem));
    margin: 0 auto;
    padding: 1.1rem 0 0.85rem;
}

.pesq__marca {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
}

.pesq__logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
}

.pesq__nome {
    margin: 0;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.pesq__tag {
    margin: 0.1rem 0 0;
    font-size: 0.78rem;
    color: var(--pesq-mute);
}

.pesq__barra {
    height: 6px;
    border-radius: 999px;
    background: rgba(15, 39, 68, 0.08);
    overflow: hidden;
}

.pesq__barra span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #5c6bc0, #2da0a8);
    transition: width 0.25s ease;
}

.pesq__shell {
    width: min(640px, calc(100% - 1.5rem));
    margin: 0 auto 1.25rem;
    background: #fff;
    border: 1px solid rgba(15, 39, 68, 0.08);
    border-radius: 1.25rem;
    padding: 1.25rem 1.1rem 1.15rem;
}

.pesq__miolo {
    min-width: 0;
    animation: entra 0.22s ease;
}

.pesq__olho {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0 0 0.65rem;
    color: var(--pesq-accent);
    background: rgba(13, 110, 110, 0.1);
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    font-weight: 700;
    font-size: 0.78rem;
}

.pesq__titulo {
    font-size: clamp(1.45rem, 5vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin: 0 0 0.75rem;
    overflow-wrap: anywhere;
}

.pesq__eleicao,
.pesq__lead,
.pesq__nota {
    color: var(--pesq-mute);
    font-size: 1rem;
    line-height: 1.55;
}

.pesq__eleicao {
    margin: 0 0 0.45rem;
    color: #1b4f8a;
    font-weight: 700;
}

.pesq__aviso,
.pesq__nota {
    background: #f4f7fb;
    border-radius: 16px;
    padding: 0.9rem 1rem;
}

.pesq__busca,
.pesq__cidade,
.pesq__revisao,
.pesq__aceite {
    width: 100%;
}

.pesq__busca {
    border: 1px solid rgba(15, 39, 68, 0.12);
    border-radius: 14px;
    min-height: 52px;
    padding: 0 1rem;
    margin: 0.2rem 0 0.8rem;
    font: inherit;
}

.pesq__cidades,
.pesq__revisao {
    display: grid;
    gap: 0.55rem;
}

.pesq__cidade,
.pesq__revisao li {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: center;
    background: #fff;
    color: var(--pesq-ink);
    border: 1px solid rgba(15, 39, 68, 0.1);
    border-radius: 16px;
    min-height: 58px;
    padding: 0.75rem 0.9rem;
    text-align: left;
}

.pesq__cidade.is-on {
    border-color: var(--pesq-accent);
    background: #e7f6f4;
}

.pesq__cidade small {
    color: var(--pesq-mute);
}

.pesq__revisao {
    list-style: none;
    padding: 0;
    margin: 0;
}

.pesq__revisao li div {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.pesq__revisao li span {
    color: var(--pesq-mute);
    font-size: 0.92rem;
}

.pesq__revisao button,
.pesq__voltar,
.pesq__seguir {
    border: 0;
    font: inherit;
    font-weight: 700;
}

.pesq__revisao button {
    background: transparent;
    color: var(--pesq-accent);
    flex-shrink: 0;
}

.pesq__aceite {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    background: #f4f7fb;
    border-radius: 16px;
    padding: 1rem;
    min-height: 64px;
}

.pesq__aceite input {
    width: 1.3rem;
    height: 1.3rem;
    margin-top: 0.15rem;
}

.pesq__protocolo {
    display: inline-block;
    margin: 0.2rem 0 0.8rem;
    font-size: 1.15rem;
    font-weight: 800;
    color: #1f2e54;
    background: rgba(45, 160, 168, 0.12);
    border-radius: 999px;
    padding: 0.35rem 0.8rem;
}

.pesq__bloqueio {
    margin: 0.9rem 0 0;
    padding: 0.75rem 0.9rem;
    border-radius: 12px;
    background: #fff8e8;
    border: 1px solid #efd48a;
    color: #7a5b12;
    font-weight: 700;
}

.pesq__dock {
    display: flex;
    gap: 0.6rem;
    margin-top: 1.15rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgba(15, 39, 68, 0.08);
}

.pesq__voltar,
.pesq__seguir {
    min-height: 52px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
}

.pesq__voltar {
    background: #fff;
    color: #1c3359;
    border: 1px solid rgba(92, 107, 192, 0.28);
    padding: 0 1rem;
}

.pesq__seguir {
    flex: 1;
    background: linear-gradient(90deg, #5c6bc0, #2da0a8);
    color: #fff;
    font-size: 1.02rem;
}

.pesq__seguir:disabled {
    opacity: 0.7;
}

@keyframes entra {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
}

@media (max-width: 640px) {
    .pesq__shell:has(.pesq__dock) {
        margin-bottom: 0;
        border-radius: 1.25rem 1.25rem 0 0;
        min-height: calc(100dvh - 7.2rem);
        display: flex;
        flex-direction: column;
    }

    .pesq__shell:has(.pesq__dock) .pesq__miolo {
        flex: 1;
    }

    .pesq__shell:has(.pesq__dock) .pesq__dock {
        position: sticky;
        bottom: 0;
        background: #fff;
        margin-left: -1.1rem;
        margin-right: -1.1rem;
        margin-bottom: -1.15rem;
        padding: 0.8rem 1.1rem calc(0.8rem + env(safe-area-inset-bottom));
    }
}
</style>
