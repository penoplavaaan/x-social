import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {}

export class ConnectApiDto {
  @ApiProperty({
    default: 'yandex',
  })
  provider: string;
}


export class ConnectVkDto {
  @ApiProperty({
    default: 'Ecva0rcs3qLAestUu31E1X36pkUVcMqBR6Mm7FZpKHg',
    description:
      'S256 от code_verifier. code_verifier - Параметр, который обеспечивает защиту передаваемых данных. Параметр применяется при PKCE. Случайно сгенерированная строка, новая на каждый запрос авторизации. Может состоять из следующих символов: a-z, A-Z, 0-9, _, -. Длина от 43 до 128 символов. На основании строки формируется code_challenge: сервер преобразует code_verifier методом code_challenge_method, полученным в запросе на отправку кода подтверждения, и сравнивает результат с code_challenge из того же запроса. Параметр обязателен для обмена кода на токен',
  })
  code_challenge: string;
  @ApiProperty({
    default: 'S256',
  })
  code_challenge_method: string;
  @ApiProperty({
    default: 'TsdqRdz3EMfTsIifEHsBgWft3QnWzxI3ZFB7nKZBfs8UG',
  })
  state: string;
}

export class CallbackVkDto {
  @ApiProperty({
    default: '',
  })
  code: string;
  @ApiProperty({
    default: 'TsdqRdz3EMfTsIifEHsBgWft3QnWzxI3ZFB7nKZBfs8UG',
  })
  state: string;
  @ApiProperty({
    default: 'TsdqRdz3EMfTsIifEHsBgWft3QnWzxI3ZFB7nKZBfs8UG',
    description:
      'Параметр, который обеспечивает защиту передаваемых данных. Параметр применяется при PKCE. Случайно сгенерированная строка, новая на каждый запрос авторизации. Может состоять из следующих символов: a-z, A-Z, 0-9, _, -. Длина от 43 до 128 символов. На основании строки формируется code_challenge: сервер преобразует code_verifier методом code_challenge_method, полученным в запросе на отправку кода подтверждения, и сравнивает результат с code_challenge из того же запроса. Параметр обязателен для обмена кода на токен',
  })
  code_verifier: string;
  @ApiProperty({
    default: '',
  })
  device_id: string;
}
