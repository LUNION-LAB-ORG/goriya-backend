import { PartialType } from "@nestjs/mapped-types";
import { CreateCvAnalysisDto } from "./create-cv-analysis.dto";

export class UpdateCvAnalysisDto extends PartialType(CreateCvAnalysisDto) {}