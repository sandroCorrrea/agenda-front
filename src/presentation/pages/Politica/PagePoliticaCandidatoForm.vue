<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { RiArrowLeftLine, RiSave3Line, RiUserStarLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaCandidatoCartao from "@/presentation/components/Politica/PoliticaCandidatoCartao.vue";
import type { CandidatoSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import type { BensCandidato, CandidatoColigacao, CandidatoComplementar, CandidatoStatus, HistoricoCandidatura, MotivoCandidato, RedeCandidato } from "@/domain/politica/tipos";
import { useCandidatosAdmin, useOpcoesCandidato } from "@/presentation/composables/Politica/useCandidatosAdmin";
import { classeStatusPolitica, formatarDataHoraCurta, formatarTetoGasto, rotuloDe, rotuloMarcacao, STATUS_CANDIDATO } from "@/shared/utils/politicaLabels";
import { resolvePublicAssetUrl } from "@/shared/utils/mediaUrl";
import { dataHistorico } from "@/shared/utils/historicoCandidatura";
import { enderecoHttp, rotuloRede } from "@/shared/utils/redeSocialCandidato";
import "@/presentation/assets/styles/politica-admin.css";

const route = useRoute();
const router = useRouter();
const editando = route.name === "AdministradorPoliticaCandidatoEditar";
const id = editando ? Number(route.params.id) : 0;
const { erro, sucesso, campos, salvando, buscarPorId, salvar } = useCandidatosAdmin();
const { eleicoes, cargos, partidos, municipios, erroOpcoes, carregarOpcoes } = useOpcoesCandidato();
const busca = ref("");

const form = reactive({
    eleicao_id: "",
    cargo_id: "",
    partido_id: "",
    ibge: "",
    uf: "",
    tse_id: "",
    numero: "",
    nome: "",
    nome_urna: "",
    foto_url: "",
    status: "ativo" as CandidatoStatus,
    nome_social: "",
    genero: "",
    grau_instrucao: "",
    ocupacao: "",
    cor_raca: "",
    agremiacao: ""
});

const complementar = ref<CandidatoComplementar | null>(null);
const bens = ref<BensCandidato | null>(null);
const coligacao = ref<CandidatoColigacao | null>(null);
const tituloColigacao = computed(() => coligacao.value?.nome || coligacao.value?.composicao || "Coligação");
const linhasColigacao = computed(() => {
    const item = coligacao.value;
    if (!item) return [];
    const linhas: [string, string | null][] = [
        ["Tipo de agremiação", item.tipoAgremiacao],
        ["Composição", item.nome ? item.composicao : null],
        ["Federação", item.nomeFederacao],
        ["Sigla da federação", item.siglaFederacao],
        ["Composição da federação", item.composicaoFederacao],
        ["Situação da legenda", item.situacao],
        ["Destino dos votos de legenda", item.destinacaoVotos],
        ["Unidade eleitoral", item.unidadeEleitoral],
        ["Turno", item.turno]
    ];
    return linhas.flatMap(([rotulo, valor]) => (valor ? [{ rotulo, valor }] : []));
});
const linhasComplementar = computed(() => {
    const item = complementar.value;
    if (!item) return [];
    const etnia = item.etniaIndigena && !["NÃO INFORMADA", "NAO INFORMADA"].includes(item.etniaIndigena.toUpperCase())
        ? item.etniaIndigena
        : null;
    const linhas: [string, string | null][] = [
        ["Nacionalidade", item.nacionalidade],
        ["Município de nascimento", item.municipioNascimento],
        ["Idade na posse", item.idadePosse],
        ["Quilombola", rotuloMarcacao(item.quilombola)],
        ["Etnia indígena", etnia],
        ["Teto de gasto da campanha", formatarTetoGasto(item.despesaMaxCampanha)],
        ["Reeleição", rotuloMarcacao(item.reeleicao)],
        ["Declarou bens", rotuloMarcacao(item.declararBens)],
        ["Número do processo", item.numeroProcesso],
        ["Inserido na urna", rotuloMarcacao(item.inseridoUrna)],
        ["Destinação dos votos", item.destinacaoVotos],
        ["Situação do julgamento", item.situacaoJulgamento],
        ["Situação no pleito", item.situacaoJulgamentoPleito],
        ["Situação na urna", item.situacaoJulgamentoUrna],
        ["Situação na totalização", item.situacaoTot],
        ["Prestou contas", rotuloMarcacao(item.prestouContas)],
        ["Substituído", rotuloMarcacao(item.substituido)],
        ["Sequencial substituído", item.sqSubstituido],
        ["Aceite da candidatura", formatarDataHoraCurta(item.aceiteCandidatura)],
        ["Gênero no FEFC", item.generoFefc],
        ["Cor/raça no FEFC", item.corRacaFefc]
    ];
    return linhas.flatMap(([rotulo, valor]) => (valor ? [{ rotulo, valor }] : []));
});
const fichaArquivo = reactive({
    federacao: "",
    coligacao: "",
    situacao: "",
    unidadeEleitoral: ""
});
const fotoPreview = computed(() => resolvePublicAssetUrl(form.foto_url));
const detalheCartao = computed(() =>
    [form.genero, form.grau_instrucao, form.ocupacao, form.cor_raca].map((item) => item.trim()).filter(Boolean).join(" · ")
);
const cargoNome = computed(() => cargos.value.find((item) => String(item.id) === String(form.cargo_id))?.nome ?? "");
const quantidadeVagas = ref<number | null>(null);
const motivos = ref<MotivoCandidato[] | null>(null);
const redes = ref<RedeCandidato[] | null>(null);
const historico = ref<HistoricoCandidatura[] | null>(null);
const cargoVagas = ref("");
const textoVagas = computed(() => {
    if (quantidadeVagas.value === null || String(form.cargo_id) !== cargoVagas.value) return "";
    return quantidadeVagas.value === 1 ? "1 vaga para este cargo." : `${quantidadeVagas.value} vagas para este cargo.`;
});
const partidoSigla = computed(() => partidos.value.find((item) => String(item.id) === String(form.partido_id))?.sigla ?? "");

const cidades = computed(() => {
    const q = busca.value.trim().toLowerCase();
    return municipios.value
        .filter((item) => !q || item.nome.toLowerCase().includes(q) || item.ibge.includes(q))
        .slice(0, 30);
});

function aoEscolherCidade() {
    const cidade = municipios.value.find((item) => item.ibge === form.ibge);
    form.uf = cidade?.uf ?? "";
}

onMounted(async () => {
    await carregarOpcoes();
    if (!editando) return;
    const candidato = await buscarPorId(id);
    form.eleicao_id = String(candidato.eleicaoId);
    form.cargo_id = String(candidato.cargoId);
    quantidadeVagas.value = candidato.quantidadeVagas;
    cargoVagas.value = String(candidato.cargoId);
    form.partido_id = candidato.partidoId ? String(candidato.partidoId) : "";
    form.ibge = candidato.ibge ?? "";
    form.uf = candidato.uf ?? "";
    form.tse_id = candidato.tseId ?? "";
    form.numero = candidato.numero;
    form.nome = candidato.nome;
    form.nome_urna = candidato.nomeUrna;
    form.foto_url = candidato.fotoUrl ?? "";
    form.status = candidato.status as CandidatoStatus;
    form.nome_social = candidato.ficha?.nomeSocial ?? "";
    form.genero = candidato.ficha?.genero ?? "";
    form.grau_instrucao = candidato.ficha?.grauInstrucao ?? "";
    form.ocupacao = candidato.ficha?.ocupacao ?? "";
    form.cor_raca = candidato.ficha?.corRaca ?? "";
    form.agremiacao = candidato.ficha?.agremiacao ?? "";
    fichaArquivo.federacao = candidato.ficha?.federacao ?? "";
    fichaArquivo.coligacao = candidato.ficha?.coligacao ?? "";
    fichaArquivo.situacao = candidato.ficha?.situacao ?? "";
    fichaArquivo.unidadeEleitoral = candidato.ficha?.unidadeEleitoral ?? "";
    complementar.value = candidato.complementar;
    bens.value = candidato.bens;
    coligacao.value = candidato.coligacao;
    motivos.value = candidato.motivos;
    redes.value = candidato.redes;
    historico.value = candidato.historico;
});

function linhaHistorico(item: HistoricoCandidatura): string {
    const turnoNumero = Number(item.turno);
    const turno = item.turno && Number.isFinite(turnoNumero) && turnoNumero > 1 ? `turno ${item.turno}` : "";
    return [item.ano, turno, item.cargo, item.unidade, item.uf, item.partidoSigla, item.resultado].filter(Boolean).join(" · ");
}

function detalheHistorico(item: HistoricoCandidatura): string {
    return item.situacaoJulgamento || item.situacaoCandidatura || "";
}

function resumoHistorico(item: HistoricoCandidatura): string {
    const linha = linhaHistorico(item);
    const prefixo = item.ano ? `${item.ano} · ` : "";
    const texto = prefixo && linha.startsWith(prefixo) ? linha.slice(prefixo.length) : linha;
    return texto || "Candidatura";
}

async function aoSalvar() {
    const dto: CandidatoSalvarDTO = {
        eleicao_id: Number(form.eleicao_id),
        cargo_id: Number(form.cargo_id),
        partido_id: form.partido_id ? Number(form.partido_id) : null,
        ibge: form.ibge || null,
        uf: form.uf || null,
        tse_id: form.tse_id.trim() || null,
        numero: form.numero.trim(),
        nome: form.nome.trim(),
        nome_urna: form.nome_urna.trim(),
        foto_url: form.foto_url.trim() || null,
        status: form.status,
        nome_social: form.nome_social.trim() || null,
        genero: form.genero.trim() || null,
        grau_instrucao: form.grau_instrucao.trim() || null,
        ocupacao: form.ocupacao.trim() || null,
        cor_raca: form.cor_raca.trim() || null,
        agremiacao: form.agremiacao.trim() || null
    };
    try {
        await salvar(dto, editando ? id : undefined);
        await router.push({ name: "AdministradorPoliticaCandidatos" });
    } catch {
        return;
    }
}
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <RouterLink :to="{ name: 'AdministradorPoliticaCandidatos' }" class="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none fw-bold">
                <RiArrowLeftLine /> Voltar para candidatos
            </RouterLink>
            <AdminPageHero
                :title="editando ? 'Editar candidato' : 'Novo candidato'"
                subtitle="Um candidato por vez. O arquivo consulta_cand, com várias candidaturas, entra na eleição."
            >
                <template #icon><RiUserStarLine /></template>
                <template #actions>
                    <button class="btn" type="submit" form="pol-cand-form" :disabled="salvando">
                        <RiSave3Line class="me-1" /> Salvar
                    </button>
                </template>
            </AdminPageHero>
            <div v-if="erro || erroOpcoes" class="pol-alert pol-alert--erro mb-3">{{ erro || erroOpcoes }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>

            <section class="pol-perfil">
                <img v-if="fotoPreview" class="pol-perfil__foto" :src="fotoPreview" alt="" />
                <span v-else class="pol-perfil__marca">{{ form.numero || "—" }}</span>
                <div class="pol-perfil__corpo">
                    <div class="pol-perfil__linha">
                        <h2>{{ form.nome_urna || "Nome de urna" }}</h2>
                        <span :class="classeStatusPolitica(form.status)">{{ rotuloDe(STATUS_CANDIDATO, form.status) }}</span>
                    </div>
                    <p>{{ form.nome || "Nome completo" }}</p>
                    <small>{{ [partidoSigla, cargoNome, form.uf].filter(Boolean).join(" · ") || "Partido, cargo e UF" }}</small>
                    <small v-if="textoVagas">{{ textoVagas }}</small>
                </div>
            </section>

            <form id="pol-cand-form" class="pol-ficha-layout" @submit.prevent="aoSalvar">
                <div class="pol-ficha-layout__main">
                    <section class="card border-0 shadow-sm pol-panel">
                        <div class="card-body row g-3">
                            <div class="col-12">
                                <h2 class="h6 mb-0">Candidatura</h2>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Eleição</label>
                                <select v-model="form.eleicao_id" class="form-select" :class="{ 'is-invalid': campos.eleicao_id }">
                                    <option value="">Selecione</option>
                                    <option v-for="item in eleicoes" :key="item.id" :value="item.id">{{ item.ano }} · {{ item.nome }}</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Cargo</label>
                                <select v-model="form.cargo_id" class="form-select" :class="{ 'is-invalid': campos.cargo_id }">
                                    <option value="">Selecione</option>
                                    <option v-for="item in cargos" :key="item.id" :value="item.id">{{ item.nome }}</option>
                                </select>
                                <p v-if="textoVagas" class="small text-muted mb-0 mt-1">{{ textoVagas }}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Partido</label>
                                <select v-model="form.partido_id" class="form-select">
                                    <option value="">Sem partido</option>
                                    <option v-for="item in partidos" :key="item.id" :value="item.id">{{ item.numero }} · {{ item.sigla }}</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Status</label>
                                <select v-model="form.status" class="form-select">
                                    <option v-for="item in STATUS_CANDIDATO" :key="item.value" :value="item.value">{{ item.label }}</option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Município (IBGE)</label>
                                <input v-model="busca" class="form-control mb-2" type="search" placeholder="Buscar cidade já cadastrada" />
                                <select v-model="form.ibge" class="form-select" @change="aoEscolherCidade">
                                    <option value="">Sem município</option>
                                    <option v-for="item in cidades" :key="item.ibge" :value="item.ibge">
                                        {{ item.nome }}{{ item.uf ? `/${item.uf}` : "" }} · {{ item.ibge }}
                                    </option>
                                </select>
                                <small class="text-muted">UF: {{ form.uf || "—" }}</small>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Número</label>
                                <input v-model="form.numero" class="form-control" maxlength="10" :class="{ 'is-invalid': campos.numero }" />
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Nome de urna</label>
                                <input v-model="form.nome_urna" class="form-control" maxlength="120" :class="{ 'is-invalid': campos.nome_urna }" />
                            </div>
                            <div class="col-md-5">
                                <label class="form-label">Nome completo</label>
                                <input v-model="form.nome" class="form-control" maxlength="180" :class="{ 'is-invalid': campos.nome }" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">ID no TSE</label>
                                <input v-model="form.tse_id" class="form-control" maxlength="40" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">URL da foto</label>
                                <input v-model="form.foto_url" class="form-control" maxlength="500" />
                                <small class="text-muted">Deixe vazio para apagar a foto ao salvar.</small>
                            </div>
                        </div>
                    </section>

                    <section class="card border-0 shadow-sm pol-panel">
                        <div class="card-body row g-3">
                            <div class="col-12">
                                <h2 class="h6 mb-1">Ficha da consulta de candidatos</h2>
                                <p class="small text-muted mb-0">Os mesmos campos públicos do arquivo do TSE. CPF, e-mail, título e nascimento não entram aqui.</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Nome social</label>
                                <input v-model="form.nome_social" class="form-control" maxlength="120" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Gênero</label>
                                <input v-model="form.genero" class="form-control" maxlength="40" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Grau de instrução</label>
                                <input v-model="form.grau_instrucao" class="form-control" maxlength="80" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Ocupação</label>
                                <input v-model="form.ocupacao" class="form-control" maxlength="160" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Cor ou raça</label>
                                <input v-model="form.cor_raca" class="form-control" maxlength="40" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Agremiação</label>
                                <input v-model="form.agremiacao" class="form-control" maxlength="80" placeholder="Partido isolado, federação ou coligação" />
                            </div>
                            <div class="col-12 text-end">
                                <button class="btn pol-btn" type="submit" :disabled="salvando"><RiSave3Line class="me-1" /> Salvar</button>
                            </div>
                        </div>
                    </section>
                </div>

                <aside class="pol-ficha-layout__lado">
                    <div class="card border-0 shadow-sm pol-panel">
                        <div class="card-body">
                            <h2 class="h6">Como aparece na pesquisa</h2>
                            <PoliticaCandidatoCartao
                                :numero="form.numero"
                                :nome-urna="form.nome_urna"
                                :nome="form.nome"
                                :partido="partidoSigla"
                                :cargo="cargoNome"
                                :uf="form.uf"
                                :detalhe="detalheCartao"
                            />
                            <ul v-if="form.agremiacao || fichaArquivo.federacao || fichaArquivo.coligacao || fichaArquivo.situacao || fichaArquivo.unidadeEleitoral" class="list-unstyled small text-muted mt-3 mb-0">
                                <li v-if="form.agremiacao">Agremiação: {{ form.agremiacao }}</li>
                                <li v-if="fichaArquivo.federacao">Federação: {{ fichaArquivo.federacao }}</li>
                                <li v-if="fichaArquivo.coligacao">Coligação: {{ fichaArquivo.coligacao }}</li>
                                <li v-if="fichaArquivo.situacao">Situação: {{ fichaArquivo.situacao }}</li>
                                <li v-if="fichaArquivo.unidadeEleitoral">Unidade eleitoral: {{ fichaArquivo.unidadeEleitoral }}</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>

            <section v-if="linhasComplementar.length" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h6">Informações complementares</h2>
                    <p class="small text-muted">Dados do consulta_cand_complementar. O teto de gasto é o limite declarado para o cargo. A idade é a da posse. Gênero e cor no FEFC não substituem a ficha.</p>
                    <dl class="pol-fato-grade">
                        <div v-for="linha in linhasComplementar" :key="linha.rotulo" class="pol-fato">
                            <dt>{{ linha.rotulo }}</dt>
                            <dd>{{ linha.valor }}</dd>
                        </div>
                    </dl>
                </div>
            </section>

            <section v-if="bens" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h6">Bens declarados</h2>
                    <p class="small text-muted">
                        {{ bens.quantidade }} {{ bens.quantidade === 1 ? "bem" : "bens" }}
                        · total declarado {{ formatarTetoGasto(bens.valorTotal) }}.
                        Este valor é o dos bens, não o teto de gasto da campanha.
                    </p>
                    <p v-if="bens.itens.length === 0" class="text-muted mb-0">Nenhum item informado.</p>
                    <ul v-else class="pol-bem-lista">
                        <li v-for="item in bens.itens" :key="item.ordem" class="pol-bem-linha">
                            <span class="pol-bem-linha__ordem">{{ item.ordem }}</span>
                            <div class="pol-bem-linha__corpo">
                                <strong>{{ item.tipo || "Bem" }}</strong>
                                <small v-if="item.codigoTipo">Código {{ item.codigoTipo }}</small>
                                <p>{{ item.descricao || "—" }}</p>
                            </div>
                            <div class="pol-bem-linha__valor">
                                <strong>{{ formatarTetoGasto(item.valor) || "—" }}</strong>
                                <small>{{ item.atualizadoEm || "—" }}</small>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            <section v-if="coligacao" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h6">{{ tituloColigacao }}</h2>
                    <p class="small text-muted">Legenda do consulta_coligacao. A situação da legenda não altera o status do candidato. O destino dos votos aqui é o da legenda, não o do complementar.</p>
                    <dl v-if="linhasColigacao.length" class="pol-fato-grade">
                        <div v-for="linha in linhasColigacao" :key="linha.rotulo" class="pol-fato">
                            <dt>{{ linha.rotulo }}</dt>
                            <dd>{{ linha.valor }}</dd>
                        </div>
                    </dl>
                </div>
            </section>

            <section v-if="motivos?.length" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h6">Motivos</h2>
                    <p class="small text-muted">Fundamentos ligados ao sequencial deste candidato. A lista não altera o status.</p>
                    <ul class="pol-rede-grade">
                        <li v-for="(motivo, indice) in motivos" :key="indice" class="pol-rede">
                            <strong>{{ motivo.descricao || "—" }}</strong>
                            <small v-if="motivo.tipo">{{ motivo.tipo }}</small>
                            <small v-if="motivo.processo">Processo {{ motivo.processo }}</small>
                        </li>
                    </ul>
                </div>
            </section>

            <section v-if="redes?.length" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h6">Redes sociais</h2>
                    <p class="small text-muted">Textos declarados pelo candidato, na ordem do arquivo. Um texto sem http não vira link.</p>
                    <ul class="pol-rede-grade">
                        <li v-for="(rede, indice) in redes" :key="`${rede.ordem}-${indice}`" class="pol-rede">
                            <small v-if="rotuloRede(rede.rede)">{{ rotuloRede(rede.rede) }}</small>
                            <a v-if="enderecoHttp(rede.url)" :href="enderecoHttp(rede.url)!" target="_blank" rel="noopener noreferrer">{{ rede.url }}</a>
                            <span v-else>{{ rede.url }}</span>
                        </li>
                    </ul>
                </div>
            </section>

            <section v-if="historico?.length" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h6">Candidaturas anteriores</h2>
                    <p class="small text-muted">Cada linha é uma eleição passada, com o partido daquela época. O partido e o número atuais não mudam. “2º turno” no resultado indica que a disputa foi para o segundo turno; o turno seguinte é outra linha.</p>
                    <ol class="pol-hist">
                        <li v-for="(item, indice) in historico" :key="indice">
                            <span>{{ item.ano || "—" }}</span>
                            <div>
                                <strong>{{ resumoHistorico(item) }}</strong>
                                <small v-if="detalheHistorico(item) || dataHistorico(item.data)">
                                    {{ [detalheHistorico(item), dataHistorico(item.data)].filter(Boolean).join(" · ") }}
                                </small>
                            </div>
                        </li>
                    </ol>
                </div>
            </section>
        </div>
    </article>
</template>
