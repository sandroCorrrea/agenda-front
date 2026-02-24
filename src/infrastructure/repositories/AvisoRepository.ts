import type { AxiosInstance } from "axios";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";
import { Aviso } from "@/domain/entities/Aviso";

export class AvisoRepository implements IAvisoRepository {
    constructor(
        private api: AxiosInstance
    ) {}

    async findAll(page: number, per_page: number, nome?: string): Promise<Array<Aviso>>
    {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('per_page', String(per_page));
        if (nome && nome.trim().length > 0) params.set('nome', nome);

        const resp = await this.api.get(`/aviso?${params.toString()}`);
        const data = resp.data;
        const items = Array.isArray(data) ? data : (data.aviso ?? data.data ?? []);
        return items.map((item: any) => new Aviso(
            item.id,
            item.nome,
            item.descricao,
            item.expiracao ? (new Date(item.expiracao) as any) : (undefined as any)
        ));
    }

    async downloadPdf(id: number): Promise<Blob> {
        const token = import.meta.env.VITE_TOKEN_API_AVISO;
        const response = await this.api.get(`/aviso/${id}/pdf`, {
            headers: {
                'X-AVISO-API-KEY': token
            },
            responseType: 'blob'
        });
        return response.data;
    }
}
