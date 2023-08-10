import { IsNotEmpty, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsUUID()
  readonly refreshToken: string;
}
