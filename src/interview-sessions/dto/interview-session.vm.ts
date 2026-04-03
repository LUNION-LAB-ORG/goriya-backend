import { InterviewStatus } from "../../@types/enums";

export class InterviewSessionVm {
    id!: string;
    candidateName!: string;
    candidateEmail!: string;
    position!: string;
    duration!: number;
    score!: number;
    status!: InterviewStatus;
    startTime!: Date;
    feedback!: string;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<InterviewSessionVm>) {
        Object.assign(this, partial);
    }
}
