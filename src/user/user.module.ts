import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]),JwtModule],
  controllers: [UserController],
  providers: [UserService, UserRepository,JwtService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
