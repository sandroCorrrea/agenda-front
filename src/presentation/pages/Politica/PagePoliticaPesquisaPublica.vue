<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RiArrowLeftLine, RiArrowRightLine, RiShieldCheckLine } from "@remixicon/vue";
import type { PesquisaPergunta } from "@/domain/politica/tipos";
import PesquisaPerguntaCampo from "@/presentation/components/Politica/PesquisaPerguntaCampo.vue";
import { usePesquisaPublica, type RespostaLocal } from "@/presentation/composables/Politica/usePesquisaPublica";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";
import BaseLoading from "@/presentation/components/Shared/BaseLoading.vue";

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

function ir(proximo: number) {
    bloqueio.value = null;
    animacao.value += 1;
    definirEtapa(proximo);
}

function voltar() {
    if (indiceEtapa.value <= 0) return;
    ir(indiceEtapa.value - 1);
}

function irParaPergunta(indice: number) {
    const posicao = etapas.value.findIndex((item) => item.kind === "pergunta" && item.indice === indice);
    if (posicao >= 0) ir(posicao);
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
            irParaPergunta(perguntas.value.indexOf(faltando));
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
    <article class="urna">
        <div class="urna__glow" aria-hidden="true" />
        <header class="urna__topo">
            <p class="urna__marca">{{ marca }}</p>
            <div v-if="pesquisa && !rascunho.concluida" class="urna__barra" aria-hidden="true">
                <span :style="{ width: `${progresso}%` }" />
            </div>
            <p v-if="etapa?.kind === 'pergunta'" class="urna__contador">
                Pergunta {{ numeroPergunta }} de {{ perguntas.length }}
            </p>
        </header>

        <BaseLoading v-if="tokenValido && carregando" text="Abrindo a pesquisa…" />

        <section v-else-if="!tokenValido || (erro && !pesquisa)" class="urna__miolo">
            <h1>Pesquisa indisponível</h1>
            <p>{{ erro || "O link precisa ser o código enviado pela equipe." }}</p>
        </section>

        <section v-else-if="rascunho.concluida" class="urna__miolo urna__miolo--centro">
            <p class="urna__olho">Pronto</p>
            <h1>{{ rascunho.mensagem || "Resposta enviada. Obrigado por participar." }}</h1>
            <p v-if="rascunho.protocolo" class="urna__protocolo">Protocolo {{ rascunho.protocolo }}</p>
            <p class="urna__nota">Sua resposta entrou na coleta. Este número não é uma previsão da eleição.</p>
        </section>

        <section v-else :key="animacao" class="urna__miolo">
            <template v-if="etapa?.kind === 'abertura'">
                <p class="urna__olho">Pesquisa anônima</p>
                <h1>{{ pesquisa?.nome }}</h1>
                <p v-if="pesquisa?.eleicao" class="urna__eleicao">{{ pesquisa.eleicao.nome }}</p>
                <p class="urna__lead">{{ pesquisa?.descricao || "Uma pergunta de cada vez. Leva pouco." }}</p>
                <p class="urna__nota">{{ pesquisa?.aviso || "A resposta é anônima. Não pedimos CPF, título, nome, e-mail nem telefone." }}</p>
            </template>

            <template v-else-if="etapa?.kind === 'privacidade'">
                <p class="urna__olho"><RiShieldCheckLine /> Privacidade</p>
                <h1>Antes de responder</h1>
                <p class="urna__aviso">{{ pesquisa?.avisoPrivacidade || "Suas respostas são usadas apenas nesta coleta." }}</p>
                <p class="urna__nota">O aceite fica para o final. Você pode voltar e mudar qualquer resposta.</p>
            </template>

            <template v-else-if="etapa?.kind === 'municipio'">
                <p class="urna__olho">Onde você está</p>
                <h1>Qual é a sua cidade?</h1>
                <input v-model="buscaCidade" class="urna__busca" type="search" placeholder="Buscar cidade" />
                <div class="urna__cidades">
                    <button
                        v-for="cidade in cidades"
                        :key="cidade.ibge"
                        type="button"
                        class="urna__cidade"
                        :class="{ 'is-on': rascunho.ibge === cidade.ibge }"
                        @click="definirIbge(cidade.ibge)"
                    >
                        <strong>{{ cidade.nome }}</strong>
                        <small>{{ cidade.uf }}</small>
                    </button>
                </div>
            </template>

            <template v-else-if="etapa?.kind === 'pergunta' && perguntaAtual">
                <h1>{{ perguntaAtual.titulo }}</h1>
                <PesquisaPerguntaCampo
                    :pergunta="perguntaAtual"
                    :candidatos="pesquisa?.candidatos ?? []"
                    :resposta="respostaAtual"
                    @alterar="definirResposta(perguntaAtual.id, $event)"
                />
            </template>

            <template v-else-if="etapa?.kind === 'revisao'">
                <p class="urna__olho">Quase lá</p>
                <h1>Confira o que você marcou</h1>
                <ul class="urna__revisao">
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
                <p class="urna__olho">Concluir</p>
                <h1>Pode enviar</h1>
                <label class="urna__aceite">
                    <input v-model="aceite" type="checkbox" />
                    <span>Li e aceito o aviso de privacidade.</span>
                </label>
            </template>

            <p v-if="bloqueio" class="urna__bloqueio" role="status">{{ bloqueio }}</p>
            <p v-if="erro" class="urna__bloqueio">{{ erro }}</p>
        </section>

        <footer v-if="!carregando && pesquisa && !rascunho.concluida" class="urna__dock">
            <button v-if="indiceEtapa > 0" type="button" class="urna__voltar" @click="voltar">
                <RiArrowLeftLine /> Voltar
            </button>
            <button type="button" class="urna__seguir" :disabled="enviando" @click="continuar">
                {{ etapa?.kind === "abertura" ? "Começar" : etapa?.kind === "final" ? (enviando ? "Enviando…" : "Finalizar") : "Continuar" }}
                <RiArrowRightLine v-if="etapa?.kind !== 'final'" />
            </button>
        </footer>
    </article>
</template>

<style scoped>
.urna {
    min-height: 100dvh;
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background:
        radial-gradient(circle at 10% 0%, rgba(31, 138, 132, 0.28), transparent 36%),
        radial-gradient(circle at 100% 20%, rgba(232, 184, 109, 0.18), transparent 28%),
        #102033;
    color: #f7f4ee;
    position: relative;
}

.urna__topo,
.urna__miolo,
.urna__dock {
    position: relative;
    z-index: 1;
}

.urna__topo {
    padding: 1rem 1.1rem 0.4rem;
}

.urna__marca {
    margin: 0 0 0.55rem;
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.72;
}

.urna__barra {
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
}

.urna__barra span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #e8b86d, #7dcec6);
    transition: width 0.25s ease;
}

.urna__contador {
    margin: 0.55rem 0 0;
    font-size: 0.85rem;
    font-weight: 700;
}

.urna__miolo {
    flex: 1;
    min-width: 0;
    padding: 1.2rem 1.1rem 7.5rem;
    animation: entra 0.22s ease;
}

.urna__miolo--centro {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.urna__olho {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0 0 0.4rem;
    color: #e8b86d;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.78rem;
}

h1 {
    font-size: clamp(1.7rem, 6vw, 2.4rem);
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 0.8rem;
    overflow-wrap: anywhere;
}

.urna__eleicao,
.urna__lead,
.urna__nota,
.urna__aviso {
    color: rgba(247, 244, 238, 0.86);
    font-size: 1.05rem;
    line-height: 1.5;
}

.urna__aviso {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 18px;
    padding: 1rem;
}

.urna__busca,
.urna__cidade,
.urna__revisao,
.urna__aceite {
    width: 100%;
}

.urna__busca {
    border: 0;
    border-radius: 14px;
    min-height: 52px;
    padding: 0 1rem;
    margin-bottom: 0.8rem;
}

.urna__cidades,
.urna__revisao {
    display: grid;
    gap: 0.55rem;
}

.urna__cidade,
.urna__revisao li {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: center;
    background: #fff;
    color: #14233f;
    border: 0;
    border-radius: 16px;
    min-height: 58px;
    padding: 0.75rem 0.9rem;
    text-align: left;
}

.urna__cidade.is-on {
    outline: 3px solid #e8b86d;
}

.urna__revisao {
    list-style: none;
    padding: 0;
    margin: 0;
}

.urna__revisao li div {
    display: flex;
    flex-direction: column;
}

.urna__revisao button,
.urna__voltar,
.urna__seguir {
    border: 0;
    font-weight: 800;
}

.urna__revisao button {
    background: transparent;
    color: #1f8a84;
}

.urna__aceite {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1rem;
    min-height: 64px;
}

.urna__aceite input {
    width: 1.3rem;
    height: 1.3rem;
    margin-top: 0.15rem;
}

.urna__protocolo {
    font-size: 1.4rem;
    font-weight: 800;
    color: #e8b86d;
}

.urna__bloqueio {
    margin-top: 0.8rem;
    color: #ffd7a8;
    font-weight: 700;
}

.urna__dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    gap: 0.6rem;
    padding: 0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom));
    background: linear-gradient(180deg, transparent, #102033 28%);
}

.urna__voltar,
.urna__seguir {
    min-height: 56px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
}

.urna__voltar {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 0 1rem;
}

.urna__seguir {
    flex: 1;
    background: #f7f4ee;
    color: #14233f;
    font-size: 1.05rem;
}

@keyframes entra {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
}
</style>
