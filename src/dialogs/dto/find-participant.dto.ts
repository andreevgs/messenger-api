import { IsNotEmpty, IsString } from 'class-validator';

export class FindParticipantDto {
  @IsNotEmpty()
  @IsString()
  readonly username: string;
}
