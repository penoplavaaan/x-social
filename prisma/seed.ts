import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.hobbyCategory.createMany({
    data: [
      { name: 'Одежда' },
      { name: 'Луки' },
      { name: 'Стилисты' },
      { name: 'Исскуство' },
      { name: 'Образы' },
      { name: 'Культура' },
      { name: 'Машины' },
      { name: 'Гаджеты' },
      { name: 'Музыка' },
      { name: 'Фотографии' },
      { name: 'Видеоигры' },
      { name: 'Кино' },
      { name: 'Природа' },
      { name: 'Спорт' },
      { name: 'Технологии' },
      { name: 'Еда' },
      { name: 'Айти' },
      { name: 'Дизайн' },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
