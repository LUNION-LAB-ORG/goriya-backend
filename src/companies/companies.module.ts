import { Module } from '@nestjs/common';
import { Company } from './company.entity';
import { User } from '../users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Company, User]),
        AuthModule,
    ],
    providers: [CompaniesService],
    controllers: [CompaniesController],
    exports: [CompaniesService],
})
export class CompaniesModule { }