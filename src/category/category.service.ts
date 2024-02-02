import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Like, Repository, UpdateResult } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from 'src/entities/category.entity';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Post } from 'src/entities/post.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async findAll(query: FilterCategoryDto): Promise<any> {
    const items_per_page = Number(query.items_per_page) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * items_per_page;
    const keyword = query.search || '';
    const [res, total] = await this.categoryRepository.findAndCount({
      where: [
        { name: Like('%' + keyword + '%') },
        { description: Like('%' + keyword + '%') },
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

  async detail(id: number): Promise<Category> {
    return await this.categoryRepository.findOne({
      where: { id: id },
      relations: ['posts'],
    });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.categoryRepository.save(createCategoryDto);
    } catch (error) {
      throw new HttpException(
        'Can not create category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateResult> {
    return await this.categoryRepository.update(id, updateCategoryDto);
  }

  async multipleDelete(ids: string[]): Promise<DeleteResult> {
    for (const id of ids) {
      const category = await this.categoryRepository.findOne({
        where: { id: Number(id) },
        relations: ['posts'],
      });
      if (category.posts && category.posts.length > 0) {
        await this.postRepository.remove(category.posts);
      }
    }
    return await this.categoryRepository.delete({ id: In(ids) });
  }

  async delete(id: number): Promise<DeleteResult> {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
      relations: ['posts'],
    });
    if (!category) {
      console.error(`Category with id ${id} not found.`);
      return null; // or throw an error or handle it as needed
    }
    if (category.posts && category.posts.length > 0) {
      await this.postRepository.remove(category.posts);
    }
    return this.categoryRepository.delete(id);
  }
}
