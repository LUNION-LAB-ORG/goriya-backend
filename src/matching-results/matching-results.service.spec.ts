import { Test, TestingModule } from '@nestjs/testing';
import { MatchingResultsService } from './matching-results.service';

describe('MatchingResultsService', () => {
    let service: MatchingResultsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchingResultsService],
        }).compile();

        service = module.get<MatchingResultsService>(MatchingResultsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
