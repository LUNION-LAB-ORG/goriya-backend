import { Test, TestingModule } from '@nestjs/testing';
import { MatchingResultsController } from './matching-results.controller';

describe('MatchingResultsController', () => {
    let controller: MatchingResultsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MatchingResultsController],
        }).compile();

        controller = module.get<MatchingResultsController>(MatchingResultsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
