import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import type { RedefinirSenhaComTokenDTO } from "@/application/dto/Auth/RedefinirSenhaComTokenDTO";
import type { ApiMessageResponseDTO } from "@/application/dto/Auth/ApiMessageResponseDTO";

export class RedefinirSenhaComTokenUseCase {
    constructor(private repository: IAuthRepository) {}

    execute(dto: RedefinirSenhaComTokenDTO): Promise<ApiMessageResponseDTO> {
        return this.repository.redefinirSenhaComToken(dto);
    }
}
