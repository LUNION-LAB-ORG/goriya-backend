import {
    IsString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsNumber,
    IsDateString,
    IsUUID
} from "class-validator";

import { CandidatureStatus } from "../../@types/enums";

export class CreateCandidatureDto {

    @IsString()
    candidateName: string;

    @IsEmail()
    candidateEmail: string;

    @IsOptional()
    @IsEnum(CandidatureStatus)
    status?: CandidatureStatus;

    @IsOptional()
    @IsNumber()
    score?: number;

    @IsDateString()
    appliedDate: Date;

    @IsUUID()
    userId: string;

    @IsUUID()
    jobOfferId: string;
}