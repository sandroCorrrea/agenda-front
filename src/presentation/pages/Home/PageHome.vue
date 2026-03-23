<script setup lang="ts">
import { computed } from 'vue';
import logoJpeg from '@/presentation/assets/img/logo.jpeg';
import profileSvg from '@/presentation/assets/img/profile.svg';

const imagensCarrossel = [
  { src: '/logo.svg', titulo: 'Plataforma contábil integrada' },
  { src: logoJpeg, titulo: 'Inteligência para escritórios modernos' },
  { src: profileSvg, titulo: 'Atendimento digital eficiente' },
  { src: '/logo.svg', titulo: 'Automação fiscal e financeira' },
  { src: logoJpeg, titulo: 'Produtividade com segurança' },
  { src: profileSvg, titulo: 'Experiência completa para clientes' }
];

const trilhaCarrossel = computed(() => [...imagensCarrossel, ...imagensCarrossel]);
</script>

<template>
  <article class="home-page">
    <section class="hero">
      <div class="hero__conteudo">
        <div class="hero__texto">
          <span class="hero__selo">Software para contabilidade moderna</span>
          <h1>
            Gestão inteligente para o seu escritório contábil e para os seus clientes
          </h1>
          <p>
            A Agenda entrega tecnologia para automatizar rotinas, reduzir erros e acelerar resultados.
            Uma plataforma completa para integrar processos contábeis, fiscais e administrativos.
          </p>
          <div class="hero__acoes">
            <RouterLink to="/servico" class="btn btn-primary btn-sm">Conhecer serviços</RouterLink>
            <RouterLink to="/contato" class="btn btn-outline-primary btn-sm">Falar com especialista</RouterLink>
          </div>
          <div class="hero__numeros">
            <div class="numero-card">
              <strong>99,9%</strong>
              <span>Disponibilidade</span>
            </div>
            <div class="numero-card">
              <strong>24/7</strong>
              <span>Monitoramento</span>
            </div>
            <div class="numero-card">
              <strong>+120</strong>
              <span>Processos automatizados</span>
            </div>
          </div>
        </div>
        <div class="hero__arte">
          <div class="logo-box">
            <img src="/logo.svg" alt="Logo Agenda" class="logo-principal" />
          </div>
          <img src="@/presentation/assets/img/logo.jpeg" alt="Marca Agenda" class="logo-secundaria" />
        </div>
      </div>
    </section>

    <section class="bloco bloco-carrossel">
      <div class="topo-secao">
        <h2>Experiência visual da plataforma</h2>
        <p>Soluções desenhadas para evoluir a gestão contábil com tecnologia e agilidade.</p>
      </div>
      <div class="carrossel">
        <div class="carrossel__trilha">
          <div class="carrossel__item" v-for="(imagem, indice) in trilhaCarrossel" :key="`${imagem.titulo}-${indice}`">
            <img :src="imagem.src" :alt="imagem.titulo" />
            <span>{{ imagem.titulo }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="bloco solucoes">
      <div class="topo-secao">
        <h2>Soluções para cada etapa da operação</h2>
        <p>
          Da entrada de dados até a entrega de relatórios estratégicos, tudo conectado em um único fluxo.
        </p>
      </div>
      <div class="grid-cards">
        <div class="card-solucao">
          <h3>Automação contábil</h3>
          <p>Conciliações, fechamentos e validações com menos retrabalho e maior confiabilidade.</p>
        </div>
        <div class="card-solucao">
          <h3>Portal do cliente</h3>
          <p>Central de documentos, solicitações e acompanhamento em tempo real.</p>
        </div>
        <div class="card-solucao">
          <h3>Integrações fiscais</h3>
          <p>Comunicação com APIs e serviços governamentais para ganhos de produtividade.</p>
        </div>
        <div class="card-solucao">
          <h3>Business Intelligence</h3>
          <p>Painéis claros para apoiar decisões financeiras e estratégicas.</p>
        </div>
      </div>
    </section>

    <section class="bloco diferenciais">
      <div class="topo-secao">
        <h2>Por que escolher a Agenda</h2>
      </div>
      <div class="diferenciais__linha">
        <div class="diferencial-item">
          <span class="etiqueta">01</span>
          <div>
            <h4>Implementação rápida</h4>
            <p>Estrutura pronta para colocar sua operação em produção com segurança.</p>
          </div>
        </div>
        <div class="diferencial-item">
          <span class="etiqueta">02</span>
          <div>
            <h4>Escalabilidade real</h4>
            <p>Projeto preparado para crescer com seu volume de clientes e demandas.</p>
          </div>
        </div>
        <div class="diferencial-item">
          <span class="etiqueta">03</span>
          <div>
            <h4>Suporte próximo</h4>
            <p>Equipe especializada para orientar melhorias contínuas no seu ambiente.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bloco chamada-final">
      <h2>Transforme sua operação contábil com tecnologia</h2>
      <p>
        Solicite uma demonstração e veja como a Agenda pode elevar a eficiência e a experiência dos seus clientes.
      </p>
      <div class="hero__acoes">
        <RouterLink to="/cadastro" class="btn btn-primary btn-sm">Começar agora</RouterLink>
        <RouterLink to="/blog" class="btn btn-outline-primary btn-sm">Ver conteúdos</RouterLink>
      </div>
    </section>
  </article>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hero {
  border-radius: 24px;
  padding: 2rem 1.25rem;
  background: radial-gradient(circle at 20% 20%, rgba(92, 107, 192, 0.14), transparent 50%),
    radial-gradient(circle at 80% 0%, rgba(45, 160, 168, 0.2), transparent 45%),
    linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  border: 1px solid rgba(20, 30, 40, 0.06);
  box-shadow: 0 16px 36px rgba(20, 30, 40, 0.08);
}

.hero__conteudo {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: center;
}

.hero__selo {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: rgba(92, 107, 192, 0.12);
  color: #2b3a7d;
  font-weight: 700;
  font-size: 0.78rem;
  margin-bottom: 0.8rem;
}

.hero h1 {
  font-size: clamp(1.4rem, 4vw, 2.4rem);
  line-height: 1.15;
  color: #17233b;
  margin-bottom: 0.75rem;
  font-weight: 800;
}

.hero p {
  color: #49566e;
  margin-bottom: 1.1rem;
}

.hero__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn-primary {
  background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 10px 16px !important;
  box-shadow: 0 10px 24px rgba(45, 160, 168, 0.16);
  font-weight: 700;
}

.btn-outline-primary {
  border: 2px solid #5c6bc0 !important;
  color: #5c6bc0 !important;
  border-radius: 12px !important;
  padding: 10px 16px !important;
  font-weight: 700;
}

.hero__numeros {
  margin-top: 1.2rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.numero-card {
  background: #ffffff;
  border: 1px solid rgba(20, 30, 40, 0.07);
  border-radius: 14px;
  padding: 0.8rem;
  text-align: center;
}

.numero-card strong {
  color: #1c2c63;
  display: block;
  font-size: 1.1rem;
}

.numero-card span {
  color: #6c778a;
  font-size: 0.82rem;
}

.hero__arte {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

.logo-box {
  background: linear-gradient(145deg, #f2f5ff 0%, #ecffff 100%);
  border: 1px solid rgba(28, 44, 99, 0.08);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
}

.logo-principal {
  max-width: min(300px, 100%);
  width: 100%;
  height: auto;
}

.logo-secundaria {
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(20, 30, 40, 0.08);
  box-shadow: 0 8px 24px rgba(20, 30, 40, 0.1);
}

.bloco {
  border-radius: 20px;
  padding: 1.4rem 1.2rem;
  background: #ffffff;
  border: 1px solid rgba(20, 30, 40, 0.06);
}

.topo-secao h2 {
  color: #1b2746;
  font-size: clamp(1.2rem, 3vw, 1.7rem);
  margin-bottom: 0.35rem;
  font-weight: 800;
}

.topo-secao p {
  color: #5c6780;
  margin-bottom: 1rem;
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.9rem;
}

.bloco-carrossel {
  overflow: hidden;
}

.carrossel {
  overflow: hidden;
  border-radius: 16px;
}

.carrossel__trilha {
  display: flex;
  gap: 0.8rem;
  width: max-content;
  animation: rolarCarrossel 22s linear infinite;
}

.carrossel__item {
  flex: 0 0 calc((100vw - 4.8rem) / 3);
  max-width: 340px;
  min-width: 220px;
  border-radius: 14px;
  overflow: hidden;
  background: #f8fbff;
  border: 1px solid rgba(20, 30, 40, 0.08);
}

.carrossel__item img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.carrossel__item span {
  display: block;
  padding: 0.75rem;
  font-size: 0.86rem;
  color: #3d4c69;
  font-weight: 600;
}

.card-solucao {
  border-radius: 14px;
  padding: 1rem;
  border: 1px solid rgba(20, 30, 40, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.card-solucao h3 {
  color: #243560;
  font-size: 1rem;
  margin-bottom: 0.35rem;
  font-weight: 700;
}

.card-solucao p {
  color: #5d6c88;
  font-size: 0.92rem;
  margin: 0;
}

.diferenciais__linha {
  display: grid;
  gap: 0.9rem;
}

.diferencial-item {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  border: 1px solid rgba(20, 30, 40, 0.08);
  border-radius: 14px;
  padding: 0.9rem;
  background: #fcfdff;
}

.etiqueta {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(120deg, #1f3170, #2da0a8);
  flex: 0 0 auto;
}

.diferencial-item h4 {
  margin: 0 0 0.25rem;
  color: #1f2e5b;
  font-size: 1rem;
  font-weight: 700;
}

.diferencial-item p {
  margin: 0;
  color: #60708c;
  font-size: 0.9rem;
}

.chamada-final {
  text-align: center;
  background: linear-gradient(140deg, rgba(92, 107, 192, 0.1), rgba(45, 160, 168, 0.12));
}

.chamada-final h2 {
  color: #1a2751;
  font-size: clamp(1.25rem, 3vw, 1.9rem);
  margin-bottom: 0.55rem;
  font-weight: 800;
}

.chamada-final p {
  color: #4e5e79;
  max-width: 760px;
  margin: 0 auto 1rem;
}

.chamada-final .hero__acoes {
  justify-content: center;
}

@media (min-width: 768px) {
  .hero {
    padding: 2.2rem;
  }

  .grid-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .home-page {
    gap: 1.5rem;
  }

  .hero__conteudo {
    grid-template-columns: 1.2fr .8fr;
    gap: 2rem;
  }

  .hero__texto {
    max-width: 640px;
  }

  .bloco {
    padding: 1.7rem;
  }

  .carrossel__item {
    flex: 0 0 calc((1120px - 7rem) / 3);
  }
}

@media (max-width: 480px) {
  .hero__numeros {
    grid-template-columns: 1fr;
  }

  .carrossel__item {
    min-width: 180px;
  }
}

@keyframes rolarCarrossel {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-50% - 0.4rem));
  }
}
</style>
