import { BaseOAuthService } from './base-oauth.service';
import { TypeProviderOptions } from './types/provider-options.types';
import { TypeUserInfo } from './types/user-info.types';
import { CallbackVkDto, CallbackYandexDto } from '../../dto/create-auth.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class YandexProvider extends BaseOAuthService {
  public constructor(options: TypeProviderOptions) {
    super({
      name: 'yandex',
      authorize_url: 'https://oauth.yandex.ru/authorize',
      access_url: 'https://oauth.yandex.ru/token',
      profile_url: 'https://login.yandex.ru/info?format=json',
      scopes: options.scopes,
      client_id: options.client_id,
      client_secret: options.client_secret,
    });
  }

  public async extractUserInfo(data: YandexProfile): Promise<TypeUserInfo> {
    return super.extractUserInfo({
      email: data.emails[0],
      name: data.display_name,
      picture: data.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`
        : undefined,
    });
  }

  public async extractUserInfoV2(
    data: YandexFullData,
  ): Promise<TypeYandexUserInfo> {
    return {
      id: data.user.id,
      picture: `https://avatars.yandex.net/get-yapic/${data.user.default_avatar_id ?? 0}/islands-200`,
      name: data.user.real_name,
      email: data.user.default_email,
      provider: this.options.name,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: data.user,
    };
  }

  public async findUserV2(
    params: CallbackYandexDto,
  ): Promise<TypeYandexUserInfo> {
    const client_id = this.options.client_id;
    const client_secret = this.options.client_secret;

    const tokenQuery = new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
    });

    const tokensRequest = await fetch(this.options.access_url, {
      method: 'POST',
      body: tokenQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(client_id + ':' + client_secret),
        Accept: 'application/json',
      },
    });

    if (!tokensRequest.ok) {
      throw new BadRequestException(
        `Не удалось получить пользователя с ${this.options.profile_url} (${this.options.name}). Проверьте правильность токена доступа.`,
      );
    }

    const tokens = await tokensRequest.json();

    if (!tokens.access_token) {
      throw new BadRequestException({
        objectOrError: tokens,
        descriptionOrOptions: [tokens, tokenQuery.toString()],
      });
    }

    const userRequest = await fetch(this.options.profile_url, {
      method: 'GET',
      headers: {
        Authorization: 'OAuth ' + tokens.access_token,
        Accept: 'application/json',
      },
    });

    if (!userRequest.ok) {
      throw new UnauthorizedException(
        `Не удалось получить пользователя с ${this.options.profile_url}. Проверьте правильность токена доступа.`,
      );
    }

    const user = await userRequest.json();
    const userData = await this.extractUserInfoV2({
      user: user as YandexUser,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_in,
    } as YandexFullData);

    return userData;
  }
}

interface YandexProfile {
  login: string;
  id: string;
  client_id: string;
  psuid: string;
  emails?: string[];
  default_email?: string;
  is_avatar_empty?: boolean;
  default_avatar_id?: string;
  birthday?: string | null;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  real_name?: string;
  sex?: 'male' | 'female' | null;
  default_phone?: { id: number; number: string };
  access_token: string;
  refresh_token?: string;
}

interface YandexUser {
  login: string;
  id: string;
  client_id: string;
  psuid: string;
  emails?: string[];
  default_email?: string;
  is_avatar_empty?: boolean;
  default_avatar_id?: string;
  birthday?: string | null;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  real_name?: string;
  sex?: 'male' | 'female' | null;
  default_phone?: { id: number; number: string };
  access_token: string;
  refresh_token?: string;
}

interface YandexFullData {
  user: YandexUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface TypeYandexUserInfo {
  id: string;
  picture: string;
  name: string;
  email: string;
  access_token: string | null;
  refresh_token: string;
  expires_at: number;
  provider: string;
  user: YandexUser;
}
