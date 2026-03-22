import { PartialType } from "@nestjs/mapped-types";
import { CreateScoringResultDto } from "./create-scoring-result.dto";

export class UpdateScoringResultDto extends PartialType(CreateScoringResultDto) {}