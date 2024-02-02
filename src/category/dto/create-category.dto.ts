import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  status: number;
}
