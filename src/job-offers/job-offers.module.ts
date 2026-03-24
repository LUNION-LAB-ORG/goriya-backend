import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';
import { JobOffer } from './job-offer.entity';
import { Company } from '../companies/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer, Company])],
  providers: [JobOffersService],
  controllers: [JobOffersController],
  exports: [JobOffersService],
})
export class JobOffersModule {}