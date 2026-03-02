<script lang="ts" setup>
import Blog from '@/presentation/components/Blog/Blog.vue';
import { useFindAllBlogCategoria } from '@/presentation/composables/BlogCategoria/useFindAllBlogCategoria';
import { useFindAllBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindAllBlogPostagem';

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
</script>

<template>
  <Blog :findAll="findAll" :blogCategorias="blogCategorias" :loading="loading" :error="error"
    :findAllPostagem="findAllPostagem" :blogPostagem="blogPostagem" :loadingPostagem="loadindPostagem"
    :errorPostagem="errorPostagem" :url="url" :total="total" :currentPage="currentPage" :perPage="perPage"
    :lastPage="lastPage" />
</template>