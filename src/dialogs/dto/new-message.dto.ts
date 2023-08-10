import {IsNotEmpty, IsString} from "class-validator";

export class NewMessageDto {
    @IsNotEmpty()
    @IsString()
    readonly dialogObjectId: string;

    @IsNotEmpty()
    @IsString()
    readonly text: string;
}