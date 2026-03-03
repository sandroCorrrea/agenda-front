<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { watch, computed } from 'vue';
import Blog from '@/presentation/components/Blog/Blog.vue';

import { useFindAllBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindAllBlogPostagem';
import { useFindAllBlogCategoriaQtdPostagem } from '@/presentation/composables/BlogCategoria/useFindAllBlogCategoriaQtdPostagem';
import { useFindTagBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindTagBlogPostagem';
import { useFindBlogPostagemById } from '@/presentation/composables/BlogPostagem/useFindBlogPostagemById';
import { useFindRecentBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindRecentBlogPostagem';

const route = useRoute();

const {
  findAll: findAllPostagem,
  blogPostagem,
  total,
  currentPage,
  perPage,
  lastPage,
  loading: loadingPostagem,
  error: errorPostagem,
  url
} = useFindAllBlogPostagem();

const {
  blogPostagem: blogPostagemById,
  findById,
  loading: loadingById,
  error: errorById
} = useFindBlogPostagemById();

const {
  findAllBlogCategoriaQtdPostagem,
  blogCategoriaQtdPostagem
} = useFindAllBlogCategoriaQtdPostagem();

const { findTag, blogPostagemTag } = useFindTagBlogPostagem();
const {findAllRecent, blogPostagemRecent} = useFindRecentBlogPostagem();

const postsToRender = computed(() => {
  if (blogPostagemById.value) {
    return [blogPostagemById.value];
  }
  return blogPostagem.value;
});

watch(
  () => route.params.id,
    async (id) => {
      if (id) {
        await findById(Number(id))
      } else {
        blogPostagemById.value = null;
        await findAllPostagem(1, perPage.value)
      }
    },
  { immediate: true }
)
</script>

<template>
  <Blog
    :findAllPostagem="findAllPostagem"
    :blogPostagem="postsToRender"
    :loadingPostagem="loadingPostagem || loadingById"
    :errorPostagem="errorPostagem || errorById"

    :url="url"
    :total="total"
    :currentPage="currentPage"
    :perPage="perPage"
    :lastPage="lastPage"

    :findAllBlogCategoriaQtdPostagem="findAllBlogCategoriaQtdPostagem"
    :blogCategoriaQtdPostagem="blogCategoriaQtdPostagem"

    :findTag="findTag"
    :blogPostagemTag="blogPostagemTag"

    :findAllRecent="findAllRecent"
    :blogPostagemRecent="blogPostagemRecent"
  />
</template>