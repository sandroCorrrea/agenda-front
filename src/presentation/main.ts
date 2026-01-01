import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";
import { PessoaRepository } from "@/infrastructure/repositories/PessoaRepository";
import { createPinia } from "pinia";
import router from "@/router/index";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@/presentation/assets/global.css"

const app = createApp(App);
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? import.meta.env.BASE_URL });

const pessoaRespository = new PessoaRepository(api);
app.provide('IPessoaRepository', pessoaRespository);

app.use(createPinia());
app.use(router);
app.mount("#app");