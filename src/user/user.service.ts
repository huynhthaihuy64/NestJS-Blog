import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { DeleteResult, ILike, In, Like, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { FilterUserDto } from 'src/user/dto/filter-user.dto';
import { Post } from 'src/entities/post.entity';
import { promisify } from 'util';
import { unlink } from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}
  unlinkAsync = promisify(unlink);

  async findAll(query: FilterUserDto): Promise<any> {
    const items_per_page = Number(query.items_per_page) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * items_per_page;
    const keyword = query.search || '';
    const [res, total] = await this.userRepository.findAndCount({
      where: [
        { email: Like('%' + keyword + '%') },
        { first_name: Like('%' + keyword + '%') },
        { last_name: Like('%' + keyword + '%') },
      ],
      relations: ['posts'],
      order: { created_at: 'DESC' },
      take: items_per_page,
      skip: skip,
      select: {
        posts: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          status: true,
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

  async detail(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userRepository.save({
      ...createUserDto,
      refresh_token: 'refresh_token_string',
      password: hashPassword,
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return await this.userRepository.update(id, updateUserDto);
  }

  async multipleDelete(ids: string[]): Promise<DeleteResult> {
    for (const id of ids) {
      const user = await this.userRepository.findOne({
        where: { id: Number(id) },
        relations: ['posts'],
      });
      if (user.posts && user.posts.length > 0) {
        await this.postRepository.remove(user.posts);
      }
      if (user.avatar) {
        this.removeFile(user.avatar);
      }
    }
    return await this.userRepository.delete({ id: In(ids) });
  }

  async delete(id: number): Promise<DeleteResult> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['posts'],
    });

    if (!user) {
      console.error(`User with id ${id} not found.`);
      return null; // or throw an error or handle it as needed
    }
    if (user.posts && user.posts.length > 0) {
      await this.postRepository.remove(user.posts);
    }
    if (user.avatar) {
      this.removeFile(user.avatar);
    }
    return this.userRepository.delete(id);
  }

  async updateAvatar(id: number, avatar: string): Promise<UpdateResult> {
    return await this.userRepository.update(id, { avatar });
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
