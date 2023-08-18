import { IsNotEmpty, IsString } from 'class-validator';

export class TargetDialogDto {
    @IsNotEmpty()
    @IsString()
    readonly dialogObjectId: string;
}
