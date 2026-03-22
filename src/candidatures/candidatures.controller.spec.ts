import { Test, TestingModule } from '@nestjs/testing';
import { CandidaturesController } from './candidatures.controller';

describe('CandidaturesController', () => {
    let controller: CandidaturesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CandidaturesController],
        }).compile();

        controller = module.get<CandidaturesController>(CandidaturesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
