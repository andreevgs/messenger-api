import {IsOptional, IsString} from "class-validator";

export class EditUserDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    secondName?: string;

    @IsString()
    @IsOptional()
    password?: string;
}