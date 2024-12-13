import { Injectable } from '@nestjs/common';
import {
  CreatePostDto,
  FindAllPosts,
  MediaTypeEnum,
} from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class PostService {
  constructor(private readonly db: PrismaService) {}

  async create(createPostDto: CreatePostDto, req: Request) {
    const { language, media, text, title, productsId } = createPostDto;

    const session = req.session;

    return this.db.post.create({
      data: {
        title,
        language,
        text,
        author: {
          connect: {
            id: session.userId,
          },
        },

        Media: {
          create: Array.from(
            productsId.map((id) => ({
              type: 'PRODUCT',
              url: 'нет',
              product: {
                connect: {
                  id,
                },
              },
            })),
          ),
        },
      },
    });
  }

  async like(postId: string, req: Request) {
    const session = req.session;

    const findUser = await this.db.user.findFirst({
      where: {
        likedPosts: {
          some: {
            id: {
              equals: postId,
            },
          },
        },
      },
    });

    if (findUser) {
      const user = await this.db.user.update({
        where: {
          id: session.userId,
        },
        data: {
          likedPosts: {
            disconnect: {
              id: postId,
            },
          },
        },
      });

      return this.db.post.update({
        where: {
          id: postId,
        },
        data: {
          likedBy: {
            disconnect: user,
          },
        },
      });
    }

    const user = await this.db.user.update({
      where: {
        id: session.userId,
      },
      data: {
        likedPosts: {
          connect: {
            id: postId,
          },
        },
      },
    });

    return this.db.post.update({
      where: {
        id: postId,
      },
      data: {
        likedBy: {
          connect: user,
        },
      },
    });
  }

  findAll(params: FindAllPosts) {
    const { search, skip, take } = params;

    return this.db.post.findMany({
      take: +take,
      skip: +skip,
      where: {
        OR: [
          { author: { name: { contains: search, mode: 'insensitive' } } },
          { author: { nickName: { contains: search, mode: 'insensitive' } } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            likedBy: true,
            viewedBy: true,
          },
        },
        Media: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: string, req: Request) {
    const session = req.session;

    return this.db.post.update({
      where: {
        id: String(id),
      },
      data: {
        viewedBy: {
          connect: {
            id: session.userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            likedBy: true,
            viewedBy: true,
          },
        },
      },
    });
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    const { language, media, productsId, text, title } = updatePostDto;

    return this.db.post.update({
      where: {
        id,
      },
      data: {
        language,
        text,
        title,
      },
    });
  }

  remove(id: string) {
    return this.db.post.delete({
      where: {
        id,
      },
    });
  }
}
