<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { watch, computed } from 'vue';
import Blog from '@/presentation/components/Blog/Blog.vue';

import { useFindAllBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindAllBlogPostagem';
import { useFindAllBlogCategoriaQtdPostagem } from '@/presentation/composables/BlogCategoria/useFindAllBlogCategoriaQtdPostagem';
import { useFindTagBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindTagBlogPostagem';
import { useFindBlogPostagemById } from '@/presentation/composables/BlogPostagem/useFindBlogPostagemById';
import { useFindRecentBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindRecentBlogPostagem';
import { useFindCategoriaByIdBlogPostagem } from '@/presentation/composables/BlogPostagem/useFindCategoriaByIdBlogPostagem';
import { useFindBlogPostagemByNome } from '@/presentation/composables/BlogPostagem/useFindBlogPostagemByNome';
import { usePersistNewsletter } from '@/presentation/composables/Newsletter/usePersistNewsletter';

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

const { findCategoriaByIdBlogPostagem, findAllCategorias } = useFindCategoriaByIdBlogPostagem();

const { findBlogPostagemByNome, findAllNome } = useFindBlogPostagemByNome();

const {
  loading: loadingNewsletter,
  error: errorNewsletter,
  responseNewsletter,
  persistNewsletter
} = usePersistNewsletter();

const categoriaId = computed(() => {
  return route.query.categoria ? Number(route.query.categoria) : null;
});

const tagName = computed(() => {
  return route.query.tag ? String(route.query.tag) : null;
});

const postsToRender = computed(() => {
  if (blogPostagemById.value) {
    return [blogPostagemById.value];
  }
  if (categoriaId.value) {
    return findAllCategorias.value;
  }
  if (tagName.value) {
    return findAllNome.value;
  }
  return blogPostagem.value;
});

watch(
  () => [route.params.id, route.query.categoria, route.query.tag],
  async ([id, categoria, tag]) => {
    try {
      blogPostagemById.value = null;
      findAllCategorias.value = [];
      findAllNome.value = [];
      if (id) {
        await findById(Number(id));
        return;
      }
      if (categoria) {
        await findCategoriaByIdBlogPostagem(Number(categoria));
        return;
      }
      if (tag) {
        await findBlogPostagemByNome(String(tag));
        return;
      }
      await findAllPostagem(1, perPage.value);

    } catch (e) {
      console.error('Erro ao carregar blog:', e);
    }
  },
  { immediate: true }
);
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

    :findCategoriaByIdBlogPostagem = "findCategoriaByIdBlogPostagem"
    :findAllCategorias = "findAllCategorias"

    :findBlogPostagemByNome = "findBlogPostagemByNome"
    :findAllNome = "findAllNome"

    :loadingNewsletter = "loadingNewsletter"
    :errorNewsletter = "errorNewsletter"
    :responseNewsletter = "responseNewsletter"
    :persistNewsletter = "persistNewsletter"
  />
</template>