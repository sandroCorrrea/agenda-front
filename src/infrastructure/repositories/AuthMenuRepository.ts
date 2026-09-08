import type { AxiosInstance } from "axios";
import type { IAuthMenuRepository } from "@/domain/repositories/IAuthMenuRepository";
import type { MenuSessaoDTO } from "@/application/dto/Menu/MenuSessaoDTO";

export class AuthMenuRepository implements IAuthMenuRepository {
    constructor(private api: AxiosInstance) {}

    async obterMenuSessao(): Promise<MenuSessaoDTO> {
        const res = await this.api.get<MenuSessaoDTO>("/auth/menu");
        return res.data;
    }
}
