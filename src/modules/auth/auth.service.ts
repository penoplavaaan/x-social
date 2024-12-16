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
import { sha256 } from 'js-sha256';
import { randomUUID } from 'crypto';
import { VkProvider } from './provider/services/vk.provider';
import { CallbackVkDto, ConnectVkDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
    private readonly jwtService: JwtService,
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
    // const providerInstance = this.providerService.findByService(provider);
    // const profile = await providerInstance.findUserByCode(code);
    //
    // const account = await this.db.account.findFirst({
    //   where: {
    //     id: profile.id,
    //     provider: profile.provider,
    //   },
    // });
    //
    // const user = account?.userId
    //   ? await this.userService.findById(account.userId)
    //   : null;
    //
    // if (user) {
    //   return this.saveSession(req, user);
    // }
    //
    // const newUser = await this.userService.create({
    //   name: profile.name,
    //   nickName: randomUUID(),
    // });
    //
    // if (!account) {
    //   await this.db.account.create({
    //     data: {
    //       userId: newUser.id,
    //       type: 'oauth',
    //       provider: profile.provider,
    //       accessToken: profile.access_token,
    //       refreshToken: profile.refresh_token,
    //       expiresAt: profile.expires_at,
    //     },
    //     include: {
    //       User: {
    //         include: {
    //           picture: true,
    //         },
    //       },
    //     },
    //   });
    // }
    //
    // return this.saveSession(req, newUser);
  }

  public async extractProfileFromCodeVK(params: CallbackVkDto) {
    const providerInstance = new VkProvider({
      client_id: this.configService.getOrThrow<string>('VK_CLIENT_ID'),
      client_secret: this.configService.getOrThrow<string>('VK_CLIENT_SECRET'),
      scopes: ['email', 'avatar', 'info'],
    });
    const profile = await providerInstance.findUserV2(params);

    let account = await this.db.account.findFirst({
      where: {
        userId: profile.id,
        provider: profile.provider,
      },
    });

    const user = account?.userId
      ? await this.userService.findById(account.userId)
      : await this.userService.create({
          name: profile.user.first_name + ' ' + profile.user.last_name,
          nickName: randomUUID(),
        });

    if (account) {
      account = await this.db.account.update({
        where: {
          id: account.id,
        },
        data: {
          accessToken: profile.access_token,
          refreshToken: profile.refresh_token,
          expiresAt: this.secondsSinceEpoch() + profile.expires_at,
        },
        include: {
          User: {
            include: {
              picture: true,
            },
          },
        },
      });

      return {
        access_token: this.jwtService.sign(account),
      };
      // return account;
    }

    account = await this.db.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: profile.provider,
        accessToken: profile.access_token,
        refreshToken: profile.refresh_token,
        expiresAt: this.secondsSinceEpoch() + profile.expires_at,
      },
      include: {
        User: {
          include: {
            picture: true,
          },
        },
      },
    });

    return {
      access_token: this.jwtService.sign(account),
    };
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
    const randomString = this.makeid(60);

    const query = new URLSearchParams({
      client_id: '52845134',
      redirect_uri: 'https://x-social-wheat.vercel.app/',
      code_verifier: randomString,
      code_challenge: sha256(randomString),
      code_challenge_method: 'S256',
      state: '123',
      response_type: 'code',
    });

    return {
      url: `https://id.vk.com/authorize?${query}`,
    };
  }

  async connectVkV2(params: ConnectVkDto) {
    const query = new URLSearchParams({
      client_id: '52845134',
      redirect_uri: 'https://x-social-wheat.vercel.app/',
      code_challenge: params.code_challenge,
      code_challenge_method: params.code_challenge_method,
      state: params.state,
      response_type: 'code',
    });

    return {
      url: `https://id.vk.com/authorize?${query}`,
    };
  }

  makeid(length: number) {
    let result = '';
    const characters = '9';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  secondsSinceEpoch() {
    return Math.floor(Date.now() / 1000);
  }
}
