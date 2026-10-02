import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService, RequestOtpDto, VerifyOtpDto, RegisterSellerDto } from './auth.service';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader?: string, @Headers('x-user-id') explicitUserId?: string) {
    let userId = explicitUserId;

    if (!userId && authHeader) {
      // Parse "Bearer ojk_sess_<userId>_<timestamp>"
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const parts = token.split('_');
      if (parts.length >= 3 && parts[0] === 'ojk' && parts[1] === 'sess') {
        userId = parts[2];
      }
    }

    if (!userId) {
      throw new UnauthorizedException('Session invalide ou utilisateur non authentifié');
    }

    return this.authService.getMe(userId);
  }

  @Post('register-seller')
  async registerSeller(
    @Body() dto: RegisterSellerDto,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string
  ) {
    let userId = explicitUserId;

    if (!userId && authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const parts = token.split('_');
      if (parts.length >= 3 && parts[0] === 'ojk' && parts[1] === 'sess') {
        userId = parts[2];
      }
    }

    if (!userId) {
      throw new UnauthorizedException('Authentification requise pour enregistrer un atelier');
    }

    return this.authService.registerSeller(userId, dto);
  }
}
