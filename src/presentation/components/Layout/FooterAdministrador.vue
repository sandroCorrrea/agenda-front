<script setup lang="ts">
import { RouterLink } from "vue-router";
import { computed } from "vue";
import {
  RiArrowRightLine,
  RiGlobalLine,
  RiLock2Line,
  RiShieldCheckLine
} from "@remixicon/vue";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";
import { useLayoutMinimo } from "@/presentation/composables/useLayoutMinimo";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useMenuStore } from "@/presentation/store/useMenuStore";

const layoutMinimo = useLayoutMinimo();
const matrizStore = useMatrizStore();
const auth = useAuthStore();
const menuStore = useMenuStore();
const anoAtual = new Date().getFullYear();
const nomeEmpresa = computed(() => matrizStore.matriz?.nome || "Agenda Assessoria Contábil");
const apelidoMatriz = computed(() => matrizStore.matriz?.apelido || nomeEmpresa.value);

const atalhos = computed(() =>
  menuStore.opcoes
    .filter((o) => o.pode_visualizar)
    .slice(0, 12)
    .map((o) => ({
      label: o.label,
      rota: o.rota_nome
    }))
);

const ehMaster = computed(() => menuStore.ehMaster || auth.ehContabilidade);
</script>

<template>
  <footer v-if="!layoutMinimo" class="adm-foot">
    <div class="adm-foot__strip">
      <div class="adm-foot__strip-inner">
        <span class="adm-foot__badge">
          <RiShieldCheckLine />
          Área administrativa
        </span>
        <p class="adm-foot__strip-text mb-0">
          <template v-if="ehMaster">
            Você está no painel restrito de <strong>{{ apelidoMatriz }}</strong>.
            As ações aqui refletem no site público e nos dados dos clientes.
          </template>
          <template v-else>
            Você está na área administrativa de
            <strong>{{ apelidoMatriz }}</strong>
            conforme as permissões do seu grupo.
          </template>
        </p>
      </div>
    </div>

    <div class="adm-foot__conteudo">
      <div class="adm-foot__grid">
        <section class="adm-foot__bloco">
          <h4>Atalhos do painel</h4>
          <nav class="adm-foot__nav">
            <RouterLink
              v-for="item in atalhos"
              :key="item.rota"
              :to="{ name: item.rota }"
              class="adm-foot__link"
            >
              {{ item.label }}
            </RouterLink>
            <p v-if="atalhos.length === 0" class="adm-foot__hint mb-0">
              Nenhuma funcionalidade liberada para o seu usuário.
            </p>
          </nav>
        </section>

        <section v-if="menuStore.podeVisualizarCodigo('admin.perfil') || menuStore.podeVisualizarCodigo('admin.chaves')" class="adm-foot__bloco">
          <h4>Conta e segurança</h4>
          <nav class="adm-foot__nav">
            <RouterLink
              v-if="menuStore.podeVisualizarCodigo('admin.perfil')"
              :to="{ name: 'AdministradorPerfil' }"
              class="adm-foot__link"
            >
              Perfil do usuário
            </RouterLink>
            <RouterLink
              v-if="menuStore.podeVisualizarCodigo('admin.chaves')"
              :to="{ name: 'AdministradorChaves' }"
              class="adm-foot__link"
            >
              <RiLock2Line /> Chaves de integração
            </RouterLink>
          </nav>
          <p class="adm-foot__hint">
            Não compartilhe seu acesso. Encerre a sessão ao usar computadores compartilhados.
          </p>
        </section>

        <section v-if="ehMaster" class="adm-foot__bloco adm-foot__bloco--site">
          <h4>Site público</h4>
          <p class="adm-foot__hint">
            Visualize como visitantes veem páginas institucionais, serviços e blog.
          </p>
          <RouterLink to="/" class="adm-foot__cta">
            Abrir site
            <RiArrowRightLine />
          </RouterLink>
          <RouterLink to="/servico" class="adm-foot__link mt-2">
            <RiGlobalLine /> Serviços públicos
          </RouterLink>
        </section>
      </div>

      <div class="adm-foot__copy">
        © {{ anoAtual }} {{ nomeEmpresa }}. Todos os direitos reservados.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.adm-foot {
  margin-top: auto;
  background: #0f172a;
  color: #e2e8f0;
}

.adm-foot__strip {
  background: linear-gradient(90deg, #1e293b, #0f172a);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.adm-foot__strip-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0.85rem 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.adm-foot__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.adm-foot__strip-text {
  font-size: 0.9rem;
  color: #cbd5e1;
}

.adm-foot__conteudo {
  max-width: 1140px;
  margin: 0 auto;
  padding: 1.75rem 1rem 1.25rem;
}

.adm-foot__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.adm-foot__bloco h4 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.adm-foot__nav {
  display: grid;
  gap: 0.35rem;
}

.adm-foot__link {
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.adm-foot__link:hover {
  color: #fff;
}

.adm-foot__hint {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 0.65rem;
}

.adm-foot__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #2563eb;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
}

.adm-foot__copy {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 1rem;
  font-size: 0.82rem;
  color: #64748b;
}
</style>
