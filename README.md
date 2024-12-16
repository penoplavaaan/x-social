## First time create 
```shell
cp .env.example .env
```
Далее необхоимо задать пароль для бд и токены для интеграций
```env
POSTGRES_PASSWORD=''

YANDEX_CLIENT_ID=""
YANDEX_CLIENT_SECRET=""

VK_CLIENT_ID=""
VK_CLIENT_SECRET=""
```

### Билд
Для того, чтобы прокинуть node_modules локально
``` shell
make it
```