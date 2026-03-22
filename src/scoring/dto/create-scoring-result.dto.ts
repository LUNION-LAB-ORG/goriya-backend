import {
    IsString,
    IsEmail,
    IsNumber,
    IsEnum,
    IsDateString,
    IsObject
} from "class-validator";

import { ScoringStatus } from "../../@types/enums";

export class CreateScoringResultDto {

    @IsString()
    candidateName: string;

    @IsEmail()
    candidateEmail: string;

    @IsString()
    position: string;

    @IsNumber()
    overallScore: number;

    @IsObject()
    criteria: Record<string, any>;

    @IsDateString()
    analysisDate: Date;

    @IsEnum(ScoringStatus)
    status: ScoringStatus;
}