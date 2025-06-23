import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../admin/entities/user.entity';
import { UsersService } from '../admin/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    const valid = password === user.password; // await bcrypt.compare(password, user.password);
    if (user && valid) {
      
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, password: user.password };
    const foundUser = await this.validateUser(user.email, user.password);
    if(!foundUser) {
      return { message: 'Invalid credentials' };
    }
    
    // Get user permissions based on their role
    const userPermissions = await this.usersService.getUserPermissions(foundUser.id);
    
    return {
      access_token: this.jwtService.sign(payload),
      user: foundUser,
      permissions: userPermissions.permissions,
      role: userPermissions.role
    };
  }

  async getProfile(userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }
}
