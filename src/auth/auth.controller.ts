import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './types/dtos/register.dto';
import { LoginDto } from './types/dtos/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({})
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({})
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    // Implement forgot password logic
    return { message: 'Password reset email sent' };
  }

  @ApiOperation({})
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    // Implement reset password logic
    return { message: 'Password reset successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return req.user; 
  }
}
