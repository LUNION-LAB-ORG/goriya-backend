import { Test, TestingModule } from '@nestjs/testing';
import { ScoringResultsService } from './scoring-results.service';

describe('ScoringResultsService', () => {
    let service: ScoringResultsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ScoringResultsService],
        }).compile();

        service = module.get<ScoringResultsService>(ScoringResultsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
