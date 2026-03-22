import {
    IsString,
    IsEnum,
    IsArray,
    IsOptional,
    IsUUID,
    IsDateString
} from "class-validator";

import { JobExperienceType, JobStatus, JobType } from "../../@types/enums";

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

    @IsDateString()
    publishDate: Date;

    @IsDateString()
    endDate: Date;

    @IsOptional()
    applicants?: number;

    @IsUUID()
    companyId: string;
}