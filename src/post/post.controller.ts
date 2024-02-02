import {
    BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post as HttpPost,
  Param,
  ParseArrayPipe,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from 'src/entities/post.entity';
import { PostService } from './post.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helpers/config';
import { extname } from 'path';
import { FilterPostDto } from './dto/filter-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DeleteResult, UpdateResult } from 'typeorm';

@ApiTags('Post')
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'items_per_page' })
  @ApiQuery({ name: 'search' })
  @Get()
  findAll(@Query() query: FilterPostDto): Promise<any> {
    return this.postService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  detail(@Param('id') id: number): Promise<Post> {
    return this.postService.detail(id);
  }

  @UseGuards(AuthGuard)
  @HttpPost()
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: storageConfig('thumbnail'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `File size is too large`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  create(
    @Req() req: any,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Post> {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.postService.create(req.user_data.id, {
      ...createPostDto,
      thumbnail: file.fieldname + '/' + file.filename,
    });
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: storageConfig('thumbnail'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `File size is too large`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  update(
    @Param('id') id: number,
    @Req() req: any,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UpdateResult> {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (file) {
      updatePostDto.thumbnail = file.fieldname + '/' + file.filename;
    }
    return this.postService.update(id, updatePostDto);
  }

  @UseGuards(AuthGuard)
  @Delete('multiple')
  multipleDelete(
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    ids: string[],
  ) {
    return this.postService.multipleDelete(ids);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.postService.delete(id);
  }
}
