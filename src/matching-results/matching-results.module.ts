import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingResultsService } from './matching-results.service';
import { MatchingResultsController } from './matching-results.controller';
import { MatchingResult } from './matching-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatchingResult])],
  providers: [MatchingResultsService],
  controllers: [MatchingResultsController],
  exports: [MatchingResultsService],
})
export class MatchingResultsModule {}