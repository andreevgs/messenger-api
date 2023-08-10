import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {UsersService} from './users.service';
import {UserRequestInterface} from "./types/user-request.interface";
import {AccessTokenGuard} from "../auth/guards/access-token.guard";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Get('current')
    @UseGuards(AccessTokenGuard)
    findCurrent(@Req() req: UserRequestInterface) {
        const user = this.usersService.findCurrent(req);
        return {user};
    }
}
