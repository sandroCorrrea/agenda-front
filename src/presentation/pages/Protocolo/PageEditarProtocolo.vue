<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiMapPin2Line,
  RiSave3Line,
  RiShieldCheckLine,
  RiSparklingLine
} from "@remixicon/vue";
import { useEditarProtocolo } from "@/presentation/composables/Protocolo/useEditarProtocolo";
import { cepMask, onlyNumbers } from "@/shared/utils/masks";

const route = useRoute();
const router = useRouter();
const {
  protocoloAtual,
  carregando,
  salvando,
  erro,
  sucesso,
  naoEncontrado,
  erroCampos,
  empresasDestinatario,
  clientesDestinatario,
  carregandoDestinatarios,
  erroDestinatarios,
  carregandoEnderecoDestinatario,
  erroEnderecoDestinatario,
  carregar,
  salvar,
  carregarDestinatarios,
  carregarEnderecoDestinatario,
  montarPayload
} = useEditarProtocolo();

const form = reactive({
  destinatario_tipo: "fisica" as "fisica" | "juridica",
  destinatario_usuario_id: "",
  destinatario_empresa_id: "",
  titulo: "",
  descricao: "",
  ano: "",
  data_para_entrega: "",
  cep_destinatario: "",
  rua_destinatario: "",
  bairro_destinatario: "",
  cidade_destinatario: ""
});

const carregandoCep = ref(false);
const erroCep = ref<string | null>(null);

watch(() => protocoloAtual.value, (p) => {
  if (!p) return;
  form.destinatario_tipo = p.destinatarioTipo;
  form.destinatario_usuario_id = p.destinatarioUsuarioId != null ? String(p.destinatarioUsuarioId) : "";
  form.destinatario_empresa_id = p.destinatarioEmpresaId != null ? String(p.destinatarioEmpresaId) : "";
  form.titulo = p.titulo ?? "";
  form.descricao = p.descricao;
  form.ano = String(p.ano);
  const rawData = p.dataParaEntrega ?? "";
  form.data_para_entrega = typeof rawData === "string" ? rawData.slice(0, 10) : "";
  form.cep_destinatario = p.cepDestinatario;
  form.rua_destinatario = p.ruaDestinatario;
  form.bairro_destinatario = p.bairroDestinatario;
  form.cidade_destinatario = p.cidadeDestinatario;
}, { immediate: true });

/** Só ao mudar o tipo manualmente — evita limpar IDs quando o protocolo hidrata o form (fisica → jurídica). */
async function aoAlterarTipoDestinatario() {
  form.destinatario_usuario_id = "";
  form.destinatario_empresa_id = "";
  await carregarDestinatarios(form.destinatario_tipo);
}

watch(
  () => form.destinatario_usuario_id,
  async (id) => {
    if (form.destinatario_tipo !== "fisica" || !id) return;
    const endereco = await carregarEnderecoDestinatario("fisica", Number(id));
    if (!endereco) return;
    form.cep_destinatario = cepMask(endereco.cepDestinatario);
    form.rua_destinatario = endereco.ruaDestinatario;
    form.bairro_destinatario = endereco.bairroDestinatario;
    form.cidade_destinatario = endereco.cidadeDestinatario;
  }
);

watch(
  () => form.destinatario_empresa_id,
  async (id) => {
    if (form.destinatario_tipo !== "juridica" || !id) return;
    const endereco = await carregarEnderecoDestinatario("juridica", Number(id));
    if (!endereco) return;
    form.cep_destinatario = cepMask(endereco.cepDestinatario);
    form.rua_destinatario = endereco.ruaDestinatario;
    form.bairro_destinatario = endereco.bairroDestinatario;
    form.cidade_destinatario = endereco.cidadeDestinatario;
  }
);

function aoDigitarCep(ev: Event) {
  const input = ev.target as HTMLInputElement;
  form.cep_destinatario = cepMask(input.value);
}

async function buscarCep() {
  const cep = onlyNumbers(form.cep_destinatario);
  if (cep.length !== 8) return;
  carregandoCep.value = true;
  erroCep.value = null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) throw new Error();
    const data = (await res.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
    };
    if (data.erro) {
      erroCep.value = "CEP não encontrado.";
      return;
    }
    /** Só sobrescreve com ViaCEP quando o campo vem preenchido; evita apagar rua/bairro já trazidos por GET …/usuarios/{id}/endereco quando o ViaCEP não tem logradouro (ex.: loteamentos). */
    const log = data.logradouro?.trim();
    const bai = data.bairro?.trim();
    const loc = data.localidade?.trim();
    if (log) form.rua_destinatario = log;
    if (bai) form.bairro_destinatario = bai;
    if (loc) form.cidade_destinatario = loc;
  } catch {
    erroCep.value = "Não foi possível consultar o CEP.";
  } finally {
    carregandoCep.value = false;
  }
}

let debounceCep: ReturnType<typeof setTimeout> | null = null;
watch(
  () => onlyNumbers(form.cep_destinatario),
  (n) => {
    if (debounceCep) clearTimeout(debounceCep);
    if (n.length !== 8) return;
    debounceCep = setTimeout(() => {
      debounceCep = null;
      void buscarCep();
    }, 450);
  }
);

async function onSave() {
  const id = Number(route.params.id);
  const payload = montarPayload({
    destinatario_tipo: form.destinatario_tipo,
    destinatario_usuario_id: form.destinatario_tipo === "fisica" && form.destinatario_usuario_id ? Number(form.destinatario_usuario_id) : null,
    destinatario_empresa_id: form.destinatario_tipo === "juridica" && form.destinatario_empresa_id ? Number(form.destinatario_empresa_id) : null,
    titulo: form.titulo.trim() || null,
    descricao: form.descricao.trim(),
    ano: Number(form.ano),
    data_para_entrega: form.data_para_entrega,
    cep_destinatario: form.cep_destinatario.replace(/\D/g, "").slice(0, 8),
    rua_destinatario: form.rua_destinatario.trim(),
    bairro_destinatario: form.bairro_destinatario.trim(),
    cidade_destinatario: form.cidade_destinatario.trim()
  });
  try {
    await salvar(id, payload);
  } catch {
    if (naoEncontrado.value) {
      await router.push({ name: "AdministradorProtocolos", query: { erro: "nao_encontrado" } });
    }
  }
}

onMounted(async () => {
  const id = Number(route.params.id);
  if (!id || Number.isNaN(id)) {
    await router.replace({ name: "AdministradorProtocolos" });
    return;
  }
  try {
    await carregar(id);
    if (protocoloAtual.value) {
      await carregarDestinatarios(protocoloAtual.value.destinatarioTipo);
    }
  } catch {
    if (naoEncontrado.value) {
      await router.push({ name: "AdministradorProtocolos", query: { erro: "nao_encontrado" } });
    }
  }
});
</script>

<template>
  <article class="proto-form min-vh-100 py-4">
    <div class="container" style="max-width: 860px">
      <nav class="mb-3">
        <RouterLink :to="{ name: 'AdministradorProtocolos' }" class="crumb">
          <RiArrowLeftLine />
          Voltar para protocolos
        </RouterLink>
      </nav>

      <section class="hero mb-4">
        <div class="hero__icon"><RiShieldCheckLine /></div>
        <div>
          <p class="hero__eyebrow">
            <RiSparklingLine class="me-1" />
            Protocolo administrativo
          </p>
          <h1 class="title mb-2">Editar protocolo</h1>
          <p class="hero__sub mb-0">
            Atualize destinatário, prazo e endereço mantendo o fluxo alinhado ao cadastro.
          </p>
        </div>
      </section>

      <div v-if="carregando" class="text-muted py-4">Carregando protocolo...</div>

      <template v-else>
        <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
        <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

        <div class="card border-0 shadow-sm proto-card">
          <div class="card-body p-4 p-md-5">
            <form class="row g-4" @submit.prevent="onSave">
              <div class="col-12">
                <h2 class="section-title">Destinatário</h2>
              </div>

              <div class="col-md-4">
                <label class="form-label">Tipo destinatário</label>
                <select v-model="form.destinatario_tipo" class="form-select" @change="aoAlterarTipoDestinatario">
                  <option value="fisica">Física</option>
                  <option value="juridica">Jurídica</option>
                </select>
                <div v-if="erroCampos.destinatario_tipo" class="invalid-feedback d-block">{{ erroCampos.destinatario_tipo }}</div>
              </div>

              <div class="col-md-8" v-if="form.destinatario_tipo === 'fisica'">
                <label class="form-label">Destinatário (cliente)</label>
                <select v-model="form.destinatario_usuario_id" class="form-select" :disabled="carregandoDestinatarios || !!erroDestinatarios">
                  <option value="">Selecione um cliente</option>
                  <option v-for="c in clientesDestinatario" :key="c.usuarioId" :value="String(c.usuarioId)">
                    {{ c.nome }}
                  </option>
                </select>
                <small v-if="carregandoDestinatarios" class="text-muted">Carregando clientes...</small>
                <small v-else-if="erroDestinatarios" class="text-danger d-block">
                  {{ erroDestinatarios }}
                  <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="carregarDestinatarios('fisica')">Tentar novamente</button>
                </small>
                <small v-else-if="clientesDestinatario.length === 0" class="text-muted">Nenhum cliente encontrado.</small>
                <div v-if="erroCampos.destinatario_usuario_id" class="invalid-feedback d-block">{{ erroCampos.destinatario_usuario_id }}</div>
                <small v-if="carregandoEnderecoDestinatario" class="text-muted d-block mt-1">Carregando endereço do cliente...</small>
              </div>

              <div class="col-md-8" v-else>
                <label class="form-label">Destinatário (empresa)</label>
                <select v-model="form.destinatario_empresa_id" class="form-select" :disabled="carregandoDestinatarios || !!erroDestinatarios">
                  <option value="">Selecione uma empresa</option>
                  <option v-for="e in empresasDestinatario" :key="e.id" :value="String(e.id)">
                    {{ e.nome }}
                  </option>
                </select>
                <small v-if="carregandoDestinatarios" class="text-muted">Carregando empresas...</small>
                <small v-else-if="erroDestinatarios" class="text-danger d-block">
                  {{ erroDestinatarios }}
                  <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="carregarDestinatarios('juridica')">Tentar novamente</button>
                </small>
                <small v-else-if="empresasDestinatario.length === 0" class="text-muted">Nenhuma empresa encontrada.</small>
                <div v-if="erroCampos.destinatario_empresa_id" class="invalid-feedback d-block">{{ erroCampos.destinatario_empresa_id }}</div>
                <small v-if="carregandoEnderecoDestinatario" class="text-muted d-block mt-1">Carregando endereço da empresa...</small>
              </div>

              <div class="col-12" v-if="erroEnderecoDestinatario">
                <small class="text-warning">{{ erroEnderecoDestinatario }}</small>
              </div>

              <div class="col-12"><div class="divider" /></div>

              <div class="col-12">
                <h2 class="section-title">Conteúdo</h2>
              </div>
              <div class="col-12">
                <label class="form-label">Título</label>
                <input v-model="form.titulo" maxlength="100" class="form-control" placeholder="Ex.: Entrega de documentação anual" />
                <div v-if="erroCampos.titulo" class="invalid-feedback d-block">{{ erroCampos.titulo }}</div>
              </div>
              <div class="col-12">
                <label class="form-label">Descrição</label>
                <textarea v-model="form.descricao" rows="5" class="form-control" placeholder="Descreva o objetivo e os detalhes do protocolo..." />
                <div v-if="erroCampos.descricao" class="invalid-feedback d-block">{{ erroCampos.descricao }}</div>
              </div>

              <div class="col-12"><div class="divider" /></div>

              <div class="col-12">
                <h2 class="section-title">
                  <RiCalendarLine class="me-2" />
                  Prazo e endereço
                </h2>
              </div>
              <div class="col-md-4">
                <label class="form-label">Ano</label>
                <input v-model="form.ano" type="number" min="2000" max="9999" class="form-control" />
                <div v-if="erroCampos.ano" class="invalid-feedback d-block">{{ erroCampos.ano }}</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Data para entrega</label>
                <input v-model="form.data_para_entrega" type="date" class="form-control" />
                <div v-if="erroCampos.data_para_entrega" class="invalid-feedback d-block">{{ erroCampos.data_para_entrega }}</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">CEP</label>
                <input v-model="form.cep_destinatario" maxlength="9" class="form-control" @input="aoDigitarCep" />
                <small v-if="carregandoCep" class="text-muted">Buscando CEP...</small>
                <small v-else-if="erroCep" class="text-danger d-block">{{ erroCep }}</small>
                <div v-if="erroCampos.cep_destinatario" class="invalid-feedback d-block">{{ erroCampos.cep_destinatario }}</div>
              </div>
              <div class="col-md-4">
                <label class="form-label"><RiMapPin2Line class="me-1" />Rua</label>
                <input v-model="form.rua_destinatario" class="form-control" />
                <div v-if="erroCampos.rua_destinatario" class="invalid-feedback d-block">{{ erroCampos.rua_destinatario }}</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Bairro</label>
                <input v-model="form.bairro_destinatario" class="form-control" />
                <div v-if="erroCampos.bairro_destinatario" class="invalid-feedback d-block">{{ erroCampos.bairro_destinatario }}</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Cidade</label>
                <input v-model="form.cidade_destinatario" class="form-control" />
                <div v-if="erroCampos.cidade_destinatario" class="invalid-feedback d-block">{{ erroCampos.cidade_destinatario }}</div>
              </div>

              <div class="col-12 d-flex justify-content-end gap-2 pt-2">
                <RouterLink :to="{ name: 'AdministradorProtocolos' }" class="btn btn-outline-secondary rounded-3 px-4">
                  Cancelar
                </RouterLink>
                <button class="btn btn-primary save-btn" type="submit" :disabled="salvando">
                  <RiSave3Line class="me-1" />
                  {{ salvando ? "Salvando..." : "Salvar alterações" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
    </div>
  </article>
</template>

<style scoped>
.proto-form {
  background: radial-gradient(circle at top right, #edf5ff 0%, #f6f8fc 35%, #eef4f3 100%);
}
.crumb {
  color: #435a90;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  gap: 0.2rem;
  align-items: center;
}
.hero {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem 1.35rem;
  border-radius: 16px;
  background: linear-gradient(120deg, #1f2f57 0%, #2d4e8f 55%, #2da0a8 100%);
  color: #fff;
  box-shadow: 0 14px 32px rgba(28, 51, 89, 0.25);
}
.hero__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.35rem;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.hero__eyebrow {
  margin: 0 0 0.2rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}
.hero__sub {
  opacity: 0.92;
  max-width: 44rem;
}
.title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}
.proto-card {
  border-radius: 18px !important;
}
.section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #203056;
  display: inline-flex;
  align-items: center;
}
.divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(92, 107, 192, 0.18), rgba(45, 160, 168, 0.1));
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
</style>
