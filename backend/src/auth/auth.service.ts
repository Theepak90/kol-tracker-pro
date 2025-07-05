import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, email: string, password: string) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const { password: _, ...result } = savedUser.toObject();

    return {
      user: result,
      token: this.jwtService.sign({ email: result.email, sub: result._id }),
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  async updateProfile(userId: string, data: Partial<User>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true },
    );
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const { password, ...result } = user.toObject();
    return result;
  }
} 