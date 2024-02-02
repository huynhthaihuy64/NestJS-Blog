import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';

export class CreatePostDto {
  @ApiProperty()
  description: string;
  @ApiProperty()
  thumbnail: string;

  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  status: number;

  @IsNotEmpty()
  category_id: number

  user: User
}
