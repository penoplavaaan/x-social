import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  FindAllUsersDto,
  UpdateUserDto,
} from './dto/create-user.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  editFileName,
  imageFileFilter,
} from 'src/libs/common/utils/file.upload';
import { Authorization } from '../auth/decorators/auth.decorator';
import { Request } from 'express';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Authorization()
  @Post('follow/:id')
  follow(@Param('id') userId: string, @Req() req: Request) {
    return this.userService.foloow(userId, req);
  }

  @Authorization()
  @Post('unfollow/:id')
  unfollow(@Param('id') userId: string, @Req() req: Request) {
    return this.userService.unfoloow(userId, req);
  }

  @Get()
  findAll(@Query() params: FindAllUsersDto) {
    return this.userService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.userService.remove(+id);
  }
}
