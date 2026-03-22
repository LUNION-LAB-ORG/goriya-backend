import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidaturesService } from './candidatures.service';
import { CandidaturesController } from './candidatures.controller';
import { Candidature } from './candidature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidature])],
  providers: [CandidaturesService],
  controllers: [CandidaturesController],
  exports: [CandidaturesService],
})
export class CandidaturesModule {}