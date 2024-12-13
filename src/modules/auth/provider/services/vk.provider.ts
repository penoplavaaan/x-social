import { BaseOAuthService } from './base-oauth.service';
import { TypeProviderOptions } from './types/provider-options.types';
import { TypeUserInfo } from './types/user-info.types';

export class VkProvider extends BaseOAuthService {
  public constructor(options: TypeProviderOptions) {
    super({
      name: 'vk',
      authorize_url: 'https://id.vk.com/authorize',
      access_url: 'https://id.vk.com/oauth2/token',
      profile_url: 'https://login.yandex.ru/info?format=json',
      scopes: options.scopes,
      client_id: options.client_id,
      client_secret: options.client_secret,
    });
  }

  public async extractUserInfo(data: YandexProfile): Promise<TypeUserInfo> {
    return super.extractUserInfo({
      name: data.scope,
      picture: data.id_token
        ? `https://avatars.yandex.net/get-yapic/${data.user_id}/islands-200`
        : undefined,
    });
  }
}

interface YandexProfile {
  refresh_token: string;
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: string;
  user_id: string;
  state: string;
  scope: string[];
}
