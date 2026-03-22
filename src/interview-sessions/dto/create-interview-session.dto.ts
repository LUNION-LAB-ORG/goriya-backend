import {
    IsString,
    IsEmail,
    IsNumber,
    IsEnum,
    IsDateString,
    IsOptional
} from "class-validator";

import { InterviewStatus } from "../../@types/enums";

export class CreateInterviewSessionDto {

    @IsString()
    candidateName: string;

    @IsEmail()
    candidateEmail: string;

    @IsString()
    position: string;

    @IsNumber()
    duration: number;

    @IsOptional()
    @IsNumber()
    score?: number;

    @IsEnum(InterviewStatus)
    status: InterviewStatus;

    @IsDateString()
    startTime: Date;

    @IsOptional()
    @IsString()
    feedback?: string;
}