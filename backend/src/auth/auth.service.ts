import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';
  avatar?: string;
  walletAddress?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  private users: Map<string, User> = new Map();
  private idCounter = 1;

  constructor(
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, email: string, password: string) {
    const existingUser = Array.from(this.users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: this.idCounter.toString(),
      username,
      email,
      password: hashedPassword,
      plan: 'free',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(newUser.id, newUser);
    this.idCounter++;

    const { password: _, ...result } = newUser;

    return {
      user: result,
      token: this.jwtService.sign({ email: result.email, sub: result.id }),
    };
  }
} 