import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { hash, compare, genSalt } from 'bcrypt'; 
import { RegisterDto } from './types/dtos/register.dto';
import { LoginDto } from './types/dtos/login.dto';
import { UserModule } from 'src/user/user.module';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
       roles: [user.role]
    };
  
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
    };
  }
  
  
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
     private configService: ConfigService ,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      return null;
    }
 
    const isPasswordValid = await bcrypt.compare(password.trim(), user.password.trim());
 

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

 
  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const existingEmail = await this.userService.findByEmail(email);
    if (existingEmail) {
      throw new UnauthorizedException('Email already exists');
    }
 

     
    const newUser = await this.userService.create({
      ...registerDto,
    });

    const { password: _, ...result } = newUser;

    const payload = {
      username: result.username,
      sub: result.id,
      role: result.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        role: result.role,
      },
    };
  }
  async forgotPassword(email: string): Promise<void> {
    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
   // const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Save token to user
    await this.userService.update(user.id, {});

    // In a real application, you would send an email here
    // For now, we'll just log the token
    console.log(`Reset token for ${email}`);

    // Implement email sending logic here
    // this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user by reset token
    const User = await this.userService.findByResetToken(token);

    if (!UserModule) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.sub);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
