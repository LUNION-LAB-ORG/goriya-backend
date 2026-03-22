import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersController } from './job-offers.controller';

describe('JobOffersController', () => {
    let controller: JobOffersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [JobOffersController],
        }).compile();

        controller = module.get<JobOffersController>(JobOffersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
