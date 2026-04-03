import { MatchingStatus } from "../../@types/enums";

export class MatchingResultVm {
    id!: string;
    candidateName!: string;
    candidateEmail!: string;
    position!: string;
    company!: string;
    matchingScore!: number;
    status!: MatchingStatus;
    matchDate!: Date;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<MatchingResultVm>) {
        Object.assign(this, partial);
    }
}
