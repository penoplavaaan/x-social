import { ConfigService } from '@nestjs/config';
import { TypeOptions } from 'src/modules/auth/provider/provider.constants';
import { VkProvider } from 'src/modules/auth/provider/services/vk.provider';

import { YandexProvider } from 'src/modules/auth/provider/services/yandex.provider';

export const getProvidersConfig = async (
  configService: ConfigService,
): Promise<TypeOptions> => ({
  baseUrl: configService.getOrThrow<string>('APPLICATION_URL'),
  services: [
    // new GoogleProvider({
    // 	client_id: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    // 	client_secret: configService.getOrThrow<string>(
    // 		'GOOGLE_CLIENT_SECRET'
    // 	),
    // 	scopes: ['email', 'profile']
    // }),
    new YandexProvider({
      client_id: configService.getOrThrow<string>('YANDEX_CLIENT_ID'),
      client_secret: configService.getOrThrow<string>('YANDEX_CLIENT_SECRET'),
      scopes: ['login:email', 'login:avatar', 'login:info'],
    }),

    new VkProvider({
      client_id: configService.getOrThrow<string>('VK_CLIENT_ID'),
      client_secret: configService.getOrThrow<string>('VK_CLIENT_SECRET'),
      scopes: ['email', 'avatar', 'info'],
    }),
  ],
});
