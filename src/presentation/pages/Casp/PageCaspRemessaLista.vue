<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RiArrowLeftLine, RiArrowRightLine, RiCloseLine, RiDeleteBinLine, RiFolderZipLine, RiMapPinLine, RiSearchLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import CaspHistoricoDetalhe from "@/presentation/components/Casp/CaspHistoricoDetalhe.vue";
import CaspHistoricoPrevisao from "@/presentation/components/Casp/CaspHistoricoPrevisao.vue";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { useSicomHistorico } from "@/presentation/composables/Sicom/useSicomHistorico";
import type { SicomHistoricoListaItem, SicomHistoricoMunicipio } from "@/domain/sicom/historico";
import type { SicomRelatorioSituacao } from "@/domain/sicom/relatorio";
import { formatarGravadoEm, rotuloSituacaoHistorico } from "@/shared/utils/sicomHistorico";
import { formatarReais } from "@/shared/utils/sicomRelatorio";
import { lerArquivoRemessa } from "@/shared/utils/sicomRemessaArquivo";
import "@/presentation/assets/styles/politica-admin.css";

const PREVIEW_ANOS = 4;

const { podeExcluir } = usePermissaoMenu("admin.casp_remessa");
const {
    listando,
    consultando,
    excluindo,
    prevendo,
    lista,
    detalhe,
    previsao,
    falhaLista,
    falhaDetalhe,
    falhaExclusao,
    falhaPrevisao,
    sucessoExclusao,
    horizonte,
    listar,
    detalhar,
    excluir,
    definirMunicipio,
    definirHorizonte
} = useSicomHistorico();
const busca = ref("");
const municipioAberto = ref<string | null>(null);
const voltarEl = ref<HTMLButtonElement | null>(null);
const vista = ref<"anos" | "contas" | "previsao">("anos");
const anoAberto = ref<number | null>(null);
const pendente = ref<AnoRemessa | null>(null);

type AnoRemessa = {
    chave: string;
    id: number | null;
    ano: number | null;
    anoTexto: string;
    instrumento: string;
    situacao: SicomRelatorioSituacao | null;
    receitaLiquida: number | null;
    despesaFixada: number | null;
    resultado: number | null;
    gravadoEm: string;
};

type GrupoCard = {
    chave: string;
    titulo: string;
    codigo: string;
    mostrarCodigo: boolean;
    anos: AnoRemessa[];
    preview: string[];
    resto: number;
    faixa: string;
    quantidade: number;
};

function anoNumero(item: SicomHistoricoListaItem): number | null {
    const lido = lerArquivoRemessa(item.arquivo);
    const ano = lido?.ano ?? item.exercicio;
    return ano != null && Number.isFinite(ano) ? ano : null;
}

function instrumentoDe(item: SicomHistoricoListaItem): string {
    return lerArquivoRemessa(item.arquivo)?.tipo ?? "—";
}

function anoDeItem(item: SicomHistoricoListaItem, indice: number): AnoRemessa {
    const ano = anoNumero(item);
    return {
        chave: `${item.id ?? "sem-id"}-${indice}`,
        id: item.id,
        ano,
        anoTexto: ano == null ? "—" : String(ano),
        instrumento: instrumentoDe(item),
        situacao: item.situacao,
        receitaLiquida: item.receitaLiquida,
        despesaFixada: item.despesaFixada,
        resultado: item.resultado,
        gravadoEm: formatarGravadoEm(item.gravadoEm)
    };
}

function anosUnicos(anos: AnoRemessa[]): number[] {
    const vistos = new Set<number>();
    const listaAnos: number[] = [];
    for (const item of anos) {
        if (item.ano == null || vistos.has(item.ano)) continue;
        vistos.add(item.ano);
        listaAnos.push(item.ano);
    }
    return listaAnos;
}

function tituloGrupo(grupo: SicomHistoricoMunicipio, codigo: string): string {
    const nome = grupo.nomeMunicipio?.trim() || grupo.remessas.find((item) => item.nomeMunicipio?.trim())?.nomeMunicipio?.trim() || "";
    return nome || codigo || "Município sem identificação";
}

function montarGrupo(grupo: SicomHistoricoMunicipio, indice: number): GrupoCard {
    const codigo = grupo.municipio?.trim() || lerArquivoRemessa(grupo.remessas[0]?.arquivo)?.codigoMunicipio || "";
    const titulo = tituloGrupo(grupo, codigo);
    const anos = grupo.remessas
        .map((item, itemIndice) => anoDeItem(item, indice * 1000 + itemIndice))
        .sort((a, b) => (b.ano ?? -1) - (a.ano ?? -1) || a.chave.localeCompare(b.chave));
    const numeros = anosUnicos(anos);
    const menor = numeros.length ? Math.min(...numeros) : null;
    const maior = numeros.length ? Math.max(...numeros) : null;
    return {
        chave: codigo || titulo,
        titulo,
        codigo,
        mostrarCodigo: Boolean(codigo) && titulo !== codigo,
        anos,
        preview: numeros.slice(0, PREVIEW_ANOS).map(String),
        resto: Math.max(0, numeros.length - PREVIEW_ANOS),
        faixa: menor == null || maior == null ? "—" : menor === maior ? String(menor) : `${menor} – ${maior}`,
        quantidade: anos.length
    };
}

function juntaGrupos(grupos: GrupoCard[]): GrupoCard[] {
    const mapa = new Map<string, GrupoCard>();
    for (const grupo of grupos) {
        const atual = mapa.get(grupo.chave);
        if (!atual) {
            mapa.set(grupo.chave, { ...grupo, anos: [...grupo.anos] });
            continue;
        }
        atual.anos.push(...grupo.anos);
        if (!atual.mostrarCodigo && grupo.mostrarCodigo) {
            atual.titulo = grupo.titulo;
            atual.mostrarCodigo = true;
        }
    }
    return [...mapa.values()].map((grupo) => {
        const anos = [...grupo.anos].sort((a, b) => (b.ano ?? -1) - (a.ano ?? -1));
        const numeros = anosUnicos(anos);
        const menor = numeros.length ? Math.min(...numeros) : null;
        const maior = numeros.length ? Math.max(...numeros) : null;
        return {
            ...grupo,
            anos,
            preview: numeros.slice(0, PREVIEW_ANOS).map(String),
            resto: Math.max(0, numeros.length - PREVIEW_ANOS),
            faixa: menor == null || maior == null ? "—" : menor === maior ? String(menor) : `${menor} – ${maior}`,
            quantidade: anos.length
        };
    });
}

const grupos = computed(() => {
    if (lista.value?.status !== "listado") return [];
    return juntaGrupos(lista.value.municipios.map(montarGrupo)).sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
});

const termo = computed(() => busca.value.trim().toLocaleLowerCase("pt-BR"));

function grupoCombina(grupo: GrupoCard): boolean {
    if (!termo.value) return true;
    const alvo = [grupo.titulo, grupo.codigo, ...grupo.anos.map((item) => `${item.anoTexto} ${item.instrumento}`)]
        .join("\n")
        .toLocaleLowerCase("pt-BR");
    return alvo.includes(termo.value);
}

const visiveis = computed(() => grupos.value.filter(grupoCombina));
const aberto = computed(() => visiveis.value.find((grupo) => grupo.chave === municipioAberto.value) ?? null);
const anosAbertos = computed(() => {
    const grupo = aberto.value;
    if (!grupo) return [];
    if (!termo.value) return grupo.anos;
    return grupo.anos.filter((item) =>
        `${item.anoTexto} ${item.instrumento} ${rotuloSituacaoHistorico(item.situacao)}`.toLocaleLowerCase("pt-BR").includes(termo.value)
    );
});
const buscaAtiva = computed(() => termo.value.length > 0);

watch(visiveis, (listaAtual) => {
    if (municipioAberto.value && !listaAtual.some((grupo) => grupo.chave === municipioAberto.value)) {
        municipioAberto.value = null;
        voltarVista();
    }
});

onMounted(() => {
    void listar({ atualizarPrevisao: false });
    window.addEventListener("keydown", aoTeclar);
});

onBeforeUnmount(() => {
    window.removeEventListener("keydown", aoTeclar);
});

function aoTeclar(evento: KeyboardEvent) {
    if (evento.key === "Escape") fecharConfirmacao();
}

function fecharConfirmacao() {
    if (!pendente.value || excluindo.value) return;
    pendente.value = null;
}

function rotuloExercicios(quantidade: number): string {
    return quantidade === 1 ? "1 exercício" : `${quantidade} exercícios`;
}

function classeSituacao(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "deficit") return "remessa-ano--deficit";
    if (situacao === "superavit") return "remessa-ano--superavit";
    if (situacao === "equilibrado") return "remessa-ano--equilibrado";
    return "";
}

function classeSelo(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "deficit") return "pol-badge--stop";
    if (situacao === "superavit") return "remessa-selo--superavit";
    if (situacao === "equilibrado") return "pol-badge--on";
    return "pol-badge--wait";
}

function classeValor(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "deficit") return "remessa-valor--deficit";
    if (situacao === "superavit") return "remessa-valor--superavit";
    if (situacao === "equilibrado") return "remessa-valor--equilibrado";
    return "";
}

function voltarVista() {
    vista.value = "anos";
    anoAberto.value = null;
}

async function abrir(chave: string) {
    if (municipioAberto.value !== chave) voltarVista();
    municipioAberto.value = chave;
    await nextTick();
    voltarEl.value?.focus();
}

function voltar() {
    municipioAberto.value = null;
    voltarVista();
}

function verContas(item: AnoRemessa) {
    if (item.id == null) return;
    vista.value = "contas";
    anoAberto.value = item.id;
    if (detalhe.value?.id === item.id && detalhe.value.status === "detalhado") return;
    void detalhar(item.id);
}

async function verPrevisao() {
    const codigo = aberto.value?.codigo;
    if (!codigo) return;
    vista.value = "previsao";
    anoAberto.value = null;
    await definirMunicipio(codigo);
}

function pedirExclusao(item: AnoRemessa) {
    if (item.id == null || excluindo.value) return;
    pendente.value = item;
}

async function confirmarExclusao() {
    const item = pendente.value;
    if (!item || item.id == null || excluindo.value) return;
    const id = item.id;
    const eraEste = anoAberto.value === id;
    await excluir(id);
    pendente.value = null;
    if (eraEste) voltarVista();
}
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Remessa"
                subtitle="Escolha um município. Dentro dele ficam os exercícios, as contas, a exclusão e a previsão."
            >
                <template #icon><RiFolderZipLine /></template>
                <template #actions>
                    <RouterLink class="btn pol-btn" :to="{ name: 'AdministradorCaspHistorico' }">Enviar Remessa</RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="falhaLista" class="pol-alert pol-alert--erro mb-3">{{ falhaLista }}</div>
            <div v-if="sucessoExclusao" class="pol-alert pol-alert--ok mb-3">{{ sucessoExclusao }}</div>
            <div v-if="falhaExclusao" class="pol-alert pol-alert--erro mb-3">{{ falhaExclusao }}</div>

            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <form class="mb-4" @submit.prevent>
                        <div class="pol-search">
                            <RiSearchLine />
                            <input
                                v-model="busca"
                                class="form-control"
                                type="search"
                                maxlength="160"
                                placeholder="Buscar município ou ano"
                                aria-label="Buscar município ou ano"
                            />
                        </div>
                    </form>

                    <p v-if="listando && grupos.length === 0" class="text-muted mb-0">Carregando remessas…</p>

                    <div v-else-if="!aberto" class="remessa-lista">
                        <p v-if="visiveis.length" class="remessa-contagem">
                            {{ visiveis.length === 1 ? "1 município" : `${visiveis.length} municípios` }}
                        </p>
                        <div v-if="visiveis.length" class="remessa-munis">
                            <button
                                v-for="grupo in visiveis"
                                :key="grupo.chave"
                                type="button"
                                class="remessa-muni"
                                :aria-label="`Abrir ${grupo.titulo}, ${rotuloExercicios(grupo.quantidade)}`"
                                @click="abrir(grupo.chave)"
                            >
                                <span class="remessa-muni__topo">
                                    <span class="remessa-muni__pin" aria-hidden="true"><RiMapPinLine /></span>
                                    <span>
                                        <strong>{{ grupo.titulo }}</strong>
                                    </span>
                                </span>
                                <span class="remessa-muni__meta">
                                    <em>{{ rotuloExercicios(grupo.quantidade) }}</em>
                                    <em>{{ grupo.faixa }}</em>
                                </span>
                                <span class="remessa-muni__anos" aria-hidden="true">
                                    <span v-for="(ano, indice) in grupo.preview" :key="`${grupo.chave}-${indice}`">{{ ano }}</span>
                                    <span v-if="grupo.resto" class="remessa-muni__mais">+{{ grupo.resto }}</span>
                                </span>
                                <span class="remessa-muni__abrir">
                                    Ver exercícios
                                    <RiArrowRightLine />
                                </span>
                            </button>
                        </div>
                        <div v-else-if="!falhaLista" class="remessa-vazio">
                            <p class="mb-3">
                                {{ buscaAtiva ? "Nenhum município encontrado para esta busca." : "Nenhuma remessa gravada." }}
                            </p>
                            <RouterLink v-if="!buscaAtiva" class="btn pol-btn" :to="{ name: 'AdministradorCaspHistorico' }">
                                Enviar Remessa
                            </RouterLink>
                        </div>
                    </div>

                    <div v-else class="remessa-dentro">
                        <button ref="voltarEl" type="button" class="remessa-voltar" @click="voltar">
                            <RiArrowLeftLine />
                            Todos os municípios
                        </button>
                        <header class="remessa-cabeca">
                            <span class="remessa-muni__pin" aria-hidden="true"><RiMapPinLine /></span>
                            <div class="flex-grow-1">
                                <h2 class="h4 mb-1">{{ aberto.titulo }}</h2>
                                <p class="mb-0 text-muted">{{ rotuloExercicios(aberto.quantidade) }} · {{ aberto.faixa }}</p>
                            </div>
                            <button
                                v-if="vista === 'anos' && aberto.codigo"
                                class="btn pol-btn"
                                type="button"
                                :disabled="prevendo"
                                @click="verPrevisao"
                            >
                                Ver previsão
                            </button>
                        </header>

                        <template v-if="vista === 'contas'">
                            <button type="button" class="remessa-voltar" @click="voltarVista">
                                <RiArrowLeftLine />
                                Exercícios de {{ aberto.titulo }}
                            </button>
                            <p v-if="consultando" class="mb-3">Consultando o exercício…</p>
                            <div v-if="falhaDetalhe" class="pol-alert pol-alert--erro mb-3">{{ falhaDetalhe }}</div>
                            <CaspHistoricoDetalhe
                                v-if="detalhe?.status === 'detalhado'"
                                :detalhe="detalhe"
                                :nome-municipio="aberto.titulo"
                            />
                        </template>

                        <template v-else-if="vista === 'previsao'">
                            <button type="button" class="remessa-voltar" @click="voltarVista">
                                <RiArrowLeftLine />
                                Exercícios de {{ aberto.titulo }}
                            </button>
                            <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
                                <div>
                                    <h3 class="h5 mb-1">Previsão de {{ aberto.titulo }}</h3>
                                    <p class="text-muted small mb-0">Exercícios à frente contam a partir do último ano gravado.</p>
                                </div>
                                <div class="remessa-abas" role="group" aria-label="Exercícios à frente">
                                    <button type="button" :class="{ 'is-on': horizonte === 1 }" :disabled="prevendo" @click="definirHorizonte(1)">1 ano</button>
                                    <button type="button" :class="{ 'is-on': horizonte === 2 }" :disabled="prevendo" @click="definirHorizonte(2)">2 anos</button>
                                    <button type="button" :class="{ 'is-on': horizonte === 3 }" :disabled="prevendo" @click="definirHorizonte(3)">3 anos</button>
                                </div>
                            </div>
                            <p v-if="prevendo">Gerando a previsão…</p>
                            <div v-else-if="falhaPrevisao" class="pol-alert pol-alert--erro">{{ falhaPrevisao }}</div>
                            <div v-else-if="previsao?.status === 'erro'" class="pol-alert pol-alert--aviso">{{ previsao.mensagem }}</div>
                            <CaspHistoricoPrevisao v-else-if="previsao?.status === 'previsto'" :resposta="previsao" :horizonte="horizonte" />
                        </template>

                        <template v-else>
                            <ol v-if="anosAbertos.length" class="remessa-anos">
                                <li v-for="item in anosAbertos" :key="item.chave" class="remessa-ano" :class="classeSituacao(item.situacao)">
                                    <div class="remessa-ano__marca" aria-hidden="true">
                                        <span>{{ item.anoTexto }}</span>
                                    </div>
                                    <article class="remessa-ano__corpo">
                                        <div class="remessa-ano__topo">
                                            <div>
                                                <p class="remessa-ano__tipo">{{ item.instrumento }}</p>
                                                <p class="remessa-ano__quando">Gravado em {{ item.gravadoEm }}</p>
                                            </div>
                                            <span class="pol-badge" :class="classeSelo(item.situacao)">
                                                {{ rotuloSituacaoHistorico(item.situacao) }}
                                            </span>
                                        </div>
                                        <dl class="remessa-ano__numeros">
                                            <div>
                                                <dt>Receita líquida</dt>
                                                <dd>{{ formatarReais(item.receitaLiquida) }}</dd>
                                            </div>
                                            <div>
                                                <dt>Despesa fixada</dt>
                                                <dd>{{ formatarReais(item.despesaFixada) }}</dd>
                                            </div>
                                            <div>
                                                <dt>Resultado</dt>
                                                <dd :class="classeValor(item.situacao)">{{ formatarReais(item.resultado, true) }}</dd>
                                            </div>
                                        </dl>
                                        <div class="remessa-ano__acoes">
                                            <button
                                                class="btn pol-btn--ghost"
                                                type="button"
                                                :disabled="item.id == null || consultando"
                                                @click="verContas(item)"
                                            >
                                                Ver contas
                                            </button>
                                            <button
                                                v-if="podeExcluir"
                                                class="remessa-excluir"
                                                type="button"
                                                :disabled="item.id == null || excluindo"
                                                :aria-label="`Excluir exercício ${item.anoTexto}`"
                                                @click="pedirExclusao(item)"
                                            >
                                                <RiDeleteBinLine />
                                                Excluir
                                            </button>
                                        </div>
                                    </article>
                                </li>
                            </ol>
                            <p v-else class="text-muted mb-0">Nenhum exercício deste município para esta busca.</p>
                        </template>
                    </div>
                </div>
            </section>
        </div>

        <Teleport to="body">
            <div v-if="pendente" class="remessa-modal" role="presentation">
                <div class="remessa-modal__backdrop" aria-hidden="true" @click="fecharConfirmacao" />
                <div
                    class="remessa-modal__wrap"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="remessa-excluir-titulo"
                    tabindex="-1"
                    @click.self="fecharConfirmacao"
                >
                    <div class="remessa-modal__panel" @click.stop>
                        <button class="remessa-modal__fechar" type="button" aria-label="Fechar" :disabled="excluindo" @click="fecharConfirmacao">
                            <RiCloseLine />
                        </button>
                        <h2 id="remessa-excluir-titulo" class="remessa-modal__titulo">Excluir exercício</h2>
                        <p class="remessa-modal__texto">Tem certeza que deseja excluir este exercício? A previsão deixa de usar esse ano.</p>
                        <p class="remessa-modal__nome">
                            <strong>{{ pendente.anoTexto }} · {{ aberto?.titulo || "—" }}</strong>
                        </p>
                        <div class="remessa-modal__acoes">
                            <button class="remessa-modal__btn remessa-modal__btn--outline" type="button" :disabled="excluindo" @click="fecharConfirmacao">
                                Cancelar
                            </button>
                            <button class="remessa-modal__btn remessa-modal__btn--danger" type="button" :disabled="excluindo" @click="confirmarExclusao">
                                <span v-if="excluindo" class="remessa-modal__spinner" role="status" aria-hidden="true" />
                                {{ excluindo ? "Excluindo…" : "Excluir" }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </article>
</template>

<style scoped>
.remessa-contagem {
    margin: 0 0 0.85rem;
    color: #5d6e8f;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.remessa-munis {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.85rem;
}

.remessa-muni {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    min-height: 196px;
    padding: 1.05rem 1.1rem 0.95rem;
    border: 1px solid rgba(22, 37, 78, 0.08);
    border-radius: 18px;
    background: #fff;
    color: #1a2d4e;
    text-align: left;
}

.remessa-muni:hover {
    border-color: rgba(45, 160, 168, 0.55);
}

.remessa-muni:focus-visible,
.remessa-voltar:focus-visible {
    outline: 2px solid #2da0a8;
    outline-offset: 3px;
}

.remessa-muni__topo {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.remessa-muni__pin {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 12px;
    background: rgba(45, 160, 168, 0.14);
    color: #1a6b72;
    font-size: 1.15rem;
}

.remessa-muni__topo strong,
.remessa-cabeca h2 {
    display: block;
    font-size: 1.12rem;
    line-height: 1.25;
}

.remessa-muni__topo small {
    display: block;
    margin-top: 0.15rem;
    color: #5d6e8f;
    font-size: 0.78rem;
}

.remessa-muni__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.remessa-muni__meta em {
    font-style: normal;
    font-size: 0.78rem;
    font-weight: 700;
    color: #40528b;
    background: rgba(92, 107, 192, 0.1);
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
}

.remessa-muni__anos {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: auto;
}

.remessa-muni__anos span {
    min-width: 3.1rem;
    padding: 0.18rem 0.4rem;
    border-radius: 8px;
    background: #f4f7fb;
    color: #1a2d4e;
    font-size: 0.78rem;
    font-weight: 700;
    text-align: center;
}

.remessa-muni__mais {
    color: #1a6b72 !important;
    background: rgba(45, 160, 168, 0.14) !important;
}

.remessa-muni__abrir {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: #1a6b72;
    font-size: 0.84rem;
    font-weight: 700;
}

.remessa-vazio {
    padding: 2.5rem 1rem;
    text-align: center;
    color: #5d6e8f;
}

.remessa-voltar {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 1rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: #40528b;
    font-weight: 700;
}

.remessa-cabeca {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1.4rem;
}

.remessa-anos {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
}

.remessa-ano {
    display: grid;
    grid-template-columns: 4.6rem 1fr;
    gap: 0.85rem;
}

.remessa-ano__marca {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.remessa-ano__marca span {
    display: grid;
    place-items: center;
    width: 4.2rem;
    height: 4.2rem;
    border-radius: 16px;
    background: #1f2e54;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 800;
}

.remessa-ano__marca::after {
    content: "";
    width: 2px;
    flex: 1;
    min-height: 1rem;
    background: rgba(45, 160, 168, 0.35);
}

.remessa-ano:last-child .remessa-ano__marca::after {
    display: none;
}

.remessa-ano__corpo {
    margin-bottom: 0.9rem;
    padding: 0.95rem 1rem;
    border: 1px solid rgba(22, 37, 78, 0.08);
    border-radius: 16px;
    background: #fff;
}

.remessa-ano--deficit .remessa-ano__corpo {
    background: #fff6f6;
}

.remessa-ano--superavit .remessa-ano__corpo {
    background: #f4f7ff;
}

.remessa-ano--equilibrado .remessa-ano__corpo {
    background: #f3faf6;
}

.remessa-ano__topo {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: flex-start;
}

.remessa-ano__tipo {
    margin: 0;
    font-weight: 800;
    color: #1a2d4e;
}

.remessa-ano__quando {
    margin: 0.15rem 0 0;
    color: #5d6e8f;
    font-size: 0.8rem;
}

.remessa-ano__numeros {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin: 0.9rem 0 0;
}

.remessa-ano__numeros dt {
    color: #5d6e8f;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.remessa-ano__numeros dd {
    margin: 0.15rem 0 0;
    color: #1a2d4e;
    font-weight: 800;
}

.remessa-selo--superavit {
    background: rgba(30, 79, 168, 0.12);
    color: #1e4fa8;
}

.remessa-valor--deficit {
    color: #9e2b2b !important;
}

.remessa-valor--superavit {
    color: #1e4fa8 !important;
}

.remessa-valor--equilibrado {
    color: #1d6d3f !important;
}

@media (max-width: 640px) {
    .remessa-ano {
        grid-template-columns: 1fr;
    }

    .remessa-ano__marca {
        flex-direction: row;
        justify-content: flex-start;
        gap: 0.65rem;
    }

    .remessa-ano__marca::after {
        display: none;
    }

    .remessa-ano__numeros {
        grid-template-columns: 1fr;
    }

    .remessa-modal__acoes {
        flex-direction: column-reverse;
    }

    .remessa-modal__btn {
        width: 100%;
    }
}

.remessa-ano__acoes {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.95rem;
}

.remessa-excluir {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid rgba(196, 80, 80, 0.45);
    border-radius: 10px;
    background: rgba(196, 80, 80, 0.06);
    color: #a32d2d;
    padding: 0.45rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 700;
}

.remessa-excluir:disabled {
    opacity: 0.65;
}

.remessa-abas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.remessa-abas button {
    border: 1px solid rgba(92, 107, 192, 0.2);
    background: #fff;
    color: #40528b;
    border-radius: 999px;
    padding: 0.35rem 0.8rem;
    font-size: 0.82rem;
    font-weight: 700;
}

.remessa-abas button.is-on {
    background: #1f2e54;
    color: #fff;
    border-color: #1f2e54;
}

.remessa-modal {
    position: fixed;
    inset: 0;
    z-index: 4000;
}

.remessa-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(22, 37, 78, 0.45);
    backdrop-filter: blur(4px);
}

.remessa-modal__wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
}

.remessa-modal__panel {
    position: relative;
    width: 100%;
    max-width: 420px;
    padding: 1.75rem 1.75rem 1.5rem;
    background: #fff;
    border: 1px solid rgba(20, 30, 40, 0.08);
    border-radius: 18px;
}

.remessa-modal__fechar {
    position: absolute;
    top: 0.85rem;
    right: 0.85rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: none;
    border-radius: 10px;
    background: rgba(92, 107, 192, 0.08);
    color: #4a5b78;
}

.remessa-modal__fechar:disabled {
    opacity: 0.5;
}

.remessa-modal__titulo {
    margin: 0 2.25rem 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #16254e;
}

.remessa-modal__texto {
    margin: 0 0 0.5rem;
    font-size: 0.938rem;
    color: #4a5b78;
}

.remessa-modal__nome {
    margin: 0 0 1.25rem;
    font-size: 0.938rem;
    color: #304867;
    overflow-wrap: anywhere;
}

.remessa-modal__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    justify-content: flex-end;
}

.remessa-modal__btn {
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 700;
}

.remessa-modal__btn:disabled {
    opacity: 0.65;
}

.remessa-modal__btn--outline {
    border: 2px solid #5c6bc0;
    background: transparent;
    color: #5c6bc0;
}

.remessa-modal__btn--danger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: none;
    background: linear-gradient(90deg, #c45050 0%, #a32d2d 100%);
    color: #fff;
}

.remessa-modal__spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: remessa-spin 0.65s linear infinite;
}

@keyframes remessa-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
