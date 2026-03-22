import { Test, TestingModule } from '@nestjs/testing';
import { ScoringResultsController } from './scoring-results.controller';

describe('ScoringResultsController', () => {
    let controller: ScoringResultsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ScoringResultsController],
        }).compile();

        controller = module.get<ScoringResultsController>(ScoringResultsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
