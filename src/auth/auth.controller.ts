import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user.entity';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}
  @Post('register')
  @UsePipes(ValidationPipe)
  register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @ApiResponse({status:201, description: 'Login Successfully'})
  @UsePipes(ValidationPipe)
  login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return this.authService.login(loginUserDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() { refresh_token }) {
    return this.authService.refreshToken(refresh_token);
  }
}
