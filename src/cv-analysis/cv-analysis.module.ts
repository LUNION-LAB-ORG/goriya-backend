import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CVAnalysisService } from './cv-analysis.service';
import { CVAnalysisController } from './cv-analysis.controller';
import { CVAnalysis } from './cv-analysis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CVAnalysis])],
  providers: [CVAnalysisService],
  controllers: [CVAnalysisController],
  exports: [CVAnalysisService],
})
export class CVAnalysisModule {}