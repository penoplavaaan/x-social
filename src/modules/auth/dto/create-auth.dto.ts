import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {}

export class ConnectApiDto {
  @ApiProperty({
    default: 'yandex',
  })
  provider: string;
}
