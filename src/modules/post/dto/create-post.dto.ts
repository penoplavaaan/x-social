import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

export enum MediaTypeEnum {
  VIDEO = 'VIDEO',
  PRODUCT = 'PRODUCT',
  PODCAST = 'PODCAST',
  SELECTION = 'SELECTION',
  LINK = 'LINK',
}

export class Media {
  @ApiProperty({
    enum: MediaTypeEnum,
  })
  type: MediaTypeEnum;

  @ApiProperty()
  url?: string;
}

export class CreatePostDto {
  @ApiProperty({
    example: 'test post text',
  })
  text: string;

  @ApiProperty({
    example: 'TextPostTitle',
  })
  title: string;

  @ApiProperty({
    example: 'ru',
  })
  language: string;

  @ApiProperty({
    example: [],
  })
  productsId: string[];

  @ApiProperty()
  @ValidateNested({ each: true })
  media: Media[];
}


export class FindAllPosts {
  @ApiProperty({
    example: 'Andrey',
    required: false,
  })
  search?: string;

  @ApiProperty({
    example: 0,
    required: false,
  })
  skip?: number;

  @ApiProperty({
    required: false,

    example: 10,
  })
  take?: number;
}
