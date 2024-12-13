import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUrl } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Andrey',
  })
  name: string;

  @ApiProperty({
    example: 'Andrey',
  })
  nickName: string;

  @ApiProperty({
    example: [1, 2],
    description: 'Масив id хобби',
  })
  hobbyCategories?: Array<string | number>;

  @ApiProperty({
    example: 'hidjfadhf.jpg',
    description: 'Уникальное имя файла',
  })
  picture?: string;
}

export class FindAllUsersDto {
  @ApiProperty({
    example: 'supberBoy2006',
    required: false,
  })
  nickName?: string;

  @ApiProperty({
    example: 'Andrey',
    required: false,
  })
  name?: string;

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

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'about me',
    required: false,
  })
  @IsOptional()
  about?: string;

  @ApiProperty({
    example: 'hello@gamil.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'http://hello.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  webSite?: string;

  @ApiProperty({
    example: 'Moscow',
    required: false,
  })
  @IsOptional()
  country?: string;

  @ApiProperty({
    example: 'ru',
    required: false,
  })
  @IsOptional()
  language?: string;

  @ApiProperty({
    example: true,
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  notifications_anyoneCanSendMessage: string;

  @ApiProperty({
    example: true,
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  notifications_whoSubscribedMe: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  notifications_donatersOnly: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  notifications_nobody: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  notifications_advertisingNotifications: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  notifications_receiveEmailNotifications: string;
}
