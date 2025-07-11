import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { BotDetectionService, BotDetectionResult } from './bot-detection.service';
import axios from 'axios';

@Controller('bot-detection')
export class BotDetectionController {
  constructor(private readonly botDetectionService: BotDetectionService) {}

  @Get('analyze/:username')
  async analyzeUser(@Param('username') username: string): Promise<BotDetectionResult> {
    try {
      // Call the Telethon service for real data
      const response = await axios.get(`http://localhost:8000/scan/${username}`);
      
      if (!response.data) {
        throw new HttpException('Failed to analyze user', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Process the Telethon data
      return this.botDetectionService.processAnalysis(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.detail || 'Failed to analyze user',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      throw new HttpException('Failed to analyze user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analyze-channel/:channelUrl')
  async analyzeChannel(@Param('channelUrl') channelUrl: string): Promise<BotDetectionResult> {
    try {
      // Clean the channel URL/username
      const cleanChannelName = channelUrl.replace('https://t.me/', '').replace('@', '');
      
      // Call the Telethon service for real data
      const response = await axios.get(`http://localhost:8000/scan/${cleanChannelName}`);
      
      if (!response.data) {
        throw new HttpException('Failed to analyze channel', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Process the Telethon data
      return this.botDetectionService.processAnalysis(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.detail || 'Failed to analyze channel',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      throw new HttpException('Failed to analyze channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 