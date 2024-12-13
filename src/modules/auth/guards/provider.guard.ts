import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

import { ProviderService } from '../provider/provider.service';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AuthProviderGuard implements CanActivate {
  public constructor(
    private readonly providerService: ProviderService,
    private readonly i18n: I18nService,
    private readonly db: PrismaService,
  ) {}

  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as Request;
    const activeUserId = request.session.userId;

    const provider = request.params.provider;

    const providerInstance = this.providerService.findByService(provider);

    const userSettings = await this.db.userSettings.findUnique({
      where: {
        userId: activeUserId,
      },
    });

    if (!userSettings)
      throw new BadRequestException('Пользователь не авторизован');

    if (!providerInstance) {
      throw new NotFoundException(
        this.i18n.t('errors.notFound', { lang: userSettings.language }),
      );
    }

    return true;
  }
}
