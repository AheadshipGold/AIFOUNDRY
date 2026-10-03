import { Controller, Post, Body, Get, Put, Headers, UnauthorizedException } from '@nestjs/common';
import {
  AuthService,
  RequestOtpDto,
  VerifyOtpDto,
  RegisterUserDto,
  LoginUserDto,
  GoogleAuthDto,
  UpdateProfileDto,
  ChangePasswordDto,
  RegisterSellerDto,
} from './auth.service';

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

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader?: string, @Headers('x-user-id') explicitUserId?: string) {
    const userId = this.extractUserId(authHeader, explicitUserId);
    if (!userId) {
      throw new UnauthorizedException('Session invalide ou utilisateur non authentifié');
    }
    return this.authService.getMe(userId);
  }

  @Put('profile')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string
  ) {
    const userId = this.extractUserId(authHeader, explicitUserId);
    if (!userId) {
      throw new UnauthorizedException('Session invalide ou utilisateur non authentifié');
    }
    return this.authService.updateProfile(userId, dto);
  }

  @Post('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string
  ) {
    const userId = this.extractUserId(authHeader, explicitUserId);
    if (!userId) {
      throw new UnauthorizedException('Session invalide ou utilisateur non authentifié');
    }
    return this.authService.changePassword(userId, dto);
  }

  @Post('register-seller')
  async registerSeller(
    @Body() dto: RegisterSellerDto,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string
  ) {
    const userId = this.extractUserId(authHeader, explicitUserId);
    if (!userId) {
      throw new UnauthorizedException('Authentification requise pour enregistrer un atelier');
    }
    return this.authService.registerSeller(userId, dto);
  }

  @Post('delete-account')
  async deleteAccount(
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string
  ) {
    const userId = this.extractUserId(authHeader, explicitUserId);
    if (!userId) {
      throw new UnauthorizedException('Session invalide ou utilisateur non authentifié');
    }
    return this.authService.deleteAccount(userId);
  }

  private extractUserId(authHeader?: string, explicitUserId?: string): string | null {
    if (explicitUserId) return explicitUserId;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!token) return null;
      if (token.startsWith('ojk_sess_')) {
        const withoutPrefix = token.substring('ojk_sess_'.length);
        const lastUnderscore = withoutPrefix.lastIndexOf('_');
        if (lastUnderscore > 0) {
          return withoutPrefix.substring(0, lastUnderscore);
        }
        return withoutPrefix;
      }
      return token;
    }
    return null;
  }
}

