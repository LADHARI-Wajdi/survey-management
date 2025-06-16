import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getUserAuthInfo(username: string) {
    const user = await this.createQueryBuilder('user')
      .addSelect(['user.password'])
      .where('user.username =:username', { username })
      .getOne();
      console.log('User retrieved:', user ? 'Yes' : 'No');
      console.log('Password field exists:', user && user.password ? 'Yes' : 'No');
      console.log('Password value:', user?.password);
      
      return user;
  }
}
