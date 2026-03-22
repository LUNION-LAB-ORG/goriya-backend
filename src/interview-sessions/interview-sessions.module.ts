import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewSessionsService } from './interview-sessions.service';
import { InterviewSessionsController } from './interview-sessions.controller';
import { InterviewSession } from './interview-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewSession])],
  providers: [InterviewSessionsService],
  controllers: [InterviewSessionsController],
  exports: [InterviewSessionsService],
})
export class InterviewSessionsModule {}