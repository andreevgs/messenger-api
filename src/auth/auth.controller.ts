import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UsersService } from '../users/users.service';
import { UserRequestInterface } from '../users/types/user-request.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  async createUser(@Body('user') createuserDto: CreateUserDto) {
    return await this.usersService.createUser(createuserDto);
  }

  @Post('signin')
  @HttpCode(200)
  async login(@Body('user') loginUserDto: LoginUserDto) {
    const user = await this.usersService.checkUserCredentials(loginUserDto);
    return await this.authService.getTokensPair(user);
  }

  @Get('tokens')
  async getNewTokensPair(
    @Req() req: UserRequestInterface,
    @Body() refreshToken: RefreshTokenDto,
  ) {
    return await this.authService.getNewTokensPair(req, refreshToken);
  }
}
