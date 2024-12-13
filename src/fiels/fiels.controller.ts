import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  editFileName,
  imageFileFilter,
} from 'src/libs/common/utils/file.upload';

@Controller('files')
@ApiTags('files')
export class FilesController {
  constructor(private readonly db: PrismaService) {}
  // upload single file
  @Post('')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadedFile(@UploadedFile() file) {
    const res = await this.db.file.create({
      data: {
        fileName: file.filename,
        originalName: file.originalname,
        url: process.env.APPLICATION_URL + '/files/' + file.filename,
      },
    });

    return {
      status: HttpStatus.OK,
      message: 'Image uploaded successfully!',
      data: res,
    };
  }

  @Post('uploadMultipleFiles')
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files) {
    const response: any = [];
    files.forEach((file) => {
      const fileReponse = {
        originalName: file.originalname,
        filename: file.filename,
      };
      response.push(fileReponse);
    });

    const res = await this.db.file.createMany({
      data: response,
    });

    return {
      status: HttpStatus.OK,
      message: 'Images uploaded successfully!',
      data: res,
    };
  }
  @Get(':imagename')
  getImage(@Param('imagename') image, @Res() res) {
    const response = res.sendFile(image, { root: './uploads' });
    return {
      status: HttpStatus.OK,
      data: response,
    };
  }
}
