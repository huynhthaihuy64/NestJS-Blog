import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from 'src/entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DeleteResult, In, Like, Repository, UpdateResult } from 'typeorm';
import { FilterPostDto } from './dto/filter-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { promisify } from 'util';
import { unlink } from 'fs';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  unlinkAsync = promisify(unlink);

  async findAll(query: FilterPostDto): Promise<any> {
    const items_per_page = Number(query.items_per_page) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * items_per_page;
    const keyword = query.search || '';
    const category = Number(query.category) || null;
    const user = Number(query.user) || null;
    const [res, total] = await this.postRepository.findAndCount({
      where: [
        {
          title: Like('%' + keyword + '%'),
          category: {
            id: category,
          },
          user: {
            id: user,
          },
        },
        {
          description: Like('%' + keyword + '%'),
          category: {
            id: category,
          },
          user: {
            id: user,
          },
        },
      ],
      relations: ['user', 'category'],
      order: { created_at: 'DESC' },
      take: items_per_page,
      skip: skip,
      select: {
        user: {
          id: true,
          email: true,
          avatar: true,
          first_name: true,
          last_name: true,
        },
        category: {
          id: true,
          name: true,
          description: true,
        },
      },
    });
    const lastPage = Math.ceil(total / items_per_page);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;

    return {
      data: res,
      total,
      currentPage: page,
      nextPage: nextPage,
      lastPage: lastPage,
      prevPage: prevPage,
    };
  }

  async detail(id: number): Promise<Post> {
    return await this.postRepository.findOne({
      where: { id: id },
      relations: ['user', 'category'],
    });
  }

  async create(userId: number, createPostDto: CreatePostDto): Promise<Post> {
    const user = await this.userRepository.findOneBy({ id: userId });
    const category = await this.userRepository.findOneBy({
      id: createPostDto.category_id,
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    try {
      const res = await this.postRepository.save({
        ...createPostDto,
        user,
        category,
      });
      return await this.postRepository.findOneBy({ id: res.id });
    } catch (error) {
      throw new HttpException('Can not create post', HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<UpdateResult> {
    return await this.postRepository.update(id, updatePostDto);
  }

  async delete(id: number): Promise<DeleteResult> {
    const post = await this.postRepository.findOne({
      where: { id: id },
    });
    this.removeFile(post.thumbnail);
    return this.postRepository.delete(id);
  }

  async multipleDelete(ids: string[]): Promise<DeleteResult> {
    for(const id of ids) {
      const post = await this.postRepository.findOne({
        where: { id: Number(id) },
      });
      if (post.thumbnail) {
        this.removeFile(post.thumbnail);
      }
    }
    return await this.postRepository.delete({ id: In(ids) });
  }

  private async removeFile(filePath: string): Promise<void> {
    try {
      await this.unlinkAsync(filePath);
    } catch (error) {
      console.error(`Error removing file ${filePath}: ${error.message}`);
      throw error;
    }
  }
}
