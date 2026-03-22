import {
    IsString,
    IsNumber,
    IsArray,
    IsDateString,
    IsEnum
} from "class-validator";

import { CVStatus } from "../../@types/enums";

export class CreateCvAnalysisDto {
    // fileName ne sera pas défini ici, il sera récupéré via UploadedFile()
    // @IsString()
    // fileName: string;

    @IsNumber()
    analysisScore: number;

    @IsArray()
    @IsString({ each: true })
    recommendations: string[];

    @IsDateString()
    uploadDate: Date;

    @IsEnum(CVStatus)
    status: CVStatus;
}