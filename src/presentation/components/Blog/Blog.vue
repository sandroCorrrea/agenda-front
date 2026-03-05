<script lang="ts" setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import noPost from '@/presentation/assets/img/no-post.png';
import profile from '@/presentation/assets/img/profile.svg';

import { usePagination } from '@/presentation/composables/usePagination';
import { useNavigation } from '@/shared/composables/useNavigation';
import { formatarData } from '@/shared/utils/date.util';

import BasePagination from '../Shared/BasePagination.vue';
import BaseSkeleton from '../Shared/BaseSkeleton.vue';

import {
    RiArrowRightDoubleLine,
    RiSearchLine,
    RiArrowLeftLine
} from "@remixicon/vue";

const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const searchError = ref(false);
const newsletterEmail = ref('');

const props = withDefaults(defineProps<{
    findAllPostagem: (page?: number, per_page?: number, nome?: string) => Promise<void>;
    blogPostagem: any[];
    loadingPostagem: boolean;
    errorPostagem: string | null;
    url: string;
    total: number;
    currentPage: number;
    perPage: number;
    lastPage: number;

    findAllBlogCategoriaQtdPostagem: () => Promise<void>;
    blogCategoriaQtdPostagem: any[];

    findTag: () => Promise<void>;
    blogPostagemTag: any[];

    findAllRecent: (page: number, per_page: number) => Promise<void>;
    blogPostagemRecent: any[];

    findCategoriaByIdBlogPostagem: (id: number) => Promise<void>;
    findAllCategorias: any[];

    findBlogPostagemByNome: (nome: string) => Promise<void>;
    findAllNome: any[];
}>(), {
    blogPostagem: () => [],
    errorPostagem: null,
    url: '',
    blogCategoriaQtdPostagem: () => [],
    blogPostagemRecent: () => [],
    blogPostagemTag: () => [],
    findAllCategorias: () => []
});

const { irPara } = useNavigation();

const { goToPage } = usePagination(
    async (page: number) => {
        await props.findAllPostagem(page, props.perPage);
    }
);

onMounted(() => {
    props.findAllBlogCategoriaQtdPostagem();
    props.findTag();
    props.findAllRecent(1, 3);
});

const isDetail = computed(() =>
  Boolean(route.params.id) ||
  Boolean(route.query.categoria) ||
  Boolean(route.query.tag)
);

const filtroAtivo = computed(() => {
    if (route.query.categoria) {
        return {
            tipo: 'Categoria',
            nome: `ID ${route.query.categoria}`
        };
    }
    if (route.query.tag) {
        return {
            tipo: 'Tag',
            nome: `ID ${route.query.tag}`
        };
    }
    if (route.params.id && props.blogPostagem.length === 1) {
        return {
            tipo: 'Post',
            nome: props.blogPostagem[0].nome
        };
    }

    return null;
});

const handleInput = () => {
    if (searchQuery.value.trim()) {
        searchError.value = false;
    }
};

const handleSearch = () => {
    const termo = searchQuery.value.trim();

    if (!termo) {
        searchError.value = true;
        return;
    }

    searchError.value = false;

    router.push({
        path: '/blog',
        query: {
            tag: termo
        }
    });

    searchQuery.value = '';
};
</script>

<template>
    <article class="page-servicos d-flex align-items-start min-vh-100 py-4">
        <div class="container">
            <div
                class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                <div class="mb-2 mb-md-0">
                    <h1 class="section-title">Blog</h1>
                    <p class="text-muted">
                        Conteúdo atualizado para manter você informado sobre o mundo contábil
                    </p>
                </div>
            </div>

            <div class="row g-5" v-if="blogPostagem?.length">
                <div class="col-12 col-lg-8 order-2 order-lg-1">
                    <div v-if="!blogPostagem.length && !loadingPostagem" class="text-center py-5">
                        <img :src="noPost" alt="Nenhuma postagem" class="img-fluid mb-3"
                            style="max-width: 200px; opacity: 0.7" />
                        <p class="text-muted">Nenhum artigo encontrado.</p>
                    </div>

                    <div v-if="filtroAtivo" class="filtro-alert mb-4">
                        <strong>Filtro aplicado:</strong>
                        {{ filtroAtivo.tipo }}
                    </div>

                    <div class="posts-list">
                        <div v-if="isDetail" class="mb-4">
                        <button
                            @click="irPara('Blog')"
                            class="btn-back d-flex align-items-center gap-2 btn btn-sm"
                        >
                            <RiArrowLeftLine />
                            <span class="label">Voltar para o Blog</span>
                        </button>
                        </div>

                        <div v-for="post in blogPostagem" :key="post.id" class="blog-card">
                            <div class="blog-img">
                                <img :src="`${url}/${post.imagem}`" :alt="post?.imagem" class="img-fluid" />

                                <div class="blog-dates">
                                    <span class="blog-date">
                                        Publicado em {{ formatarData(new Date(post.dataCriacao)) }}
                                    </span>

                                    <span v-if="post.dataAlteracao && post.dataAlteracao !== post.dataCriacao"
                                        class="blog-update">
                                        Atualizado em {{ formatarData(new Date(post.dataAlteracao)) }}
                                    </span>
                                </div>
                            </div>

                            <div class="blog-content">
                                <h3 class="blog-title">
                                    <router-link :to="`/blog/${post.id}`">{{ post.nome }}</router-link>
                                </h3>

                                <p class="blog-text">
                                    {{ isDetail ? post.descricao : (post.descricao.length > 120 
                                        ? post.descricao.slice(0, 120) + ' ...' 
                                        : post.descricao) }}
                                </p>

                                <div class="blog-meta">
                                    <div class="blog-author">
                                        <img :src="post.autor_imagem ? `/storage/usuarios/${post.autor_imagem}` : profile"
                                            :alt="post.autor" />
                                        <span>Por Sandro Corrêa Rocha Júnior</span>
                                    </div>

                                    <router-link v-if="!isDetail" :to="`/blog/${post.id}`" class="read-more-btn">
                                        <span>Ler mais</span>
                                        <RiArrowRightDoubleLine />
                                    </router-link>
                                </div>
                            </div>
                        </div>

                        <BasePagination 
                            v-if="!isDetail"
                            :currentPage="currentPage" 
                            :lastPage="lastPage" 
                            @change="goToPage" 
                        />
                    </div>
                </div>
                <div class="col-12 col-lg-4 order-1 order-lg-2">
                    <div class="sidebar mb-4">
                        <h3 class="sidebar-title">Buscar</h3>
                        <form class="search-form" @submit.prevent="handleSearch">
                            <div class="input-group">
                               <input
                                    v-model="searchQuery"
                                    @input="handleInput"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': searchError }"
                                    placeholder="Digite sua busca..."
                                />
                                <button class="btn btn-primary" type="submit">
                                    <RiSearchLine />
                                </button>
                                <div class="invalid-feedback">
                                    Digite um termo para realizar a busca.
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="sidebar mb-4" v-if="blogCategoriaQtdPostagem?.length">
                        <h3 class="sidebar-title">Categorias</h3>
                        <ul class="categories-list">
                            <li v-for="cat in blogCategoriaQtdPostagem" :key="cat.id">
                                <router-link :to="`/blog?categoria=${cat.id}`">
                                    {{ cat.nome }} <span>({{ cat.quantidade }})</span>
                                </router-link>
                            </li>
                        </ul>
                    </div>

                    <div class="sidebar mb-4" v-if="blogPostagemRecent?.length">
                        <h3 class="sidebar-title">Posts Recentes</h3>
                        <div v-for="post in blogPostagemRecent" :key="post.id" class="recent-post">
                            <div class="recent-post-img">
                                <img :src="`${url}/${post.imagem}`" :alt="post?.imagem" class="img-fluid" />
                            </div>
                            <div class="recent-post-content">
                                <h5>
                                    <router-link :to="`/blog/${post.id}`">{{ post.nome }}</router-link>
                                </h5>
                                <span>{{ formatarData(post.dataAlteracao) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="sidebar mb-4" v-if="blogPostagemTag?.length">
                        <h3 class="sidebar-title">Tags</h3>
                        <div class="tags">
                            <router-link v-for="tag in blogPostagemTag" :key="tag.nome" :to="`/blog?tag=${tag.nome}`"
                                class="tag-link">
                                {{ tag.nome }}
                            </router-link>
                        </div>
                    </div>

                    <div class="newsletter-card">
                        <h4>Assine nossa Newsletter</h4>
                        <p class="text-muted">Receba as últimas notícias e atualizações no seu e-mail.</p>
                        <form @submit.prevent="subscribeNewsletter">
                            <div class="mb-3">
                                <input v-model="newsletterEmail" type="email" class="form-control"
                                    placeholder="Seu e-mail" required />
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Assinar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
.page-servicos {
    background: linear-gradient(180deg, rgba(250, 250, 250, 1) 0%, rgba(245, 247, 250, 1) 100%);
    padding-top: 6rem;
    padding-bottom: 4rem;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    position: relative;
    display: inline-block;
    padding-bottom: .5rem;
    margin-bottom: 2rem;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    border-radius: 3px;
}


.blog-card {
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.06);
    transition: all 0.3s ease;
    margin-bottom: 3rem;
}

.blog-img {
    position: relative;
    height: 280px;
    overflow: hidden;
}


.blog-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.blog-dates {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.blog-date {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    color: #fff;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 8px 18px rgba(45, 160, 168, 0.25);
}

.blog-update {
    background: rgba(255, 255, 255, 0.95);
    color: #475569;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 500;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.blog-body {
    padding: 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.blog-content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.blog-title {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.5;
    margin: 0;
}

.blog-title a {
    color: #0f172a;
    text-decoration: none;
}

.blog-text {
    color: #64748b;
    line-height: 1.8;
    font-size: 1rem;
    margin: 0;
}

.blog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.blog-author {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.blog-author img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

.blog-author span {
    font-size: 0.95rem;
    font-weight: 500;
    color: #334155;
}

.read-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.6rem 1.2rem;
    border-radius: 999px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    color: #fff;
    text-decoration: none;
    transition: all 0.3s ease;
}

.blog-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .blog-img {
        height: 220px;
    }

    .blog-title {
        font-size: 1.2rem;
    }

    .blog-content {
        padding: 1.5rem;
    }

    .blog-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}

.sidebar {
    background: #ffffff;
    padding: 1.8rem;
    border-radius: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
    border: 1px solid rgba(15, 23, 42, 0.04);
    transition: all 0.3s ease;
}

.sidebar:hover {
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);
}

.sidebar-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    position: relative;
    padding-bottom: .6rem;
    color: #0f172a;
}

.sidebar-title::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
}

.search-form .form-control {
    border-radius: 12px 0 0 12px;
    border: 1px solid #e2e8f0;
    padding: 0.75rem 1rem;
}

.search-form .btn {
    border-radius: 0 12px 12px 0;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    border: none;
}

.categories-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.categories-list li {
    margin-bottom: 0.8rem;
}

.categories-list a {
    display: flex;
    justify-content: space-between;
    text-decoration: none;
    color: #334155;
    font-weight: 500;
    padding: 0.5rem 0.7rem;
    border-radius: 10px;
    transition: all 0.2s ease;
}

.categories-list a:hover {
    background: rgba(92, 107, 192, 0.08);
    color: #5c6bc0;
}

.recent-post {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.2rem;
}

.recent-post-img img {
    width: 75px;
    height: 75px;
    object-fit: cover;
    border-radius: 12px;
}

.recent-post-content h5 {
    font-size: 0.95rem;
    margin: 0 0 0.3rem 0;
    line-height: 1.4;
}

.recent-post-content a {
    text-decoration: none;
    color: #0f172a;
    font-weight: 600;
}

.recent-post-content a:hover {
    color: #5c6bc0;
}

.recent-post-content span {
    font-size: 0.75rem;
    color: #64748b;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}

.tag-link {
    font-size: 0.75rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    text-decoration: none;
    background: rgba(92, 107, 192, 0.08);
    color: #5c6bc0;
    font-weight: 500;
    transition: all 0.2s ease;
}

.tag-link:hover {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    color: #fff;
}

.newsletter-card {
    background: linear-gradient(135deg, #5c6bc0 0%, #2da0a8 100%);
    padding: 2rem;
    border-radius: 20px;
    color: #fff;
    box-shadow: 0 15px 35px rgba(45, 160, 168, 0.25);
}

.newsletter-card h4 {
    font-weight: 700;
    margin-bottom: 0.8rem;
}

.newsletter-card p {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    opacity: 0.9;
}

.newsletter-card .form-control {
    border-radius: 12px;
    border: none;
    padding: 0.75rem 1rem;
}

.newsletter-card .btn {
    border-radius: 12px;
    background: #ffffff;
    color: #5c6bc0;
    font-weight: 600;
    border: none;
    transition: all 0.2s ease;
}

.newsletter-card .btn:hover {
    background: #f1f5f9;
}

.btn-back {
  background: transparent;
  border: 1px solid #dee2e6;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  color: #495057;
  transition: all 0.25s ease;
}

.btn-back i {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.btn-back:hover i {
  transform: translateX(-3px);
}

.filtro-alert {
    background: rgba(92, 107, 192, 0.08);
    border: 1px solid rgba(92, 107, 192, 0.2);
    padding: 0.8rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    color: #334155;
}


@media (max-width: 576px) {
    .filtro-alert {
        font-size: 0.8rem;
        text-align: center;
    }
}

@media (max-width: 992px) {
    .sidebar {
        margin-top: 2rem;
    }
}

@media (max-width: 576px) {
  .btn-back {
    width: 100%;
    justify-content: center;
  }

  .btn-back .label {
    font-size: 0.9rem;
  }
}
</style>