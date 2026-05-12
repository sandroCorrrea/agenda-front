import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";

export class LogoutUsuarioUseCase {
    constructor(private repository: IAuthRepository) {}

    async execute(): Promise<void> {
        await this.repository.logout();
    }
}
