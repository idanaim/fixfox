// Ensure crypto is available globally for TypeORM - MUST BE FIRST!
try {
  const crypto = require('crypto');

  // Multiple approaches to ensure crypto is available
  if (typeof global.crypto === 'undefined') {
    global.crypto = crypto;
  }
  if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = crypto;
  }

  // For Node.js compatibility - ensure webcrypto is available
  if (typeof global.crypto.randomUUID === 'undefined' && crypto.randomUUID) {
    global.crypto.randomUUID = crypto.randomUUID.bind(crypto);
  }

  // Fallback for older Node.js versions
  if (typeof global.crypto.randomUUID === 'undefined') {
    global.crypto.randomUUID = () => {
      return crypto.randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    };
  }
} catch (error) {
  console.error('❌ Failed to initialize crypto module:', error);
}

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

// Test deployment workflow - new DevOps setup

// Re-triggering deployment after infrastructure fix

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';

  // Enhanced CORS configuration for production
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow localhost on any port for development
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      
      // Allow any origin for now (can be restricted later)
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'token',
      'x-requested-with',
      'cache-control',
      'pragma',
    ],
    exposedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
      'Authorization',
      'token',
    ],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    preflightContinue: false,
  });

  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log('✅ Crypto module initialized successfully');
  Logger.log('✅ Enhanced CORS configuration enabled');
}

bootstrap();
