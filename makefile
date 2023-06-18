install:
	npm --prefix ./production/www install
	npm --prefix ./production/admin install
	npm --prefix ./production/auth install
	npm --prefix ./production/gateway install
	npm --prefix ./production/user install
	npm --prefix ./production/websocket install
	mkdir -p ./data/admin ./data/auth ./data/avatar
	chmod -R a+rw ./data

up:
	cp .env depoy/.env
	docker-compose -f docker-compose.yml up -d

down:
	docker-compose -f docker-compose.yml down --remove-orphans
