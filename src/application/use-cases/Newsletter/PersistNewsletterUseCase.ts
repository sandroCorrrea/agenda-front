import type { NewsletterPostResponseDTO } from "@/application/dto/Newsletter/NewsletterPostResponseDTO";
import type { Newsletter } from "@/domain/entities/Newsletter";
import type { INewsletterRepository } from "@/domain/repositories/INewsletterRepository";

export class PersistNewsletterUseCase {
    constructor (
        private repository: INewsletterRepository
    ) {}

    async execute(newsletter: Newsletter): Promise<NewsletterPostResponseDTO>
    {
        return this.repository.persist(newsletter);
    }
}
