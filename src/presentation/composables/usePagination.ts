import { useRoute, useRouter } from "vue-router";
import { watch } from "vue";

export function usePagination(fetchFunction: (page: number) => Promise<void>) {
  const route = useRoute();
  const router = useRouter();

  watch(
    () => route.query.page,
    async (newPage) => {

      const page = Number(newPage) || 1;

      if (isNaN(page)) {
        return;
      }
      await fetchFunction(page);
    },
    { immediate: true }
  );

  async function goToPage(page: number) {

    if (!page || isNaN(page) || page < 1) {
      return;
    }

    await router.push({
      query: { ...route.query, page: String(page) }
    });
  }

  return { goToPage };
}