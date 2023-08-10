import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserRequestInterface } from './types/user-request.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findCurrent(@Req() req: UserRequestInterface): User {
    return req.user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return await newUser.save();
  }

  async findOne(objectId: string): Promise<User> {
    return await this.userModel.findById(objectId).exec();
  }

  async checkUserCredentials(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userModel.findOne({
      username: loginUserDto.username,
    });
    if (!user) {
      throw new HttpException('wrong email or password', HttpStatus.FORBIDDEN);
    }
    const isPasswordCorrect = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new HttpException('wrong email or password', HttpStatus.FORBIDDEN);
    }
    return user;
  }
}
