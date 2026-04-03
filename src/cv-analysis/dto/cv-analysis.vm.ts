import { CVStatus } from "../../@types/enums";

export class CVAnalysisVm {
    id!: string;
    fileName!: string;
    analysisScore!: number;
    recommendations!: string[];
    uploadDate!: Date;
    status!: CVStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<CVAnalysisVm>) {
        Object.assign(this, partial);
    }
}
