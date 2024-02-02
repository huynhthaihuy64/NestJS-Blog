import { Body, Controller, Delete, Get, Param, ParseArrayPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from 'src/entities/category.entity';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteResult, UpdateResult } from 'typeorm';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'items_per_page' })
  @ApiQuery({ name: 'search' })
  @Get()
  findAll(@Query() query: FilterCategoryDto): Promise<any> {
    return this.categoryService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  detail(@Param('id') id: number): Promise<Category> {
    return this.categoryService.detail(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateResult> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @UseGuards(AuthGuard)
  @Delete('multiple')
  multipleDelete(
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    ids: string[],
  ) {
    return this.categoryService.multipleDelete(ids);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.categoryService.delete(id);
  }
}
