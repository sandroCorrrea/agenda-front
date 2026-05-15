import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/presentation/store/useAuthStore'
import { TipoUsuario } from '@/domain/types/TipoUsuario'

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
      path: '/acesso',
      redirect: { name: 'Login' }
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
      path: '/redefinir-senha',
      name: 'RedefinirSenha',
      component: () => import('@/presentation/pages/Pessoa/PageRedefinirSenha.vue')
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
      path: '/bpe',
      name: 'BpeDocumentacao',
      component: () => import('@/presentation/pages/Bpe/PageBpeDocumentacao.vue')
    },
    {
      path: '/protocolo/documentacao-api',
      name: 'ProtocoloDocumentacao',
      component: () => import('@/presentation/pages/Protocolo/PageProtocoloDocumentacao.vue')
    },
    {
      path: '/protocolo/assinar/:token',
      name: 'ProtocoloAssinar',
      component: () => import('@/presentation/pages/Protocolo/PageProtocoloAssinar.vue')
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
      path: '/blog/categorias',
      name: 'BlogCategorias',
      component: () => import('@/presentation/pages/Blog/PageAreaCategoriasBlogAdmin.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Categorias do blog'
      }
    },
    {
      path: '/blog/categorias/nova',
      name: 'BlogCategoriaCadastro',
      component: () => import('@/presentation/pages/Blog/PageCadastroCategoriaBlog.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Cadastrar categoria'
      }
    },
    {
      path: '/blog/categorias/:id/editar',
      name: 'BlogCategoriaEditar',
      component: () => import('@/presentation/pages/Blog/PageEditarCategoriaBlog.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Editar categoria'
      }
    },
    {
      path: '/blog/postagem',
      name: 'BlogPostagem',
      component: () => import('@/presentation/pages/Blog/PageAreaPostagensBlogAdmin.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Postagens do blog'
      }
    },
    {
      path: '/blog/postagem/nova',
      name: 'BlogPostagemCadastro',
      component: () => import('@/presentation/pages/Blog/PageCadastroPostagemBlog.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Cadastrar postagem'
      }
    },
    {
      path: '/blog/postagem/:id/editar',
      name: 'BlogPostagemEditar',
      component: () => import('@/presentation/pages/Blog/PageEditarPostagemBlog.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Editar postagem'
      }
    },
    {
      path: '/blog/:id',
      name: 'BlogDetalhe',
      component: () => import('@/presentation/pages/Blog/PageHomeBlog.vue'),
      props: route => ({
        id: Number(route.params.id),
        page: Number(route.query.page) || 1
      })
    },
    {
      path: '/cliente',
      component: () => import('@/presentation/pages/Pessoa/PageClienteLayout.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.CLIENTE
      },
      children: [
        {
          path: '',
          name: 'AreaCliente',
          redirect: { name: 'ClienteProtocolos' }
        },
        {
          path: 'protocolos',
          name: 'ClienteProtocolos',
          component: () =>
            import('@/presentation/pages/Pessoa/PageClienteProtocolos.vue'),
          meta: { tituloCliente: 'Protocolos' }
        },
        {
          path: 'perfil',
          name: 'ClientePerfil',
          component: () =>
            import('@/presentation/pages/Pessoa/PageClientePerfil.vue')
        },
        {
          path: 'chaves',
          name: 'ClienteChaves',
          component: () =>
            import('@/presentation/pages/Pessoa/PageClienteChaves.vue')
        }
      ]
    },
    {
      path: '/admin/administradores',
      name: 'AdministradorUsuarios',
      component: () => import('@/presentation/pages/Pessoa/PageAreaAdministrador.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Administradores'
      }
    },
    {
      path: '/admin',
      name: 'AdministradorPainel',
      component: () => import('@/presentation/pages/Pessoa/PagePainelAdminInicio.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Início'
      }
    },
    {
      path: '/admin/perfil',
      name: 'AdministradorPerfil',
      component: () => import('@/presentation/pages/Pessoa/PageClientePerfil.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR
      }
    },
    {
      path: '/admin/chaves',
      name: 'AdministradorChaves',
      component: () => import('@/presentation/pages/Pessoa/PageClienteChaves.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR
      }
    },
    {
      path: '/admin/avisos/novo',
      name: 'AdministradorAvisoCadastro',
      component: () => import('@/presentation/pages/Aviso/PageCadastroAviso.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Cadastrar aviso'
      }
    },
    {
      path: '/admin/avisos',
      name: 'AdministradorAvisos',
      component: () => import('@/presentation/pages/Aviso/PageAreaAvisosAdmin.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Avisos'
      }
    },
    {
      path: '/admin/avisos/:id/editar',
      name: 'AdministradorAvisoEditar',
      component: () => import('@/presentation/pages/Aviso/PageEditarAviso.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Editar aviso'
      }
    },
    {
      path: '/admin/clientes/pessoa-fisica',
      name: 'AdministradorClientesPessoaFisica',
      component: () =>
        import('@/presentation/pages/Pessoa/PageAreaClientesFisica.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Pessoa Física'
      }
    },
    {
      path: '/admin/clientes/pessoa-fisica/:id/edit',
      name: 'AdministradorClienteFisicaEditar',
      component: () =>
        import('@/presentation/pages/Pessoa/PageEditarClienteFisica.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Editar cliente'
      }
    },
    {
      path: '/admin/servicos',
      name: 'AdministradorServicos',
      component: () => import('@/presentation/pages/Servico/PageAreaServicosAdmin.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Serviços'
      }
    },
    {
      path: '/admin/servicos/nova',
      name: 'AdministradorServicoCadastro',
      component: () => import('@/presentation/pages/Servico/PageCadastroServico.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Novo serviço'
      }
    },
    {
      path: '/admin/servicos/:id/editar',
      name: 'AdministradorServicoEditar',
      component: () => import('@/presentation/pages/Servico/PageEditarServico.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Editar serviço'
      }
    },
    {
      path: '/admin/protocolos',
      name: 'AdministradorProtocolos',
      component: () => import('@/presentation/pages/Protocolo/PageAreaProtocolosAdmin.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Protocolos'
      }
    },
    {
      path: '/admin/protocolos/novo',
      name: 'AdministradorProtocoloCadastro',
      component: () => import('@/presentation/pages/Protocolo/PageCadastroProtocolo.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Novo protocolo'
      }
    },
    {
      path: '/admin/protocolos/:id/editar',
      name: 'AdministradorProtocoloEditar',
      component: () => import('@/presentation/pages/Protocolo/PageEditarProtocolo.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Editar protocolo'
      }
    },
    {
      path: '/admin/home-carrossel',
      name: 'AdministradorHomeCarrossel',
      component: () =>
        import('@/presentation/pages/HomeCarrosselImagem/PageAreaHomeCarrosselAdmin.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Carrossel da Home'
      }
    },
    {
      path: '/admin/home-carrossel/novo',
      name: 'AdministradorHomeCarrosselCadastro',
      component: () =>
        import('@/presentation/pages/HomeCarrosselImagem/PageCadastroHomeCarrosselImagem.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Nova imagem do carrossel'
      }
    },
    {
      path: '/admin/home-carrossel/:id/editar',
      name: 'AdministradorHomeCarrosselEditar',
      component: () =>
        import('@/presentation/pages/HomeCarrosselImagem/PageEditarHomeCarrosselImagem.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Editar imagem do carrossel'
      }
    },
    {
      path: '/admin/empresas',
      name: 'AdministradorEmpresas',
      component: () => import('@/presentation/pages/Pessoa/PageAreaEmpresas.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Empresas'
      }
    },
    {
      path: '/admin/empresas/:id/edit',
      name: 'AdministradorEmpresaEditar',
      component: () =>
        import('@/presentation/pages/Pessoa/PageEditarEmpresa.vue'),
      meta: {
        requerAutenticacao: true,
        perfilPermitido: TipoUsuario.ADMINISTRADOR,
        tituloCliente: 'Editar empresa'
      }
    }
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (
    to.name === 'Aviso' &&
    auth.estaAutenticado &&
    auth.usuario?.tipo_usuario === TipoUsuario.ADMINISTRADOR
  ) {
    next({ name: 'AdministradorAvisos' })
    return
  }
  if (to.meta.requerAutenticacao && !auth.estaAutenticado) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  const permitido = to.meta.perfilPermitido as string | undefined
  if (permitido && auth.usuario && auth.usuario.tipo_usuario !== permitido) {
    if (auth.usuario.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
      next({ name: 'AdministradorPainel' })
    } else {
      next({ name: 'AreaCliente' })
    }
    return
  }
  next()
})

export default router
