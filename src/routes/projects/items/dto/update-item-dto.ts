import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from '../../dto/create-item-dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {}
