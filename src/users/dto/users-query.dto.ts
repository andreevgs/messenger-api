import {IsNotEmpty, IsString} from "class-validator";

export class UsersQueryDto {
    @IsNotEmpty()
    @IsString()
    username: string;
}