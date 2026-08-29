import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import type { JwtUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => request?.cookies?.['mobilier_at'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret') ?? 'dev-access-secret',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    sellerStatus?: string | null;
    sellerId?: string | null;
  }): Promise<JwtUser> {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      sellerStatus: payload.sellerStatus ?? null,
      sellerId: payload.sellerId ?? null,
    };
  }
}
