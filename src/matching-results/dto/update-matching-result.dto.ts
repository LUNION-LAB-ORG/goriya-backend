import { PartialType } from "@nestjs/mapped-types";
import { CreateMatchingResultDto } from "./create-matching-result.dto";

export class UpdateMatchingResultDto extends PartialType(CreateMatchingResultDto) {}