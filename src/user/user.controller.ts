import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './types/dtos/create-user.dto';
import { UpdateUserDto } from './types/dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from './types/enums/user-role.enum';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }



  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
 @Get()
  findAll() {
    console.log('Fetching all users');
    return this.userService.findAll();
  }

}
