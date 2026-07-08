<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiSave3Line,
    RiSpeakLine
} from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import ParticipacaoPublicoChips from "@/presentation/components/Participacao/ParticipacaoPublicoChips.vue";
import ParticipacaoStatusBadge from "@/presentation/components/Participacao/ParticipacaoStatusBadge.vue";
import { useParticipacaoAdmin } from "@/presentation/composables/Participacao/useParticipacaoAdmin";
import {
    labelDeOpcao,
    CATEGORIA_ECONOMICA_OPCOES,
    NATUREZA_DESPESA_OPCOES,
    STATUS_ANALISE_OPCOES
} from "@/shared/utils/participacaoLabels";

const route = useRoute();
const router = useRouter();

const {
    opcoes,
    detalhe,
    analiseForm,
    carregandoDetalhe,
    salvandoAnalise,
    erro,
    sucesso,
    carregarOpcoes,
    carregarDetalhe,
    salvarAnalise
} = useParticipacaoAdmin();

const id = computed(() => Number(route.params.id));

async function onSalvar() {
    try {
        await salvarAnalise(id.value);
    } catch {
        /* erro no estado */
    }
}

onMounted(async () => {
    await carregarOpcoes();
    if (!Number.isFinite(id.value) || id.value <= 0) {
        await router.replace({ name: "AdministradorParticipacao" });
        return;
    }
    try {
        await carregarDetalhe(id.value);
    } catch {
        return;
    }
});
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                :title="detalhe ? `Protocolo #${detalhe.id}` : 'Detalhe da contribuição'"
                subtitle="Consulta da proposta cidadã e registro da análise técnica interna (campo 9 — não visível ao cidadão)."
            >
                <template #icon><RiSpeakLine /></template>
                <template #actions>
                    <RouterLink :to="{ name: 'AdministradorParticipacao' }" class="btn">
                        <RiArrowLeftLine class="me-1" />
                        Voltar à lista
                    </RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

            <div v-if="carregandoDetalhe" class="text-muted">Carregando detalhe...</div>

            <template v-else-if="detalhe">
                <section class="card border-0 shadow-sm mb-3">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex flex-wrap justify-content-between gap-2 align-items-start mb-3">
                            <div>
                                <h2 class="admin-subtitle mb-1">Proposta do cidadão</h2>
                                <p class="text-muted mb-0 small">
                                    {{ detalhe.instrumento }} {{ detalhe.exercicio }}
                                    ·
                                    {{
                                        labelDeOpcao(
                                            opcoes?.localidadeAtendida,
                                            detalhe.localidadeAtendida
                                        )
                                    }}
                                </p>
                            </div>
                            <ParticipacaoStatusBadge :status="detalhe.status" />
                        </div>

                        <div class="row g-3 part-detail-grid">
                            <div class="col-md-6">
                                <p class="part-k">Participante</p>
                                <p class="part-v">{{ detalhe.nome || "Não informado" }}</p>
                            </div>
                            <div class="col-md-6">
                                <p class="part-k">Bairro / comunidade</p>
                                <p class="part-v">{{ detalhe.bairroComunidade }}</p>
                            </div>
                            <div class="col-md-4">
                                <p class="part-k">Faixa etária</p>
                                <p class="part-v">
                                    {{
                                        labelDeOpcao(opcoes?.faixaEtaria, detalhe.faixaEtaria)
                                    }}
                                </p>
                            </div>
                            <div class="col-md-4">
                                <p class="part-k">Sexo</p>
                                <p class="part-v">
                                    {{ labelDeOpcao(opcoes?.sexo, detalhe.sexo) }}
                                </p>
                            </div>
                            <div class="col-md-4">
                                <p class="part-k">Contato</p>
                                <p class="part-v">
                                    {{ detalhe.email || "—" }}
                                    <span v-if="detalhe.telefone" class="d-block small text-muted">
                                        {{ detalhe.telefone }}
                                    </span>
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="part-k">Área temática</p>
                                <p class="part-v">
                                    <template v-if="detalhe.funcao">
                                        {{ detalhe.funcao.codigo }} — {{ detalhe.funcao.nome }}
                                    </template>
                                    <template v-else>—</template>
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="part-k">Tipo da demanda</p>
                                <p class="part-v">
                                    {{
                                        labelDeOpcao(opcoes?.tipoDemanda, detalhe.tipoDemanda)
                                    }}
                                </p>
                            </div>
                            <div class="col-12">
                                <p class="part-k">Problema</p>
                                <p class="part-v part-v--block">{{ detalhe.problema }}</p>
                            </div>
                            <div class="col-12">
                                <p class="part-k">Solução</p>
                                <p class="part-v part-v--block">{{ detalhe.solucao }}</p>
                            </div>
                            <div class="col-12">
                                <p class="part-k">Benefícios</p>
                                <p class="part-v part-v--block">{{ detalhe.beneficios }}</p>
                            </div>
                            <div class="col-12 col-md-8">
                                <p class="part-k">Público beneficiado</p>
                                <div class="part-v part-v--chips">
                                    <ParticipacaoPublicoChips
                                        :values="detalhe.publicoBeneficiado"
                                        :opcoes="opcoes?.publicoBeneficiado"
                                    />
                                </div>
                            </div>
                            <div class="col-md-4">
                                <p class="part-k">Prioridade</p>
                                <p class="part-v">
                                    {{
                                        labelDeOpcao(opcoes?.prioridade, detalhe.prioridade)
                                    }}
                                </p>
                            </div>
                            <div class="col-md-4">
                                <p class="part-k">Abrangência</p>
                                <p class="part-v">
                                    {{
                                        labelDeOpcao(opcoes?.abrangencia, detalhe.abrangencia)
                                    }}
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="part-k">Deseja info da audiência?</p>
                                <p class="part-v">
                                    {{ detalhe.desejaInfoAudiencia ? "Sim" : "Não" }}
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="part-k">Localidade (descrição)</p>
                                <p class="part-v">{{ detalhe.localidadeDescricao || "—" }}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">
                        <h2 class="admin-subtitle mb-1">Análise técnica (interna)</h2>
                        <p class="text-muted small mb-4">
                            Classificação conforme instrumentos de planejamento. Preenchida
                            pela equipe da administração municipal.
                        </p>

                        <form class="row g-3" @submit.prevent="onSalvar">
                            <div class="col-md-6">
                                <label class="form-label" for="a-funcao">Função</label>
                                <input
                                    id="a-funcao"
                                    v-model="analiseForm.funcao"
                                    type="text"
                                    maxlength="100"
                                    class="form-control"
                                />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="a-sub">Subfunção</label>
                                <input
                                    id="a-sub"
                                    v-model="analiseForm.subfuncao"
                                    type="text"
                                    maxlength="100"
                                    class="form-control"
                                />
                            </div>
                            <div class="col-12">
                                <label class="form-label" for="a-prog">Programa</label>
                                <input
                                    id="a-prog"
                                    v-model="analiseForm.programa"
                                    type="text"
                                    maxlength="150"
                                    class="form-control"
                                />
                            </div>
                            <div class="col-md-4">
                                <label class="form-label" for="a-nat">Natureza da despesa</label>
                                <select
                                    id="a-nat"
                                    v-model="analiseForm.natureza_despesa"
                                    class="form-select"
                                >
                                    <option value="">—</option>
                                    <option
                                        v-for="o in NATUREZA_DESPESA_OPCOES"
                                        :key="o.value"
                                        :value="o.value"
                                    >
                                        {{ o.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label" for="a-cat">Categoria econômica</label>
                                <select
                                    id="a-cat"
                                    v-model="analiseForm.categoria_economica"
                                    class="form-select"
                                >
                                    <option value="">—</option>
                                    <option
                                        v-for="o in CATEGORIA_ECONOMICA_OPCOES"
                                        :key="o.value"
                                        :value="o.value"
                                    >
                                        {{ o.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label" for="a-fonte">Fonte de recurso</label>
                                <input
                                    id="a-fonte"
                                    v-model="analiseForm.fonte_recurso"
                                    type="text"
                                    maxlength="100"
                                    class="form-control"
                                    placeholder="Próprios, SUS, FUNDEB..."
                                />
                            </div>
                            <div class="col-md-4">
                                <label class="form-label" for="a-ppa">Possui previsão no PPA?</label>
                                <select
                                    id="a-ppa"
                                    v-model="analiseForm.possui_previsao_ppa"
                                    class="form-select"
                                >
                                    <option value="">—</option>
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label" for="a-ldo">Compatível com LDO?</label>
                                <select
                                    id="a-ldo"
                                    v-model="analiseForm.compativel_ldo"
                                    class="form-select"
                                >
                                    <option value="">—</option>
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label" for="a-atende">Atende a demanda?</label>
                                <select
                                    id="a-atende"
                                    v-model="analiseForm.atende"
                                    class="form-select"
                                >
                                    <option value="">—</option>
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="a-status">Status</label>
                                <select
                                    id="a-status"
                                    v-model="analiseForm.status"
                                    class="form-select"
                                >
                                    <option
                                        v-for="o in STATUS_ANALISE_OPCOES"
                                        :key="o.value"
                                        :value="o.value"
                                    >
                                        {{ o.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label" for="a-parecer">Parecer técnico</label>
                                <textarea
                                    id="a-parecer"
                                    v-model="analiseForm.parecer_tecnico"
                                    rows="5"
                                    class="form-control"
                                    placeholder="Registre a conclusão técnica, jurídica e orçamentária..."
                                />
                            </div>
                            <div class="col-12 d-flex justify-content-end gap-2 pt-2">
                                <RouterLink
                                    :to="{ name: 'AdministradorParticipacao' }"
                                    class="btn btn-outline-secondary rounded-3 px-4"
                                >
                                    Cancelar
                                </RouterLink>
                                <button
                                    type="submit"
                                    class="btn btn-primary save-btn"
                                    :disabled="salvandoAnalise"
                                >
                                    <RiSave3Line class="me-1" />
                                    {{ salvandoAnalise ? "Salvando..." : "Salvar análise" }}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </template>
        </div>
    </article>
</template>

<style scoped>
.admin-alert {
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    font-size: 0.92rem;
}

.admin-alert--erro {
    background: #fff3f3;
    border: 1px solid #f1b4b4;
    color: #9e2b2b;
}

.admin-alert--ok {
    background: #eefaf3;
    border: 1px solid #b7e3c7;
    color: #1d6d3f;
}

.admin-subtitle {
    font-size: 1.2rem;
    font-weight: 800;
    color: #16254e;
}

.form-label {
    font-weight: 700;
    color: #344a74;
}

.form-control,
.form-select {
    border-radius: 10px;
    border-color: rgba(92, 107, 192, 0.2);
}

.save-btn {
    border: none !important;
    border-radius: 10px !important;
    padding-inline: 1.1rem !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #5c6bc0, #2da0a8) !important;
}

.save-btn:disabled {
    opacity: 0.65;
}

.part-k {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6b7d9c;
    font-weight: 700;
}

.part-v {
    margin: 0.2rem 0 0;
    font-weight: 600;
    color: #16254e;
}

.part-v--chips {
    margin-top: 0.45rem;
    font-weight: 400;
}

.part-v--block {
    font-weight: 500;
    white-space: pre-wrap;
    line-height: 1.5;
    background: #f8fbfd;
    border: 1px solid #e8edf4;
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
}
</style>
