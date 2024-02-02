import { IsEmail, IsNotEmpty } from "class-validator";

export class RegisterUserDto {
  first_name: string;
  last_name: string;
  
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
  status: number;
}