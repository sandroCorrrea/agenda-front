import type { NewsletterPostResponseDTO } from "@/application/dto/Newsletter/NewsletterPostResponseDTO";
import type { Newsletter } from "../entities/Newsletter";

export interface INewsletterRepository {
    persist(newsletter: Newsletter): Promise<NewsletterPostResponseDTO>
}

