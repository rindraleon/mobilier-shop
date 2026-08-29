import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** Utilisateur injecté par la stratégie JWT. */
export interface JwtUser {
  id: string;
  email: string;
  role: string;
  sellerStatus?: string | null;
  sellerId?: string | null;
}

type RequestWithUser = Request & { user?: JwtUser };

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
