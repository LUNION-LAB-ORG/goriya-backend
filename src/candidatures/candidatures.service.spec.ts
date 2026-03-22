import { Test, TestingModule } from '@nestjs/testing';
import { CandidaturesService } from './candidatures.service';

describe('CandidaturesService', () => {
    let service: CandidaturesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CandidaturesService],
        }).compile();

        service = module.get<CandidaturesService>(CandidaturesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
