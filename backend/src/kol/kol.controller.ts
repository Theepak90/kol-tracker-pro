import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { KOLService } from './kol.service';
import { KOL } from '../schemas/kol.schema';
import axios from 'axios';

@Controller('kols')
export class KOLController {
  constructor(private readonly kolService: KOLService) {}

  @Post()
  async create(@Body() kolData: {
    displayName: string;
    telegramUsername: string;
    description?: string;
    tags?: string[];
  }): Promise<KOL> {
    return this.kolService.create(kolData);
  }

  @Get()
  async findAll(): Promise<KOL[]> {
    return this.kolService.findAll();
  }

  @Get(':username')
  async findOne(@Param('username') username: string): Promise<KOL> {
    return this.kolService.findByUsername(username);
  }

  @Get('track-posts/:username')
  async trackPosts(@Param('username') username: string) {
    try {
      const response = await axios.get(`http://localhost:8000/track-posts/${username}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.detail || 'Failed to track user posts',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      throw new HttpException('Failed to track user posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':username')
  async update(
    @Param('username') username: string,
    @Body() updateData: Partial<KOL>
  ): Promise<KOL> {
    return this.kolService.update(username, updateData);
  }

  @Delete(':username')
  async delete(@Param('username') username: string): Promise<boolean> {
    return this.kolService.delete(username);
  }
} 