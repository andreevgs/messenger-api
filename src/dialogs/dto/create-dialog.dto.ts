import {IsNotEmpty, IsString} from 'class-validator';

export class CreateDialogDto {
    @IsNotEmpty()
    @IsString()
    readonly username: string;
}
