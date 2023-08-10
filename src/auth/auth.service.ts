import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';
import { LoginResponseInterface } from './types/login-response.interface';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { UserRequestInterface } from '../users/types/user-request.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getTokensPair(user: User) {
    const expiredAt = new Date(Date.now() + 3600000);
    const token = uuidv4();
    const refreshToken = new this.refreshTokenModel({
      refreshToken: token,
      expirationDate: expiredAt,
      user,
    });
    await refreshToken.save();
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken,
    };
  }

  async getNewTokensPair(
    @Req() req: UserRequestInterface,
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseInterface> {
    const expiredAt = new Date(Date.now() + 3600000);
    const token = uuidv4();
    const refreshToken = await this.refreshTokenModel
      .findOne(refreshTokenDto)
      .populate({
        path: 'user',
      })
      .exec();
    if (!refreshToken) {
      throw new HttpException('incorrect refresh token', HttpStatus.FORBIDDEN);
    }
    await this.refreshTokenModel
      .updateOne(refreshTokenDto, {
        refreshToken: token,
        expirationDate: expiredAt,
      })
      .exec();
    return {
      accessToken: this.generateAccessToken(refreshToken.user),
      refreshToken: token,
    };
  }

  generateAccessToken(user: User): string {
    return jwt.sign(
      {
        id: user['_id'],
        username: user.username,
      },
      'secret',
      {
        expiresIn: '1h',
      },
    );
  }

  async verifyAccessToken(authorizationHeader: string): Promise<User | null> {
    let user: User | null = null;
    if (!authorizationHeader) {
      return user;
    }
    const token = authorizationHeader.split(' ');
    const tokenType = token[0];

    const tokenValue = tokenType === 'Bearer' ? token[1] : null;
    try {
      const decode = jwt.verify(tokenValue, 'secret');
      user = await this.usersService.findOne(decode['id']);
      return user;
    } catch (err) {
      user = null;
    }
    return user;
  }
}
