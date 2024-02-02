import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { Post } from 'src/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post]),
  ConfigModule
],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
