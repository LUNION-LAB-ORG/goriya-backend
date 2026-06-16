import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnonymousUsage } from './anonymous-usage.entity'
import { AnonymousUsageService } from './anonymous-usage.service'
import { AnonymousUsageController } from './anonymous-usage.controller'

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([AnonymousUsage])],
    providers: [AnonymousUsageService],
    controllers: [AnonymousUsageController],
    exports: [AnonymousUsageService],
})
export class AnonymousUsageModule {}
