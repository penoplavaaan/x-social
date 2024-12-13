import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ProviderService } from './provider/provider.service';
import cryptoRandomString from 'crypto-random-string';
import { sha256 } from 'js-sha256';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
  ) {}

  async register() {}

  async login() {}

  async logout(req: Request, res: Response) {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      req.session.destroy((err) => {
        if (err) {
          return reject(new InternalServerErrorException(''));
        }
        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
        resolve({});
      });
    });
  }

  public async extractProfileFromCode(
    req: Request,
    provider: string,
    code: string,
  ) {
    const providerInstance = this.providerService.findByService(provider);
    const profile = await providerInstance.findUserByCode(code);

    const account = await this.db.account.findFirst({
      where: {
        id: profile.id,
        provider: profile.provider,
      },
    });

    let user = account?.userId
      ? await this.userService.findById(account.userId)
      : null;

    if (user) {
      return this.saveSession(req, user);
    }

    const newUser = await this.userService.create({
      name: profile.name,
      nickName: randomUUID(),
    });

    if (!account) {
      await this.db.account.create({
        data: {
          userId: newUser.id,
          type: 'oauth',
          provider: profile.provider,
          accessToken: profile.access_token,
          refreshToken: profile.refresh_token,
          expiresAt: profile.expires_at,
        },
        include: {
          User: {
            include: {
              picture: true,
            },
          },
        },
      });
    }

    return this.saveSession(req, newUser);
  }

  private async saveSession(req: Request, user: User) {
    const userInfo = await this.db.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        picture: true,
      },
    });

    if (!userInfo) throw new BadRequestException('Пользователь не найден');

    return new Promise((res, rej) => {
      req.session.userId = user.id;
      req.session.userData = {
        name: user.name,
        picture: userInfo?.picture?.url,
        nickName: userInfo?.nickName,
      };

      req.session.save((error) => {
        if (error) {
          return rej(
            new InternalServerErrorException('Не удалось сохранить сессию'),
          );
        }

        res({ user });
      });
    });
  }

  async connectVK() {
    const randomString = cryptoRandomString({ length: 60 });

    const query = new URLSearchParams({
      client_id: '52771234',
      redirect_uri: 'https://fancy.ru.tuna.am',
      code_verifier: randomString,
      code_challenge: sha256(randomString),
      code_challenge_method: 'S256',
      state: '123',
    });

    return {
      url: `https://id.vk.com/authorize?${query}`,
    };
  }
}
