import type { AxiosInstance } from "axios";
import type { IMenuRepository } from "@/domain/repositories/IMenuRepository";
import type { MenuModuloCatalogoDTO } from "@/application/dto/Menu/MenuSessaoDTO";

type CatalogoApiResponse = {
    data: MenuModuloCatalogoDTO[];
};

export class MenuRepository implements IMenuRepository {
    constructor(private api: AxiosInstance) {}

    async listarCatalogo(atribuivel?: boolean): Promise<MenuModuloCatalogoDTO[]> {
        const res = await this.api.get<CatalogoApiResponse>("/menu/catalogo", {
            params:
                atribuivel === undefined
                    ? undefined
                    : { atribuivel: atribuivel ? 1 : 0 }
        });
        return res.data.data ?? [];
    }
}
