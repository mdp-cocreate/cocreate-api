import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from 'src/routes/auth/dto/register.dto';

export class UpdateUserDto extends PartialType(RegisterDto) {}
