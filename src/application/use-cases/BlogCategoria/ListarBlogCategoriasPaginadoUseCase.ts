import type { BlogCategoriaListagemResponseDTO } from "@/application/dto/BlogCategoria/BlogCategoriaListagemResponseDTO";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";

export class ListarBlogCategoriasPaginadoUseCase {
    constructor(private repository: IBlogCategoriaRepository) {}

    execute(params?: {
        page?: number;
        per_page?: number;
    }): Promise<BlogCategoriaListagemResponseDTO> {
        return this.repository.listPaginated(params);
    }
}
