import { Test, TestingModule } from '@nestjs/testing';
import { CVAnalysisController } from './cv-analysis.controller';

describe('CVAnalysisController', () => {
    let controller: CVAnalysisController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CVAnalysisController],
        }).compile();

        controller = module.get<CVAnalysisController>(CVAnalysisController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
