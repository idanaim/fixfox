import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint to verify the status of the REST API server test.
   */
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
  @Get()
  getRoot() {
    return {
      message: 'FixFox REST API Server',
      version: '1.0.0',
      status: 'running',
    };
  }
}
