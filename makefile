install:
	npm --prefix ./production/www install
	npm --prefix ./production/admin install
	npm --prefix ./production/auth install
	npm --prefix ./production/gateway install
	npm --prefix ./production/user install
	npm --prefix ./production/websocket install
	mkdir -p ./data/admin ./data/auth ./data/avatar
	chmod -R a+rw ./data/admin ./data/auth ./data/avatar

up: # install
	cp .env deploy/.env
	docker-compose -f deploy/docker-compose.yml up --build

down:
	docker-compose -f deploy/docker-compose.yml down --remove-orphans
