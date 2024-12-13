import { PartialType } from '@nestjs/swagger';
import { CreateFielDto } from './create-fiel.dto';

export class UpdateFielDto extends PartialType(CreateFielDto) {}
