<script lang="ts" setup>
import Blog from '@/presentation/components/Blog/Blog.vue';
import { useFindAllBlogCategoria } from '@/presentation/composables/BlogCategoria/useFindAllBlogCategoria';
import { useFindAllBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindAllBlogPostagem';
import { useFindAllBlogCategoriaQtdPostagem } from '@/presentation/composables/BlogCategoria/useFindAllBlogCategoriaQtdPostagem';
import { useFindTagBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindTagBlogPostagem';

const { findAll, blogCategorias, loading, error } = useFindAllBlogCategoria();
const {
  findAll: findAllPostagem,
  blogPostagem,
  total,
  currentPage,
  perPage,
  lastPage,
  loading: loadindPostagem,
  error: errorPostagem,
  url
} = useFindAllBlogPostagem();
const { findAllBlogCategoriaQtdPostagem, blogCategoriaQtdPostagem } = useFindAllBlogCategoriaQtdPostagem();
const { findTag, blogPostagemTag } = useFindTagBlogPostagem();
</script>

<template>
  <Blog :findAll="findAll" :blogCategorias="blogCategorias" :loading="loading" :error="error"
    :findAllPostagem="findAllPostagem" :blogPostagem="blogPostagem" :loadingPostagem="loadindPostagem"
    :errorPostagem="errorPostagem" :url="url" :total="total" :currentPage="currentPage" :perPage="perPage"
    :lastPage="lastPage" :findAllBlogCategoriaQtdPostagem="findAllBlogCategoriaQtdPostagem"
    :blogCategoriaQtdPostagem="blogCategoriaQtdPostagem" :findTag="findTag" :blogPostagemTag="blogPostagemTag"  />
</template>