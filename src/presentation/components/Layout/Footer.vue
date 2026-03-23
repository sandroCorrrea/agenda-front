<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed } from 'vue';
import { useMatrizStore } from '@/presentation/store/useMatrizStore';

const matrizStore = useMatrizStore();

const anoAtual = new Date().getFullYear();

const nomeEmpresa = computed(() => matrizStore.matriz?.nome || 'Agenda Assessoria Contábil');
const emailEmpresa = computed(() => matrizStore.matriz?.email || 'contato@agenda.com.br');
const telefoneEmpresa = computed(() => matrizStore.matriz?.telefone || '');
const celularEmpresa = computed(() => matrizStore.matriz?.celular || '');
const enderecoEmpresa = computed(() => {
  const matriz = matrizStore.matriz;
  if (!matriz) return 'Endereço indisponível no momento';
  return `${matriz.rua}, ${matriz.numero} - ${matriz.bairro}, ${matriz.cidade}/${matriz.uf} - CEP ${matriz.cep}`;
});
</script>

<template>
  <footer class="rodape">
    <div class="rodape__conteudo">
      <section class="rodape__bloco marca">
        <img src="/logo.svg" alt="Logo Agenda" class="rodape__logo" />
        <h3>{{ nomeEmpresa }}</h3>
        <p>
          Soluções em software para contabilidade, automação de processos e gestão inteligente para empresas.
        </p>
      </section>

      <section class="rodape__bloco">
        <h4>Atendimento presencial</h4>
        <ul>
          <li>Segunda a sexta: 07:30 às 17:30</li>
          <li>Intervalo de almoço: 11:00 às 13:00</li>
        </ul>
      </section>

      <section class="rodape__bloco">
        <h4>Contato</h4>
        <ul>
          <li>{{ emailEmpresa }}</li>
          <li v-if="telefoneEmpresa">Telefone: {{ telefoneEmpresa }}</li>
          <li v-if="celularEmpresa">Celular: {{ celularEmpresa }}</li>
          <li>{{ enderecoEmpresa }}</li>
        </ul>
      </section>

      <section class="rodape__bloco">
        <h4>Navegação</h4>
        <nav class="rodape__links">
          <RouterLink to="/">Início</RouterLink>
          <RouterLink to="/servico">Serviços</RouterLink>
          <RouterLink to="/blog">Blog</RouterLink>
          <RouterLink to="/aviso">Avisos</RouterLink>
          <RouterLink to="/contato">Contato</RouterLink>
        </nav>
      </section>
    </div>

    <div class="rodape__base">
      <span>© {{ anoAtual }} {{ nomeEmpresa }}. Todos os direitos reservados.</span>
    </div>
  </footer>
</template>

<style scoped>
.rodape {
  background: linear-gradient(180deg, #101829 0%, #0d1422 100%);
  color: #e8edf7;
  margin-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.rodape__conteudo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 1.25rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
}

.rodape__bloco h4 {
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 0.65rem;
  font-weight: 700;
}

.rodape__bloco ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.rodape__bloco li,
.rodape__bloco p {
  color: rgba(232, 237, 247, 0.86);
  font-size: 0.9rem;
  line-height: 1.5;
}

.marca h3 {
  color: #ffffff;
  font-size: 1.08rem;
  margin: 0.7rem 0 0.5rem;
}

.rodape__logo {
  width: min(160px, 100%);
  height: auto;
  display: block;
}

.rodape__links {
  display: grid;
  gap: 0.45rem;
}

.rodape__links a {
  color: rgba(232, 237, 247, 0.9);
  text-decoration: none;
  font-size: 0.9rem;
}

.rodape__links a:hover {
  color: #8fd8dc;
}

.rodape__base {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.95rem 1.5rem 1.1rem;
  text-align: center;
  font-size: 0.85rem;
  color: rgba(232, 237, 247, 0.75);
}

@media (min-width: 768px) {
  .rodape__conteudo {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .rodape__conteudo {
    grid-template-columns: 1.35fr 1fr 1fr 0.8fr;
    gap: 1.4rem;
  }
}
</style>
