import type { MenuSessaoDTO } from "@/application/dto/Menu/MenuSessaoDTO";

export interface IAuthMenuRepository {
    obterMenuSessao(): Promise<MenuSessaoDTO>;
}
