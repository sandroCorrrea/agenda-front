import type { MenuModuloCatalogoDTO } from "@/application/dto/Menu/MenuSessaoDTO";

export interface IMenuRepository {
    listarCatalogo(atribuivel?: boolean): Promise<MenuModuloCatalogoDTO[]>;
}
