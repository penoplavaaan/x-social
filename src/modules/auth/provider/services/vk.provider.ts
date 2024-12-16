import { BaseOAuthService } from './base-oauth.service';
import { TypeProviderOptions } from './types/provider-options.types';
import { TypeUserInfo } from './types/user-info.types';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CallbackVkDto } from '../../dto/create-auth.dto';

export class VkProvider extends BaseOAuthService {
  public constructor(options: TypeProviderOptions) {
    super({
      name: 'vk',
      authorize_url: 'https://id.vk.com/authorize',
      access_url: 'https://id.vk.com/oauth2/auth',
      profile_url: 'https://id.vk.com/oauth2/public_info',
      scopes: options.scopes,
      client_id: options.client_id,
      client_secret: options.client_secret,
    });
  }

  public async extractUserInfo(data: VKProfile): Promise<TypeUserInfo> {
    return super.extractUserInfo({
      name: data.scope,
      picture: data.id_token
        ? `https://avatars.yandex.net/get-yapic/${data.user_id}/islands-200`
        : undefined,
    });
  }

  public async extractUserInfoV2(data: VKFullData): Promise<TypeVkUserInfo> {
    return {
      id: data.user.user_id,
      picture: data.user.avatar,
      name: data.user.first_name + ' ' + data.user.last_name,
      email: data.user.email,
      provider: this.options.name,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: data.user,
    };
  }

  public async findUserV2(params: CallbackVkDto): Promise<TypeVkUserInfo> {
    const client_id = this.options.client_id;

    const tokenQuery = new URLSearchParams({
      grant_type: 'authorization_code',
      code_verifier: params.code_verifier,
      redirect_uri: 'https://x-social-wheat.vercel.app/',
      code: params.code,
      client_id: client_id,
      device_id: params.device_id,
    });

    const tokensRequest = await fetch(this.options.access_url, {
      method: 'POST',
      body: tokenQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    if (!tokensRequest.ok) {
      throw new BadRequestException(
        `Не удалось получить пользователя с ${this.options.profile_url} (${this.options.name}). Проверьте правильность токена доступа.`,
      );
    }

    const tokens = await tokensRequest.json();

    if (!tokens.access_token && !tokens.id_token) {
      throw new BadRequestException({
        objectOrError: tokens,
        descriptionOrOptions: [tokens, tokenQuery.toString()],
      });
    }

    const userQuery = new URLSearchParams({
      id_token: tokens.id_token,
      client_id: client_id,
    });

    const userRequest = await fetch(this.options.profile_url, {
      method: 'POST',
      body: userQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
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
      user: user as VKUser,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_in,
    } as VKFullData);

    return userData;
  }
}

interface VKProfile {
  refresh_token: string;
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: string;
  user_id: string;
  state: string;
  scope: string[];
}

interface VKUser {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar: string;
  email: string;
}

interface VKFullData {
  user: VKUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface TypeVkUserInfo {
  id: string;
  picture: string;
  name: string;
  email: string;
  access_token: string | null;
  refresh_token: string;
  expires_at: number;
  provider: string;
  user: VKUser;
}
