import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/presentation/pages/Home/PageHome.vue')
    },
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
    },
    {
      path: '/blog',
      name: 'Blog',
      component: () => import('@/presentation/pages/Blog/PageHomeBlog.vue'),
      props: route => ({
        page: Number(route.query.page) || 1
      })
    },
    {
      path: '/blog/:id',
      name: 'BlogDetalhe',
      component: () => import('@/presentation/pages/Blog/PageHomeBlog.vue'),
      props: route => ({
        id: Number(route.params.id),
        page: Number(route.query.page) || 1
      })
    }
  ],
})

export default router
