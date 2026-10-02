<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { RiAddLine, RiDeleteBinLine, RiPencilLine, RiSearchLine, RiUserStarLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaPaginacao from "@/presentation/components/Politica/PoliticaPaginacao.vue";
import type { Candidato } from "@/domain/politica/tipos";
import { useCandidatosAdmin, useOpcoesCandidato } from "@/presentation/composables/Politica/useCandidatosAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { classeStatusPolitica, formatarTetoGasto, rotuloDe, rotuloMarcacao, STATUS_CANDIDATO } from "@/shared/utils/politicaLabels";
import { resolvePublicAssetUrl } from "@/shared/utils/mediaUrl";
import "@/presentation/assets/styles/politica-admin.css";

const { podeInserir, podeAtualizar, podeExcluir } = usePermissaoMenu("admin.politica_candidatos");
const {
    itens, carregando, excluindoId, erro, sucesso, q, eleicaoId, cargoId, partidoId, status,
    pagina, total, totalPaginas, carregar, remover
} = useCandidatosAdmin();
const { eleicoes, cargos, partidos, erroOpcoes, carregarOpcoes } = useOpcoesCandidato();
const confirmarId = ref<number | null>(null);
const fotosQueFalharam = ref<number[]>([]);

function fotoCandidato(item: Candidato): string | null {
    if (fotosQueFalharam.value.includes(item.id)) return null;
    return resolvePublicAssetUrl(item.fotoUrl);
}

function marcarFotoFalhou(id: number): void {
    if (!fotosQueFalharam.value.includes(id)) {
        fotosQueFalharam.value = [...fotosQueFalharam.value, id];
    }
}

function linhaCandidato(item: Candidato): string {
    const cargo = item.cargoNome || (item.cargoId ? String(item.cargoId) : "");
    const vagas = item.quantidadeVagas;
    const vaga = vagas === null ? "" : vagas === 1 ? "1 vaga" : `${vagas} vagas`;
    const lugar = [item.ibge, item.uf].filter(Boolean).join("/");
    return [item.partidoSigla, cargo, vaga, lugar].filter(Boolean).join(" · ");
}

function fatosCandidato(item: Candidato): { rotulo: string; valor: string }[] {
    const lista: { rotulo: string; valor: string }[] = [];
    if (item.complementar) {
        const urna = item.complementar.inseridoUrna ? `Urna ${rotuloMarcacao(item.complementar.inseridoUrna)}` : "";
        const valor = [item.complementar.situacaoJulgamento, urna].filter(Boolean).join(" · ");
        if (valor) lista.push({ rotulo: "Julgamento", valor });
    }
    if (item.bens) {
        lista.push({
            rotulo: "Bens",
            valor: `${item.bens.quantidade} · ${formatarTetoGasto(item.bens.valorTotal)}`
        });
    } else {
        lista.push({ rotulo: "Bens", valor: "Não informado" });
    }
    if (item.coligacao) {
        const valor = [item.coligacao.tipoAgremiacao, item.coligacao.nome || item.coligacao.composicao].filter(Boolean).join(" · ");
        if (valor) lista.push({ rotulo: "Legenda", valor });
    }
    if (item.motivos?.length) {
        const primeiroMotivo = item.motivos[0];
        const primeiro = primeiroMotivo?.descricao || primeiroMotivo?.tipo || "—";
        const extra = item.motivos.length > 1 ? ` e mais ${item.motivos.length - 1}` : "";
        lista.push({ rotulo: "Motivos", valor: `${primeiro}${extra}` });
    }
    if (item.redes?.length) {
        lista.push({ rotulo: "Redes", valor: item.redes.length === 1 ? "1 rede" : `${item.redes.length} redes` });
    }
    if (item.historico?.length) {
        lista.push({
            rotulo: "Histórico",
            valor: item.historico.length === 1 ? "1 candidatura anterior" : `${item.historico.length} candidaturas anteriores`
        });
    }
    return lista;
}

onMounted(() => {
    void carregar(1);
    void carregarOpcoes();
});
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero title="Candidatos" subtitle="O município vem do cadastro de IBGE. Não criamos cidade nova nesta tela.">
                <template #icon><RiUserStarLine /></template>
                <template #actions>
                    <RouterLink v-if="podeInserir" class="btn" :to="{ name: 'AdministradorPoliticaCandidatoCadastro' }">
                        <RiAddLine class="me-1" /> Novo candidato
                    </RouterLink>
                </template>
            </AdminPageHero>
            <div v-if="erro || erroOpcoes" class="pol-alert pol-alert--erro mb-3">{{ erro || erroOpcoes }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>
            <form class="card border-0 shadow-sm pol-panel mb-3" @submit.prevent="carregar(1)">
                <div class="card-body row g-2">
                    <div class="col-md-4 pol-search">
                        <RiSearchLine />
                        <input v-model="q" class="form-control" type="search" placeholder="Nome ou urna" />
                    </div>
                    <div class="col-md-2">
                        <select v-model="eleicaoId" class="form-select">
                            <option value="">Eleição</option>
                            <option v-for="item in eleicoes" :key="item.id" :value="item.id">{{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="cargoId" class="form-select">
                            <option value="">Cargo</option>
                            <option v-for="item in cargos" :key="item.id" :value="item.id">{{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="partidoId" class="form-select">
                            <option value="">Partido</option>
                            <option v-for="item in partidos" :key="item.id" :value="item.id">{{ item.sigla }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="status" class="form-select">
                            <option value="">Status</option>
                            <option v-for="item in STATUS_CANDIDATO" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-12 text-end"><button class="btn pol-btn" type="submit">Filtrar</button></div>
                </div>
            </form>
            <section>
                <p v-if="carregando" class="text-muted">Carregando candidatos…</p>
                <p v-else-if="itens.length === 0" class="card border-0 shadow-sm pol-panel text-center text-muted py-4 mb-0">Nenhum candidato encontrado.</p>
                <ul v-else class="pol-cand-grade">
                    <li v-for="item in itens" :key="item.id" class="pol-cand">
                        <div class="pol-cand__topo">
                            <img
                                v-if="fotoCandidato(item)"
                                class="pol-cand__foto"
                                :src="fotoCandidato(item)!"
                                alt=""
                                @error="marcarFotoFalhou(item.id)"
                            />
                            <span v-else class="pol-urna-card__num">{{ item.numero || "—" }}</span>
                            <div class="pol-cand__ident">
                                <strong>{{ item.nomeUrna }}</strong>
                                <span>{{ item.nome }}</span>
                                <small>{{ linhaCandidato(item) || "Sem partido, cargo ou município" }}</small>
                            </div>
                            <div class="pol-cand__acoes">
                                <span :class="classeStatusPolitica(item.status)">{{ rotuloDe(STATUS_CANDIDATO, item.status) }}</span>
                                <RouterLink v-if="podeAtualizar" class="btn btn-sm pol-btn--ghost" :to="{ name: 'AdministradorPoliticaCandidatoEditar', params: { id: item.id } }" :aria-label="`Editar ${item.nomeUrna}`">
                                    <RiPencilLine />
                                </RouterLink>
                                <button v-if="podeExcluir" class="btn btn-sm pol-btn--danger" type="button" :aria-label="`Excluir ${item.nomeUrna}`" @click="confirmarId = item.id"><RiDeleteBinLine /></button>
                            </div>
                        </div>
                        <dl class="pol-cand__fatos">
                            <div v-for="fato in fatosCandidato(item)" :key="fato.rotulo">
                                <dt>{{ fato.rotulo }}</dt>
                                <dd>{{ fato.valor }}</dd>
                            </div>
                        </dl>
                    </li>
                </ul>
                <PoliticaPaginacao :pagina="pagina" :total-paginas="totalPaginas" :total="total" @ir="carregar" />
            </section>
        </div>
        <div v-if="confirmarId !== null" class="pol-modal">
            <div class="pol-modal__backdrop" @click="confirmarId = null" />
            <div class="pol-modal__panel">
                <h2 class="h5">Excluir candidato</h2>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn pol-btn--ghost" type="button" @click="confirmarId = null">Cancelar</button>
                    <button class="btn pol-btn--danger" type="button" :disabled="excluindoId !== null" @click="remover(confirmarId!).finally(() => (confirmarId = null))">Excluir</button>
                </div>
            </div>
        </div>
    </article>
</template>
