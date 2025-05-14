import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Issue } from './entities/issue.entity';
import { Equipment } from './entities/equipment.entity';
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
      Problem,
      Solution
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService, AIService, ProblemService, SolutionService],
  exports: [ChatService, AIService]
})
export class ChatModule {}
