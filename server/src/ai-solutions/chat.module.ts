import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Issue } from './entities/issue.entity';
import { Equipment } from '../entities/equipment.entity';
import { User } from '../admin/entities/user.entity';
import { Business } from '../admin/entities/business.entity';
import { Problem } from './entities/problem.entity';
import { Solution } from './entities/solution.entity';
import { AIService } from './services/ai.service';
import { ProblemService } from './services/problem.service';
import { SolutionService } from './services/solution.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSession,
      ChatMessage,
      Issue,
      Equipment,
      User,
      Business,
      Problem,
      Solution,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fixfox-jwt-secret',
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, AIService, ProblemService, SolutionService],
  exports: [ChatService, AIService],
})
export class ChatModule {}
