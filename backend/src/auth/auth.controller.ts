import { Controller, Get, Post, Body, Request, Put } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(username, email, password);
  }

  @Post('login')
  async login(@Request() req) {
    return { message: 'Authentication disabled' };
  }

  @Get('me')
  async getCurrentUser(@Request() req) {
    return { message: 'Authentication disabled' };
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() data: any) {
    return { message: 'Authentication disabled' };
  }
} 