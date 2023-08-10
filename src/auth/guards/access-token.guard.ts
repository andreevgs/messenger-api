import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { UserRequestInterface } from '../../users/types/user-request.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<UserRequestInterface>();
        if (request.user) {
            return true;
        }
        throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
    }
}
