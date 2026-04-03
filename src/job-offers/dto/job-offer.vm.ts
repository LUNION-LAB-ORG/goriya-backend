import { JobExperienceType, JobStatus, JobType } from "../../@types/enums";
import { CompanyVm } from "../../companies/dto/company.vm";

export class JobOfferVm {
    id!: string;
    title!: string;
    location!: string;
    type!: JobType;
    experience!: JobExperienceType;
    salary!: string;
    description!: string;
    benefits!: string;
    requirements!: string[];
    status!: JobStatus;
    publishDate!: Date;
    endDate!: Date;
    applicants!: number;
    company?: CompanyVm | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<JobOfferVm>) {
        Object.assign(this, partial);
    }
}
