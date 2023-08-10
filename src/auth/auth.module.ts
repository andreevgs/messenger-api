import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {UsersService} from "../users/users.service";
import {User, UserSchema} from "../users/schemas/user.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {RefreshToken, RefreshTokenSchema} from "./schemas/refresh-token.schema";

@Module({
  imports: [
      MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: RefreshToken.name, schema: RefreshTokenSchema },
      ])],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
