import {
    IsString,
    IsEmail,
    IsNumber,
    IsEnum,
    IsDateString
} from "class-validator";

import { MatchingStatus } from "../../@types/enums";

export class CreateMatchingResultDto {

    @IsString()
    candidateName: string;

    @IsEmail()
    candidateEmail: string;

    @IsString()
    position: string;

    @IsString()
    company: string;

    @IsNumber()
    matchingScore: number;

    @IsEnum(MatchingStatus)
    status: MatchingStatus;

    @IsDateString()
    matchDate: Date;
}