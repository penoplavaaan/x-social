# Targets
.PHONY: it up down ps rs logs recreate

it:
	docker compose run --rm server npm i && make up
dev:
	docker compose run --rm server npm run start:dev
seed:
	docker compose run --rm server npx prisma db seed
migrate:
	docker compose run --rm server npx prisma migrate dev
ex:
	docker compose exec server sh
up:
	docker compose up -d
down:
	docker compose down
ps:
	docker compose ps
rs:
	docker compose restart
logs:
	docker compose logs
logsf:
	docker compose logs -f
recreate:
	make down && make up
