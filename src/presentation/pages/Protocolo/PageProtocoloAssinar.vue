<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { RiCheckboxCircleLine, RiFileList3Line, RiHome4Line, RiPenNibLine } from "@remixicon/vue";
import { useProtocoloAssinaturaPublica } from "@/presentation/composables/Protocolo/useProtocoloAssinaturaPublica";
import { cpfMask, onlyNumbers } from "@/shared/utils/masks";
import { formatarDataIsoPtBr } from "@/shared/utils/date.util";

const route = useRoute();

const {
  carregando,
  dados,
  erroConsulta,
  enviando,
  erroEnvio,
  errosCampo,
  enviarAssinatura
} = useProtocoloAssinaturaPublica(() => String(route.params.token ?? ""));

const nome = ref("");
const cpf = ref("");

const chipTipo = (t: string) => (t === "fisica" ? "Pessoa física" : "Pessoa jurídica");

function aoDigitarCpf(ev: Event) {
  const el = ev.target as HTMLInputElement;
  cpf.value = cpfMask(el.value);
}

function formatarDataHoraPtBr(s: string) {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("pt-BR");
}

const cpfDigitos = computed(() => onlyNumbers(cpf.value));

const podeEnviar = computed(
  () =>
    nome.value.trim().length >= 2 &&
    cpfDigitos.value.length === 11 &&
    !enviando.value &&
    dados.value &&
    !dados.value.jaAssinado
);

async function onSubmit() {
  if (!podeEnviar.value) return;
  try {
    await enviarAssinatura(nome.value, cpfDigitos.value);
    nome.value = "";
    cpf.value = "";
  } catch {
    /* erro já exibido em erroEnvio */
  }
}
</script>

<template>
  <article class="assin-page min-vh-100 py-4 py-md-5">
    <div class="container" style="max-width: 560px">
      <div class="text-center mb-4">
        <div class="assin-page__icon mx-auto mb-2">
          <RiPenNibLine />
        </div>
        <h1 class="assin-page__title">Assinatura de recebimento</h1>
        <p class="text-muted mb-0 small">
          Confirme quem recebeu o protocolo neste endereço. Os dados são registrados de forma segura.
        </p>
      </div>

      <div v-if="carregando" class="card border-0 shadow-sm assin-card">
        <div class="card-body p-4 text-center text-muted">Carregando...</div>
      </div>

      <div v-else-if="erroConsulta && !dados" class="card border-0 shadow-sm assin-card">
        <div class="card-body p-4 text-center">
          <p class="text-danger mb-3">{{ erroConsulta }}</p>
          <RouterLink to="/" class="btn btn-outline-primary rounded-3">
            <RiHome4Line class="me-1" /> Voltar ao início
          </RouterLink>
        </div>
      </div>

      <template v-else-if="dados">
        <div class="card border-0 shadow-sm assin-card mb-3">
          <div class="card-body p-4 p-md-4">
            <h2 class="h6 fw-bold text-secondary d-flex align-items-center gap-2 mb-3">
              <RiFileList3Line /> Protocolo
            </h2>
            <p class="mb-1"><strong>Título:</strong> {{ dados.protocolo.titulo || "Sem título" }}</p>
            <p class="mb-1"><strong>Tipo:</strong> {{ chipTipo(dados.protocolo.destinatario_tipo) }}</p>
            <p class="mb-1"><strong>Ano:</strong> {{ dados.protocolo.ano }}</p>
            <p class="mb-1">
              <strong>Entrega prevista:</strong>
              {{ formatarDataIsoPtBr(dados.protocolo.data_para_entrega) }}
            </p>
            <p class="mb-1"><strong>Descrição:</strong> {{ dados.protocolo.descricao }}</p>
            <hr class="my-3" />
            <p class="mb-0 small text-muted">
              <strong>Endereço:</strong>
              {{ dados.protocolo.rua_destinatario }},
              {{ dados.protocolo.bairro_destinatario }} —
              {{ dados.protocolo.cidade_destinatario }} —
              CEP {{ dados.protocolo.cep_destinatario }}
            </p>
          </div>
        </div>

        <div v-if="dados.jaAssinado" class="card border-0 shadow-sm assin-card assin-card--ok">
          <div class="card-body p-4 text-center">
            <RiCheckboxCircleLine class="assin-page__ok-icon mb-2" />
            <h2 class="h5 fw-bold">Recebimento já assinado</h2>
            <template v-if="dados.entrega">
              <p class="mb-1"><strong>Responsável:</strong> {{ dados.entrega.nome_responsavel_recebimento }}</p>
              <p class="mb-1">
                <strong>CPF:</strong>
                {{ cpfMask(dados.entrega.cpf_responsavel_recebimento) }}
              </p>
              <p class="mb-0 text-muted small">
                <strong>Data e hora:</strong> {{ formatarDataHoraPtBr(dados.entrega.data_entrega) }}
              </p>
            </template>
            <p v-else class="mb-0 text-muted small">Este protocolo já possui registro de entrega.</p>
          </div>
        </div>

        <div v-else class="card border-0 shadow-sm assin-card">
          <div class="card-body p-4 p-md-4">
            <h2 class="h6 fw-bold mb-3">Dados de quem recebeu</h2>
            <form class="row g-3" @submit.prevent="onSubmit">
              <div class="col-12">
                <label class="form-label">Nome completo</label>
                <input
                  v-model="nome"
                  type="text"
                  class="form-control"
                  maxlength="120"
                  autocomplete="name"
                  :class="{ 'is-invalid': errosCampo.nome_responsavel_recebimento }"
                  placeholder="Nome completo do responsável"
                />
                <div v-if="errosCampo.nome_responsavel_recebimento" class="invalid-feedback d-block">
                  {{ errosCampo.nome_responsavel_recebimento }}
                </div>
              </div>
              <div class="col-12">
                <label class="form-label">CPF</label>
                <input
                  :value="cpf"
                  type="text"
                  class="form-control"
                  inputmode="numeric"
                  maxlength="14"
                  autocomplete="off"
                  placeholder="000.000.000-00"
                  :class="{ 'is-invalid': errosCampo.cpf_responsavel_recebimento }"
                  @input="aoDigitarCpf"
                />
                <div v-if="errosCampo.cpf_responsavel_recebimento" class="invalid-feedback d-block">
                  {{ errosCampo.cpf_responsavel_recebimento }}
                </div>
                <small v-else class="text-muted">11 dígitos</small>
              </div>
              <div v-if="erroEnvio" class="col-12">
                <div class="alert alert-danger py-2 mb-0 small">{{ erroEnvio }}</div>
              </div>
              <div class="col-12 d-grid">
                <button
                  type="submit"
                  class="btn btn-primary assin-btn fw-bold"
                  :disabled="!podeEnviar || enviando"
                >
                  {{ enviando ? "Registrando..." : "Confirmar recebimento" }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="text-center mt-3">
          <RouterLink to="/" class="text-decoration-none small">
            <RiHome4Line class="me-1" /> Voltar ao início
          </RouterLink>
        </div>
      </template>
    </div>
  </article>
</template>

<style scoped>
.assin-page {
  background: radial-gradient(circle at top right, #edf5ff 0%, #f6f8fc 40%, #eef4f3 100%);
}
.assin-page__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.35rem;
  background: linear-gradient(120deg, #1f2f57, #2d4e8f 55%, #2da0a8);
  color: #fff;
}
.assin-page__title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #16254e;
}
.assin-card {
  border-radius: 16px !important;
}
.assin-card--ok {
  border: 1px solid rgba(45, 160, 168, 0.35) !important;
  background: linear-gradient(180deg, #f4fdfa 0%, #fff 100%);
}
.assin-page__ok-icon {
  font-size: 2.5rem;
  color: #1d6d3f;
}
.assin-btn {
  border: none !important;
  border-radius: 10px !important;
  padding: 0.65rem;
  background: linear-gradient(90deg, #5c6bc0, #2da0a8) !important;
}
.form-control {
  border-radius: 10px;
}
</style>
