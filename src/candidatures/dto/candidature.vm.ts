import { CandidatureStatus } from "../../@types/enums";
import { UserVm } from "../../users/dto/user.vm";
import { JobOfferVm } from "../../job-offers/dto/job-offer.vm";

export class CandidatureVm {
    id!: string;
    candidateName!: string;
    candidateEmail!: string;
    status!: CandidatureStatus;
    score!: number;
    appliedDate!: Date;
    user?: UserVm | null;
    jobOffer?: JobOfferVm | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<CandidatureVm>) {
        Object.assign(this, partial);
    }
}
