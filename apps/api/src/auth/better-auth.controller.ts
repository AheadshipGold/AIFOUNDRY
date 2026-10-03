import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './better-auth';

@Controller('auth')
export class BetterAuthController {
  @All('*')
  async handleBetterAuth(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(auth.handler)(req, res);
  }
}
