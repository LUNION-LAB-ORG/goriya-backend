import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringResultsService } from './scoring-results.service';
import { ScoringResultsController } from './scoring-results.controller';
import { ScoringResult } from './scoring-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScoringResult])],
  providers: [ScoringResultsService],
  controllers: [ScoringResultsController],
  exports: [ScoringResultsService],
})
export class ScoringResultsModule {}