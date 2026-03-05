import type { NewsletterPostResponseDTO } from "@/application/dto/Newsletter/NewsletterPostResponseDTO";
import type { Newsletter } from "@/domain/entities/Newsletter";
import type { INewsletterRepository } from "@/domain/repositories/INewsletterRepository";
import type { AxiosInstance } from "axios";

export class NewsletterRepository implements INewsletterRepository {
    constructor(
        private api: AxiosInstance
    ) { }

    async persist(newsletter: Newsletter): Promise<NewsletterPostResponseDTO> {
        const resp = await this.api.post<NewsletterPostResponseDTO>(
            '/blog/newsletter',
            newsletter
        );
        return resp.data;
    }
}
