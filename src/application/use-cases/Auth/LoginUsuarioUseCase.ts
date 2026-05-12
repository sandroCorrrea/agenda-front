import type { LoginPostRequestDTO } from "@/application/dto/Auth/LoginPostRequestDTO";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";

export class LoginUsuarioUseCase {
    constructor(private repository: IAuthRepository) {}

    async execute(dto: LoginPostRequestDTO) {
        return this.repository.login(dto);
    }
}
