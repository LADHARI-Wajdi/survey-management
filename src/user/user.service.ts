import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './types/dtos/create-user.dto';
import { UpdateUserDto } from './types/dtos/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {


  constructor(private userRepository: UserRepository) {}



  getUserAuthInfo(username: string) {
    return this.userRepository.getUserAuthInfo(username);
  }


  findByResetToken(token: string) {
    throw new Error('Method not implemented.');
  }

async findAll(): Promise<User[]> {
  const users = await this.userRepository.find();
  console.log('Fetched users:', users);  // <-- print the result here
  return users;
}
  

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    console.log(`UserService.findByUsername: recherche pour '${username}'`);
    const user = await this.userRepository.findOne({ where: { username } });
    
    console.log(`UserService.findByUsername: utilisateur trouvé: ${!!user}`);
    if (user) {
      console.log(`UserService.findByUsername: champ password existe: ${!!user.password}`);
      console.log(`UserService.findByUsername: valeur password: ${user.password}`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    console.log(`UserService.findByEmail: recherche pour '${email}'`);
    const user = await this.userRepository.findOne({ where: { email } });
    console.log(`UserService.findByEmail: utilisateur trouvé: ${!!user}`);
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(`UserService.create: création pour '${createUserDto.username}'`);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    console.log(`UserService.create: mot de passe haché: ${hashedPassword}`);
    const { password, ...rest } = createUserDto;

    const user = this.userRepository.create({
      ...rest,
      password: hashedPassword,
    });

    
    
    const savedUser = await this.userRepository.save(user);
    console.log(`UserService.create: utilisateur créé avec ID: ${savedUser}`);
    return savedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = Object.assign(user, updateUserDto);
    return this.userRepository.save(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}