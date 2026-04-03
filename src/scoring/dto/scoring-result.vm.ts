import { ScoringStatus } from "../../@types/enums";

export class ScoringResultVm {
    id!: string;
    candidateName!: string;
    candidateEmail!: string;
    position!: string;
    overallScore!: number;
    criteria!: any;
    analysisDate!: Date;
    status!: ScoringStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<ScoringResultVm>) {
        Object.assign(this, partial);
    }
}
