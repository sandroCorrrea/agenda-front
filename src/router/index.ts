import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/presentation/pages/Pessoa/PagePessoaLogin.vue')
    },
    {
      path: '/cadastro',
      name: 'Cadastro',
      component: () => import('@/presentation/pages/Pessoa/PagePessoaCadastro.vue')
    },
    {
      path: '/recuperar-senha',
      name: 'RecuperarSenha',
      component: () => import('@/presentation/pages/Pessoa/PageRecuperarSenha.vue')
    },
    {
      path: '/contato',
      name: 'Contato',
      component: () => import('@/presentation/pages/Contato/PageHomeContato.vue')
    },
    {
      path: '/servico',
      name: 'Servico',
      component: () => import('@/presentation/pages/Servico/PageHomeServico.vue')
    },
    {
      path: '/aviso',
      name: 'Aviso',
      component: () => import('@/presentation/pages/Aviso/PageHomeAviso.vue')
    }
  ],
})

export default router
