import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  FindAllUsersDto,
  UpdateUserDto,
} from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class UserService {
  public constructor(private readonly db: PrismaService) {}

  async foloow(id: string, req: Request) {
    const userData = await this.db.user.update({
      where: {
        id: req.session.userId,
      },
      data: {
        followedBy: {
          connect: {
            id,
          },
        },
      },
    });

    return this.db.user.update({
      where: {
        id: id,
      },
      data: {
        followers: {
          connect: userData,
        },
      },
    });
  }

  async unfoloow(id: string, req: Request) {
    const userData = await this.db.user.findUnique({
      where: {
        id: req.session.userId,
      },
    });

    return this.db.user.update({
      where: {
        id: id,
      },
      data: {
        followedBy: {
          disconnect: userData,
        },
      },
    });
  }

  async findById(id: string) {
    const user = await this.db.user.findFirst({
      where: {
        OR: [{ id }, { nickName: id }],
      },
      include: {
        accounts: true,
        picture: true,
        subscription: true,
        _count: {
          select: {
            followedBy: true,
            followers: true,
            payedFollows: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findAll(params: FindAllUsersDto) {
    console.log(params);

    const { name, nickName, skip, take } = params;

    return this.db.user.findMany({
      skip: +skip,
      take: +take,
      where: {
        name: { contains: name, mode: 'insensitive' },
        nickName: { contains: nickName, mode: 'insensitive' },
      },
      include: {
        picture: true,
        _count: {
          select: {
            followedBy: true,
            followers: true,
            payedFollows: true,
            posts: true,
          },
        },
      },
    });
  }

  async create(userData: CreateUserDto) {
    const { picture, hobbyCategories } = userData;

    const userInDb = await this.db.user.findUnique({
      where: {
        nickName: userData.nickName,
      },
    });

    if (userInDb)
      throw new BadRequestException(
        'Пользователь с таким никнеймом уже существует',
      );

    const file = picture
      ? await this.db.file.findUnique({
          where: {
            fileName: picture,
          },
        })
      : undefined;

    const user = await this.db.user.create({
      data: {
        ...userData,

        picture: {
          connect: file || undefined,
        },
        userSettings: {
          create: {
            notifications: {
              create: {},
            },
          },
        },
      },
      include: {
        accounts: true,
      },
    });

    return user;
  }

  async update(id: string, userData: UpdateUserDto) {
    const {
      picture,
      notifications_advertisingNotifications,
      notifications_anyoneCanSendMessage,
      notifications_donatersOnly,
      notifications_nobody,
      notifications_receiveEmailNotifications,
      notifications_whoSubscribedMe,
      about,
      country,
      email,
      language,
      name,
      nickName,
      webSite,
      hobbyCategories,
    } = userData;

    const file = picture
      ? await this.db.file.findUnique({
          where: {
            fileName: picture,
          },
        })
      : undefined;

    return this.db.user.update({
      where: { id: id },
      data: {
        about,
        email,
        name,
        nickName,
        userSettings: {
          update: {
            webSite,
            country,
            language,
            notifications: {
              update: {
                advertisingNotifications:
                  notifications_advertisingNotifications === 'true',
                anyoneCanSendMessage:
                  notifications_anyoneCanSendMessage === 'true',
                donatersOnly: notifications_donatersOnly === 'true',
                nobody: notifications_nobody === 'true',
                receiveEmailNotifications:
                  notifications_receiveEmailNotifications === 'true',
                whoSubscribedMe: notifications_whoSubscribedMe === 'true',
              },
            },
          },
        },
        picture: {
          connect: file || undefined,
        },
      },
    });
  }
}
