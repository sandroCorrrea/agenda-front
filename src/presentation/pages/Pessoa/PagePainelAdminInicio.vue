<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  RiArrowRightUpLine,
  RiArticleLine,
  RiBriefcase4Line,
  RiBuilding4Line,
  RiCalendarLine,
  RiFileList3Line,
  RiFolderLine,
  RiGlobalLine,
  RiKey2Line,
  RiLightbulbFlashLine,
  RiNotification3Line,
  RiShieldUserLine,
  RiSparklingLine,
  RiUser3Line,
  RiUserSettingsLine
} from "@remixicon/vue";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";

const matriz = useMatrizStore();

const saudacao = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
});

const dataLonga = computed(() =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date())
);

const subtituloMarca = computed(
  () => matriz.matriz?.apelido ?? "Agenda Assessoria Contábil"
);

type Atalho = {
  nome: string;
  descricao: string;
  rota: string;
  accent: string;
};

const atalhos: Atalho[] = [
  {
    nome: "Serviços",
    descricao: "Catálogo, cadastro e edição de serviços oferecidos.",
    rota: "AdministradorServicos",
    accent: "violet"
  },
  {
    nome: "Protocolos",
    descricao: "Entregas, PDF com QR e assinatura pelo destinatário.",
    rota: "AdministradorProtocolos",
    accent: "teal"
  },
  {
    nome: "Avisos",
    descricao: "Comunicados exibidos na área pública do site.",
    rota: "AdministradorAvisos",
    accent: "amber"
  },
  {
    nome: "Blog — categorias",
    descricao: "Organize as categorias das postagens.",
    rota: "BlogCategorias",
    accent: "indigo"
  },
  {
    nome: "Blog — postagens",
    descricao: "Crie e edite artigos e conteúdo institucional.",
    rota: "BlogPostagem",
    accent: "indigo"
  },
  {
    nome: "Clientes (PF)",
    descricao: "Pessoas físicas e cadastro de clientes.",
    rota: "AdministradorClientesPessoaFisica",
    accent: "slate"
  },
  {
    nome: "Clientes (PJ)",
    descricao: "Empresas e consulta por CNPJ.",
    rota: "AdministradorEmpresas",
    accent: "slate"
  },
  {
    nome: "Administradores",
    descricao: "Equipe com acesso ao painel e permissões.",
    rota: "AdministradorUsuarios",
    accent: "rose"
  },
  {
    nome: "Seu perfil",
    descricao: "Dados pessoais e preferências da conta.",
    rota: "AdministradorPerfil",
    accent: "cyan"
  },
  {
    nome: "Chaves de integração",
    descricao: "Tokens e integrações técnicas.",
    rota: "AdministradorChaves",
    accent: "cyan"
  }
];

const iconePorRota: Record<string, typeof RiBriefcase4Line> = {
  AdministradorServicos: RiBriefcase4Line,
  AdministradorProtocolos: RiFileList3Line,
  AdministradorAvisos: RiNotification3Line,
  BlogCategorias: RiFolderLine,
  BlogPostagem: RiArticleLine,
  AdministradorClientesPessoaFisica: RiUser3Line,
  AdministradorEmpresas: RiBuilding4Line,
  AdministradorUsuarios: RiShieldUserLine,
  AdministradorPerfil: RiUserSettingsLine,
  AdministradorChaves: RiKey2Line
};
</script>

<template>
  <article class="dash">
    <div class="dash__bg" aria-hidden="true" />
    <div class="container dash__inner py-4 py-md-5">
      <header class="dash__hero mb-4 mb-lg-5">
        <div class="dash__hero-glow" aria-hidden="true" />
        <div class="dash__hero-content">
          <p class="dash__eyebrow">
            <RiSparklingLine class="me-1" />
            Painel administrativo
          </p>
          <h1 class="dash__title">
            {{ saudacao }}!
          </h1>
          <p class="dash__lead">
            Você está conectado como administrador em
            <strong>{{ subtituloMarca }}</strong>.
            Escolha um módulo abaixo ou use o menu superior.
          </p>
          <div class="dash__meta">
            <span class="dash__pill">
              <RiCalendarLine class="me-1" />
              {{ dataLonga }}
            </span>
          </div>
        </div>
      </header>

      <section class="mb-4">
        <h2 class="dash__section-title">Acesso rápido</h2>
        <p class="dash__section-sub text-muted small mb-3">
          Atalhos para as áreas mais usadas do sistema.
        </p>
        <div class="row g-3 g-md-4">
          <div
            v-for="item in atalhos"
            :key="item.rota"
            class="col-12 col-sm-6 col-xl-4"
          >
            <RouterLink
              :to="{ name: item.rota }"
              class="dash-card"
              :class="`dash-card--${item.accent}`"
            >
              <div class="dash-card__icon">
                <component :is="iconePorRota[item.rota] ?? RiArrowRightUpLine" />
              </div>
              <div class="dash-card__body">
                <h3 class="dash-card__title">{{ item.nome }}</h3>
                <p class="dash-card__desc">{{ item.descricao }}</p>
              </div>
              <RiArrowRightUpLine class="dash-card__arrow" />
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="row g-3 g-md-4 mb-4">
        <div class="col-12 col-lg-7">
          <div class="dash-panel h-100">
            <h3 class="dash-panel__title">Site público</h3>
            <p class="dash-panel__text text-muted small mb-3">
              Visualize como visitantes e clientes veem páginas institucionais, serviços, blog e avisos.
            </p>
            <RouterLink to="/" class="btn dash-btn-outline">
              <RiGlobalLine class="me-2" />
              Abrir página inicial
            </RouterLink>
          </div>
        </div>
        <div class="col-12 col-lg-5">
          <div class="dash-panel dash-panel--tip h-100">
            <div class="d-flex align-items-start gap-2">
              <RiLightbulbFlashLine class="dash-panel__tip-icon flex-shrink-0" />
              <div>
                <h3 class="dash-panel__title mb-1">Dica</h3>
                <p class="dash-panel__text small mb-0">
                  Use <strong>Protocolos</strong> para gerar PDF com QR: o destinatário assina o recebimento pelo celular,
                  sem precisar de login no site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p class="text-center text-muted small mb-0 dash__footnote">
        Números agregados (totais de clientes, protocolos pendentes, etc.) podem ser exibidos aqui quando o backend
        expuser um endpoint de resumo do painel — por exemplo <code>GET /api/admin/dashboard</code>.
      </p>
    </div>
  </article>
</template>

<style scoped>
.dash {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  background: radial-gradient(ellipse 120% 80% at 100% 0%, #e8f0ff 0%, transparent 55%),
    radial-gradient(ellipse 90% 70% at 0% 100%, #e6f7f5 0%, transparent 50%),
    linear-gradient(180deg, #f4f7fb 0%, #eef2f8 100%);
}

.dash__bg {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
      circle at 20% 30%,
      rgba(92, 107, 192, 0.08) 0%,
      transparent 45%
    ),
    radial-gradient(circle at 80% 70%, rgba(45, 160, 168, 0.1) 0%, transparent 40%);
}

.dash__inner {
  position: relative;
  z-index: 1;
}

.dash__hero {
  position: relative;
  border-radius: 22px;
  padding: 1.75rem 1.5rem;
  background: linear-gradient(125deg, #1a2744 0%, #243a63 42%, #1f5f6b 100%);
  color: #fff;
  box-shadow: 0 20px 50px rgba(22, 37, 78, 0.28);
  overflow: hidden;
}

@media (min-width: 768px) {
  .dash__hero {
    padding: 2rem 2.25rem;
  }
}

.dash__hero-glow {
  position: absolute;
  width: 280px;
  height: 280px;
  right: -80px;
  top: -100px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 70%);
  border-radius: 50%;
}

.dash__hero-content {
  position: relative;
  max-width: 42rem;
}

.dash__eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.88;
  display: flex;
  align-items: center;
}

.dash__title {
  margin: 0 0 0.65rem;
  font-size: clamp(1.65rem, 4vw, 2.35rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.dash__lead {
  margin: 0 0 1rem;
  font-size: 0.98rem;
  line-height: 1.55;
  opacity: 0.92;
}

.dash__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dash__pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.dash__section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #16254e;
  margin: 0;
}

.dash__section-sub {
  margin: 0;
}

.dash-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  height: 100%;
  min-height: 118px;
  padding: 1.1rem 1.15rem;
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  background: #fff;
  border: 1px solid rgba(22, 37, 78, 0.07);
  box-shadow: 0 8px 28px rgba(22, 37, 78, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.dash-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(22, 37, 78, 0.1);
  border-color: rgba(92, 107, 192, 0.25);
}

.dash-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.dash-card--violet .dash-card__icon {
  background: linear-gradient(135deg, #eef0ff, #e4e8ff);
  color: #4a56a8;
}
.dash-card--teal .dash-card__icon {
  background: linear-gradient(135deg, #e6faf8, #d8f5f2);
  color: #1a7a72;
}
.dash-card--amber .dash-card__icon {
  background: linear-gradient(135deg, #fff8e6, #fff0cc);
  color: #a67c00;
}
.dash-card--indigo .dash-card__icon {
  background: linear-gradient(135deg, #eceeff, #e0e4ff);
  color: #3d4f9e;
}
.dash-card--slate .dash-card__icon {
  background: linear-gradient(135deg, #f0f2f6, #e8ebf0);
  color: #3d4d63;
}
.dash-card--rose .dash-card__icon {
  background: linear-gradient(135deg, #fff0f3, #ffe8ee);
  color: #a63d5c;
}
.dash-card--cyan .dash-card__icon {
  background: linear-gradient(135deg, #e8fbff, #dcf5fc);
  color: #0d6e8c;
}

.dash-card__body {
  flex: 1;
  min-width: 0;
}

.dash-card__title {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 800;
  color: #16254e;
}

.dash-card__desc {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: #5a6b86;
}

.dash-card__arrow {
  flex-shrink: 0;
  font-size: 1.15rem;
  color: #9aa8c2;
  margin-top: 0.15rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.dash-card:hover .dash-card__arrow {
  transform: translate(2px, -2px);
  color: #5c6bc0;
}

.dash-panel {
  border-radius: 16px;
  padding: 1.25rem 1.35rem;
  background: #fff;
  border: 1px solid rgba(22, 37, 78, 0.07);
  box-shadow: 0 8px 26px rgba(22, 37, 78, 0.05);
}

.dash-panel--tip {
  background: linear-gradient(145deg, #fafbff 0%, #f4f7ff 100%);
  border-color: rgba(92, 107, 192, 0.12);
}

.dash-panel__title {
  font-size: 1rem;
  font-weight: 800;
  color: #16254e;
  margin: 0 0 0.35rem;
}

.dash-panel__text {
  line-height: 1.5;
  color: #4a5b78;
}

.dash-panel__tip-icon {
  font-size: 1.5rem;
  color: #c9a227;
}

.dash-btn-outline {
  border-radius: 10px !important;
  font-weight: 700 !important;
  border: 2px solid #5c6bc0 !important;
  color: #3d4a8f !important;
  padding: 0.5rem 1rem !important;
}

.dash-btn-outline:hover {
  background: rgba(92, 107, 192, 0.08) !important;
  color: #243056 !important;
}

.dash__footnote {
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.dash__footnote code {
  font-size: 0.78em;
  color: #3d4f7a;
}
</style>
