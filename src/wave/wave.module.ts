import { Global, Module } from '@nestjs/common'
import { WaveService } from './wave.service'

@Global()
@Module({
    providers: [WaveService],
    exports: [WaveService],
})
export class WaveModule {}
