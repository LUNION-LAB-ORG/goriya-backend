import { Test, TestingModule } from '@nestjs/testing';
import { CVAnalysisService } from './cv-analysis.service';

describe('CVAnalysisService', () => {
    let service: CVAnalysisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CVAnalysisService],
        }).compile();

        service = module.get<CVAnalysisService>(CVAnalysisService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
