import {
    IsString,
    IsEnum,
    IsArray,
    IsOptional,
    IsUUID
} from "class-validator";

import { JobExperienceType, JobStatus, JobType } from "src/@types/enums";

export class CreateJobOfferDto {
    @IsString()
    title: string;

    @IsString()
    location: string;

    @IsEnum(JobType)
    type: JobType;

    @IsEnum(JobExperienceType)
    experience: JobExperienceType;

    @IsString()
    salary: string;

    @IsString()
    description: string;

    @IsString()
    benefits: string;

    @IsArray()
    @IsString({ each: true })
    requirements: string[];

    @IsOptional()
    @IsEnum(JobStatus)
    status?: JobStatus;

    @IsOptional()
    applicants?: number;

    @IsUUID()
    companyId: string;
}