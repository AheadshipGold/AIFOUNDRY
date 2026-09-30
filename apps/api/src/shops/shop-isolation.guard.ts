import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../core/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ShopIsolationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const shopId = request.headers['x-shop-id'] || request.params.shopId || request.body.shopId;

    if (!shopId) {
      // If no shop context is requested, we might let it pass or require it depending on the route.
      // For now, if a route is protected by ShopIsolationGuard, it MUST have a shop context.
      throw new ForbiddenException('Shop ID is required in headers, params, or body.');
    }

    // Authenticate with Better Auth
    const sessionResponse = await this.authService.auth.api.getSession({
      headers: request.headers,
    });

    if (!sessionResponse || !sessionResponse.session) {
      throw new UnauthorizedException('Authentication required.');
    }

    const userId = sessionResponse.session.userId;

    // Verify membership
    const membership = await this.prisma.shopMember.findUnique({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a member of this shop.');
    }

    // Role verification
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(`Requires one of roles: ${requiredRoles.join(', ')}`);
    }

    // Attach shop context to the request for easy access in controllers
    request.shopContext = { shopId, role: membership.role };

    return true;
  }
}
