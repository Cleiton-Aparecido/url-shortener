import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    if (info && info.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expirado');
    }
    if (err || !user) {
      throw new UnauthorizedException('Token inválido ou não fornecido');
    }
    return user;
  }
}
