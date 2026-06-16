<script setup lang="ts">
import { RouterLink } from "vue-router";
import { computed } from "vue";
import {
  RiArrowRightLine,
  RiDashboardLine,
  RiFileList3Line,
  RiGlobalLine,
  RiLock2Line,
  RiNotification3Line,
  RiShieldCheckLine
} from "@remixicon/vue";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";
import { useLayoutMinimo } from "@/presentation/composables/useLayoutMinimo";

const layoutMinimo = useLayoutMinimo();
const matrizStore = useMatrizStore();
const anoAtual = new Date().getFullYear();
const nomeEmpresa = computed(() => matrizStore.matriz?.nome || "Agenda Assessoria Contábil");
const apelidoMatriz = computed(() => matrizStore.matriz?.apelido || nomeEmpresa.value);
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
          Você está no painel restrito de <strong>{{ apelidoMatriz }}</strong>.
          As ações aqui refletem no site público e nos dados dos clientes.
        </p>
      </div>
    </div>

    <div class="adm-foot__conteudo">
      <div class="adm-foot__grid">
        <section class="adm-foot__bloco">
          <h4>Atalhos do painel</h4>
          <nav class="adm-foot__nav">
            <RouterLink :to="{ name: 'AdministradorPainel' }" class="adm-foot__link">
              <RiDashboardLine /> Início do painel
            </RouterLink>
            <RouterLink :to="{ name: 'AdministradorServicos' }" class="adm-foot__link">
              Serviços
            </RouterLink>
            <RouterLink :to="{ name: 'AdministradorProtocolos' }" class="adm-foot__link">
              <RiFileList3Line /> Protocolos
            </RouterLink>
            <RouterLink :to="{ name: 'AdministradorAvisos' }" class="adm-foot__link">
              <RiNotification3Line /> Avisos
            </RouterLink>
            <RouterLink :to="{ name: 'BlogCategorias' }" class="adm-foot__link">
              Blog — categorias
            </RouterLink>
            <RouterLink :to="{ name: 'BlogPostagem' }" class="adm-foot__link">
              Blog — postagens
            </RouterLink>
            <RouterLink :to="{ name: 'AdministradorClientesPessoaFisica' }" class="adm-foot__link">
              Clientes (PF)
            </RouterLink>
            <RouterLink :to="{ name: 'AdministradorEmpresas' }" class="adm-foot__link">
              Clientes (PJ)
            </RouterLink>
            <RouterLink :to="{ name: 'AdministradorUsuarios' }" class="adm-foot__link">
              Administradores
            </RouterLink>
          </nav>
        </section>

        <section class="adm-foot__bloco">
          <h4>Conta e segurança</h4>
          <nav class="adm-foot__nav">
            <RouterLink :to="{ name: 'AdministradorPerfil' }" class="adm-foot__link">
              Perfil do usuário
            </RouterLink>
            <RouterLink :to="{ name: 'AdministradorChaves' }" class="adm-foot__link">
              <RiLock2Line /> Chaves de integração
            </RouterLink>
          </nav>
          <p class="adm-foot__hint">
            Não compartilhe seu acesso. Encerre a sessão ao usar computadores compartilhados.
          </p>
        </section>

        <section class="adm-foot__bloco adm-foot__bloco--site">
          <h4>Site público</h4>
          <p class="adm-foot__hint">
            Visualize como visitantes veem páginas institucionais, serviços e blog.
          </p>
          <RouterLink to="/" class="adm-foot__cta">
            <RiGlobalLine />
            Abrir página inicial
            <RiArrowRightLine class="adm-foot__cta-arrow" />
          </RouterLink>
        </section>
      </div>
    </div>

    <div class="adm-foot__base">
      <span>
        © {{ anoAtual }} {{ nomeEmpresa }} — painel administrativo.
        Uso interno autorizado.
      </span>
    </div>
  </footer>
</template>

<style scoped>
.adm-foot {
  margin-top: 2rem;
  border-top: 1px solid rgba(45, 160, 168, 0.25);
  background: linear-gradient(165deg, #0f1628 0%, #152238 45%, #122a32 100%);
  color: #e8edf7;
  box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.22);
}

.adm-foot__strip {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(45, 160, 168, 0.08);
}

.adm-foot__strip-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.2rem;
  display: grid;
  gap: 0.65rem;
}

@media (min-width: 768px) {
  .adm-foot__strip-inner {
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 1.25rem;
  }
}

.adm-foot__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #7ee8e0;
  white-space: nowrap;
}

.adm-foot__strip-text {
  font-size: 0.88rem;
  line-height: 1.5;
  color: rgba(232, 237, 247, 0.88);
}

.adm-foot__conteudo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.75rem 1.2rem 1.25rem;
}

.adm-foot__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 900px) {
  .adm-foot__grid {
    grid-template-columns: 1.2fr 1fr 0.95fr;
    gap: 1.25rem;
  }
}

.adm-foot__bloco {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1rem 1.1rem;
}

.adm-foot__bloco h4 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
}

.adm-foot__nav {
  display: grid;
  gap: 0.35rem;
}

.adm-foot__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;
  max-width: 100%;
  color: rgba(215, 229, 255, 0.95);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  margin-left: -0.5rem;
  border-radius: 8px;
  transition: background 0.15s ease, color 0.15s ease;
}

.adm-foot__link:hover {
  color: #fff;
  background: rgba(92, 107, 192, 0.2);
}

.adm-foot__hint {
  margin: 0.85rem 0 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: rgba(232, 237, 247, 0.65);
}

.adm-foot__bloco--site {
  display: flex;
  flex-direction: column;
}

.adm-foot__cta {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  align-self: flex-start;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  color: #0f1a2e;
  background: linear-gradient(90deg, #e8f4ff, #d4f5f2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.adm-foot__cta:hover {
  color: #0a1220;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.adm-foot__cta-arrow {
  font-size: 1rem;
  opacity: 0.85;
}

.adm-foot__base {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.95rem 1.2rem 1.1rem;
  text-align: center;
  font-size: 0.8rem;
  color: rgba(232, 237, 247, 0.55);
  line-height: 1.45;
}
</style>
