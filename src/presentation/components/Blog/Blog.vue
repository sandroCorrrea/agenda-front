<script lang="ts" setup>
import { BlogCategoria } from '@/domain/entities/BlogCategoria';
import noPost from '@/presentation/assets/img/no-post.png';
import { usePagination } from '@/presentation/composables/usePagination';
import BasePagination from '../Shared/BasePagination.vue';
import BaseSkeleton from '../Shared/BaseSkeleton.vue';
import {
    RiArrowRightDoubleLine
} from "@remixicon/vue";

const props = withDefaults(defineProps<{
    findAll: (page?: number, per_page?: number, nome?: string) => Promise<void>;
    blogCategorias: BlogCategoria[];
    loading: boolean;
    error: string | null;
    findAllPostagem: (page?: number, per_page?: number, nome?: string) => Promise<void>;
    blogPostagem: any[];
    loadingPostagem: boolean;
    errorPostagem: string | null;
    url: string,
    total: number;
    currentPage: number;
    perPage: number;
    lastPage: number;
}>(), {
    blogCategorias: () => [],
    blogPostagem: () => [],
    error: null,
    errorPostagem: null,
    url: ''
});

const { goToPage } = usePagination(
    async (page: number) => {
        await props.findAllPostagem(page, props.perPage)
    }
);

function formatarData(data: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(data)
}

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

            <div class="row g-4" v-if="blogPostagem?.length">
                <div class="col-12 col-lg-8 order-2 order-lg-1">
                    <div v-if="!blogPostagem.length && !loadingPostagem" class="text-center py-5">
                        <img :src="noPost" alt="Nenhuma postagem" class="img-fluid mb-3"
                            style="max-width: 200px; opacity: 0.7" />
                        <p class="text-muted">Nenhum artigo encontrado.</p>
                    </div>

                    <div v-else class="posts-list">
                        <div v-for="post in blogPostagem" :key="post.id" class="blog-card mb-5">
                            <div class="blog-img">
                                <img :src="`${url}/${post.imagem}`" :alt="post?.imagem" class="img-fluid" />
                                <span class="blog-date"> {{ formatarData(post.dataCriacao) }}</span>
                            </div>
                            <div class="blog-content">
                                <h3 class="blog-title">
                                    <router-link :to="`/blog/${post.id}`">{{ post.nome }}</router-link>
                                </h3>
                                <p class="blog-text" v-if="post.descricao.length > 90">
                                    {{ post.descricao.slice(0, 90) }} ...
                                </p>

                                <p class="blog-text" v-else>
                                    {{ post.descricao }}
                                </p>
                                <div class="blog-meta">
                                    <div class="blog-author">
                                        <img :src="post.autor_imagem ? `/storage/usuarios/${post.autor_imagem}` : '/assets/img/default-avatar.svg'"
                                            :alt="post.autor" class="img-fluid" />
                                        <span>Por {{ post.autor }}</span>
                                    </div>
                                    <router-link :to="`/blog/${post.id}`" class="read-more-btn">
                                        <span>Ler mais</span>
                                        <RiArrowRightDoubleLine />
                                    </router-link>
                                </div>
                            </div>
                        </div>

                        <BasePagination :currentPage="currentPage" :lastPage="lastPage" @change="goToPage" />
                    </div>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
.blog-page {
    background: linear-gradient(180deg, rgba(250, 250, 250, 1) 0%, rgba(245, 247, 250, 1) 100%);
    min-height: 100vh;
    padding-top: 2rem;
    padding-bottom: 2rem;
}

.page-servicos h1 {
    font-size: 1.5rem;
    font-weight: 700;
}

.blog-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(20, 30, 40, 0.04);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(20, 30, 40, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.blog-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(20, 30, 40, 0.1);
}

.blog-img {
    position: relative;
    height: 240px;
    overflow: hidden;
}

.blog-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.blog-card:hover .blog-img img {
    transform: scale(1.05);
}

.blog-date {
    position: absolute;
    bottom: 16px;
    left: 16px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    padding: 0.5rem 1rem;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #2da0a8;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.blog-content {
    padding: 1.5rem;
}

.blog-title {
    font-size: 1.35rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    line-height: 1.4;
}

.blog-title a {
    color: #1e293b;
    text-decoration: none;
    transition: color 0.2s;
}

.blog-title a:hover {
    color: #2da0a8;
}

.blog-text {
    color: #475569;
    line-height: 1.7;
    margin-bottom: 1rem;
}

.blog-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #e9eef2;
    padding-top: 1rem;
    margin-top: 0.5rem;
}

.blog-author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.blog-author img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.blog-author span {
    font-size: 0.95rem;
    color: #334155;
    font-weight: 500;
}

.read-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #2da0a8;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition: gap 0.2s;
}

.read-more-btn:hover {
    gap: 0.5rem;
    color: #1e7e84;
}

.sidebar {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(20, 30, 40, 0.04);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(20, 30, 40, 0.04);
}

.sidebar-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
    color: #1e293b;
    position: relative;
    padding-bottom: 0.5rem;
}

.sidebar-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    border-radius: 3px;
}

.search-form .input-group {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.search-form .form-control {
    background: #f6fbfc;
    border: 1px solid #e6f0f4;
    border-right: none;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    border-radius: 12px 0 0 12px;
}

.search-form .form-control:focus {
    outline: none;
    border-color: #5c6bc0;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.search-form .btn-primary {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    border: none;
    padding: 0 1.2rem;
    border-radius: 0 12px 12px 0;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-form .btn-primary:hover {
    background: linear-gradient(90deg, #4a5bb0 0%, #248f97 100%);
}

.categories-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.categories-list li {
    margin-bottom: 0.75rem;
}

.categories-list a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #334155;
    text-decoration: none;
    font-size: 0.95rem;
    padding: 0.5rem 0;
    border-bottom: 1px dashed #e2e8f0;
    transition: color 0.2s;
}

.categories-list a:hover {
    color: #2da0a8;
}

.categories-list span {
    background: #f1f5f9;
    padding: 0.2rem 0.6rem;
    border-radius: 30px;
    font-size: 0.8rem;
    color: #475569;
}

.recent-post {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.25rem;
    align-items: center;
}

.recent-post-img {
    width: 70px;
    height: 70px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid #e9eef2;
}

.recent-post-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.recent-post-content h5 {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    line-height: 1.4;
}

.recent-post-content h5 a {
    color: #1e293b;
    text-decoration: none;
}

.recent-post-content h5 a:hover {
    color: #2da0a8;
}

.recent-post-content span {
    font-size: 0.8rem;
    color: #64748b;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tag-link {
    display: inline-block;
    padding: 0.4rem 1rem;
    background: #f1f5f9;
    border-radius: 30px;
    color: #334155;
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.tag-link:hover {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    color: #ffffff;
    border-color: transparent;
    transform: translateY(-2px);
}

.newsletter-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 16px;
    padding: 1.75rem;
    color: #ffffff;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.newsletter-card h4 {
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: #ffffff;
}

.newsletter-card p {
    color: #cbd5e1 !important;
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
}

.newsletter-card .form-control {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border-radius: 12px;
    padding: 0.75rem 1rem;
}

.newsletter-card .form-control::placeholder {
    color: #94a3b8;
}

.newsletter-card .form-control:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: #5c6bc0;
    box-shadow: none;
}

.newsletter-card .btn-primary {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    border: none;
    border-radius: 12px;
    padding: 0.75rem;
    font-weight: 600;
    margin-top: 0.5rem;
}

.newsletter-card .btn-primary:hover {
    background: linear-gradient(90deg, #4a5bb0 0%, #248f97 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(45, 160, 168, 0.3);
}

.pagination {
    gap: 0.25rem;
    margin-top: 2rem;
}

.page-item .page-link {
    border: none;
    background: #ffffff;
    color: #334155;
    border-radius: 8px !important;
    padding: 0.5rem 1rem;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    border: 1px solid #e2e8f0;
}

.page-item.active .page-link {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    color: #ffffff;
    border-color: transparent;
}

.page-item.disabled .page-link {
    background: #f1f5f9;
    color: #94a3b8;
    border-color: #e2e8f0;
    pointer-events: none;
}

.page-item .page-link:hover:not(.disabled) {
    background: #e6f0f4;
    border-color: #cbd5e1;
}

@media (max-width: 991.98px) {
    .blog-card {
        margin-bottom: 1.5rem;
    }

    .sidebar {
        margin-bottom: 1.5rem;
    }

    .recent-post {
        flex-direction: row;
    }
}

@media (max-width: 575.98px) {
    .blog-img {
        height: 200px;
    }

    .blog-content {
        padding: 1.25rem;
    }

    .blog-title {
        font-size: 1.2rem;
    }

    .sidebar {
        padding: 1.25rem;
    }
}

.bx {
    vertical-align: middle;
}
</style>