import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";

export class DownloadAvisoPdfUseCase {
    constructor(
        private repository: IAvisoRepository
    ) {}

    async execute(id: number): Promise<Blob> {
        return this.repository.downloadPdf(id);
    }
};
