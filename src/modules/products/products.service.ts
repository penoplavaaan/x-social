import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import puppeteer from 'puppeteer-extra';
import { PrismaService } from '../prisma/prisma.service';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

@Injectable()
export class ProductsService {
  constructor(private readonly db: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { url } = createProductDto;

    let resData: { price: number; title: string; images: string[] } = null;

    await puppeteer
      .use(StealthPlugin())
      .launch({ headless: true, args: ['--no-sandbox'] })
      .then(async (browser) => {
        const page = await browser.newPage();
        await page.goto(url);
        await new Promise(function (resolve) {
          setTimeout(resolve, 1000);
        });
        await page.screenshot({ path: 'stealth.png', fullPage: true });

        const data = await page.evaluate(() => {
          try {
            return {
              title: document.querySelector('[data-additional-zone="title"]')
                .innerHTML,
              price:
                parseInt(
                  document.querySelector('[data-auto="price-value"]')
                    ?.textContent,
                ) ||
                parseInt(
                  document
                    .querySelector('[data-auto="snippet-price-current"]')
                    ?.textContent?.split(':')?.[1],
                ) ||
                0,

              images: Array.from(
                document?.querySelectorAll(
                  '[data-auto="media-viewer-thumbnails"] img',
                ),
              )
                //@ts-ignore
                .map((el) => el?.src)
                .reverse()
                .splice(0, 5)
                .reverse(),
            };
          } catch (error) {
            throw new Error('Не удалось спарсить продукт');
          }
        });

        resData = data;

        await browser.close();

        return data;
      });

    if (!resData) throw new BadRequestException('что то пошло не так');

    return this.db.product.create({
      data: {
        link: url,
        name: resData.title,
        price: resData.price,
        images: resData.images,
      },
    });
  }

  findAll() {
    return this.db.product.findMany();
  }

  findOne(id: number) {
    return this.db.product.findUnique({
      where: {
        id: String(id),
      },
    });
  }


}
