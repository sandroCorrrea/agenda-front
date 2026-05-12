import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";
import { ServicoRepository } from "@/infrastructure/repositories/ServicoRepository";
import { PessoaRepository } from "@/infrastructure/repositories/PessoaRepository";
import { UsuarioRepository } from "@/infrastructure/repositories/UsuarioRepository";
import { createPinia } from "pinia";
import router from "@/router/index";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@/presentation/assets/global.css"
import { AvisoRepository } from "@/infrastructure/repositories/AvisoRepository";
import { BlogCategoriaRepository } from "@/infrastructure/repositories/BlogCategoriaRepository";
import { BlogPostagemRepository } from "@/infrastructure/repositories/BlogPostagemRepository";
import { NewsletterRepository } from "@/infrastructure/repositories/NewsletterRepository";
import { MatrizRepository } from "@/infrastructure/repositories/MatrizRepository";
import { ContatoRepository } from "@/infrastructure/repositories/ContatoRepository";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { EnderecoRepository } from "@/infrastructure/repositories/EnderecoRepository";
import { ProtocoloRepository } from "@/infrastructure/repositories/ProtocoloRepository";
import { useAuthStore } from "@/presentation/store/useAuthStore";

const app = createApp(App);
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? import.meta.env.BASE_URL,
    headers: {
        Accept: "application/json"
    }
});

const pessoaRespository = new PessoaRepository(api);
const usuarioRepository = new UsuarioRepository(api);
const servicoRepository = new ServicoRepository(api);
const avisoRepository = new AvisoRepository(api);
const blogCategoria = new BlogCategoriaRepository(api);
const blogPostagem = new BlogPostagemRepository(api);
const blogNewsletter = new NewsletterRepository(api);
const matriz = new MatrizRepository(api);
const contato = new ContatoRepository(api);
const autenticacao = new AuthRepository(api);
const enderecoRepository = new EnderecoRepository(api);
const protocoloRepository = new ProtocoloRepository(api);

app.provide('IPessoaRepository', pessoaRespository);
app.provide('IUsuarioRepository', usuarioRepository);
app.provide('IServicoRepository', servicoRepository);
app.provide('IAvisoRepository', avisoRepository);
app.provide('IBlogCategoriaRepository', blogCategoria);
app.provide('IBlogPostagemRepository', blogPostagem);
app.provide('INewsletterRepository', blogNewsletter);
app.provide('IMatrizRepository', matriz);
app.provide('IContatoRepository', contato);
app.provide('IAuthRepository', autenticacao);
app.provide('IEnderecoRepository', enderecoRepository);
app.provide('IProtocoloRepository', protocoloRepository);

const pinia = createPinia();
app.use(pinia);
const sessao = useAuthStore();
sessao.recuperarSessao();
api.interceptors.request.use((config) => {
    const auth = useAuthStore();
    config.headers = config.headers ?? {};
    config.headers.Accept = "application/json";
    if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
});
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            const auth = useAuthStore();
            auth.encerrarSessao();

            const rotaAtual = router.currentRoute.value;
            if (rotaAtual.name !== "Login") {
                await router.push({
                    name: "Login",
                    query: {
                        sessionExpired: "1",
                        redirect:
                            rotaAtual.fullPath && rotaAtual.fullPath !== "/login"
                                ? rotaAtual.fullPath
                                : undefined
                    }
                });
            }
        }
        return Promise.reject(error);
    }
);
app.use(router);
app.mount("#app");