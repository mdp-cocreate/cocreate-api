import { IsBoolean } from 'class-validator';

export class ProjectFiltersDto {
  @IsBoolean()
  selectDomains: boolean;

  @IsBoolean()
  selectMembers: boolean;

  @IsBoolean()
  selectItems: boolean;

  @IsBoolean()
  selectActions: boolean;
}
