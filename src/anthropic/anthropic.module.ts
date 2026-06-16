import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnthropicService } from './anthropic.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [AnthropicService],
    exports: [AnthropicService],
})
export class AnthropicModule {}
