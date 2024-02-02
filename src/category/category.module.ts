import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { Post } from 'src/entities/post.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Category]), ConfigModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
