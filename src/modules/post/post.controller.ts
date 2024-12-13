import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, FindAllPosts } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    return this.postService.create(createPostDto, req);
  }

  @Post('like/:id')
  like(@Param('id') postId: string, @Req() req: Request) {
    return this.postService.like(postId, req);
  }

  @Get()
  findAll(@Query() params: FindAllPosts) {
    return this.postService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.postService.findOne(id, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
