DOCKER_SHELL		:= /bin/ash

PROJECT_DIRECTORY	:= ./
PROJECT_ENV_BRANCH	:= 171-feat-mock-and-env
PROJECT_ENV_BASE_URL	:= https://raw.githubusercontent.com/RS3A/Transcendence/refs/heads/$(PROJECT_ENV_BRANCH)

ROOT_ENV_FILE		:= $(PROJECT_DIRECTORY)/.env
PYTHON_ENV_FILE		:= $(PROJECT_DIRECTORY)/python-service/.env

# Local env files can be absent in production and fetched by `prepare-files`.
-include $(ROOT_ENV_FILE)

QUIET				:= > /dev/null 2>&1

DOCKER_COMPOSE		:= $(shell \
	if docker compose version $(QUIET); \
		then \
		echo 'docker compose'; \
	elif docker-compose version $(QUIET); \
		then \
		echo 'docker-compose'; \
	fi) --project-directory $(PROJECT_DIRECTORY)

VOLUMES				:= postgres_data \
						mongo_data \
						grafana_data
						
VOLUMES_DIRECTORY   := $(VOLUMES:%=./data/%)

SERVICES			:= api \
					   db \
					   frontend \
					   python-service \
					   mongodb \
					   prometheus \
					   grafana \
					   node-exporter \
					   cadvisor \
					   postgres-exporter \
					   mongodb-exporter \
					   nginx

ifdef SERVICE
	SERVICES 		:= $(SERVICE)
endif

DOMAIN				:= ft-trans.42.fr

all: prepare-files
	@mkdir -p $(VOLUMES_DIRECTORY)
# 	@chmod -R 777 ./data
	@if ! grep -q "$(DOMAIN)" /etc/hosts 2>/dev/null; then \
		echo "127.0.0.1 $(DOMAIN)" | sudo tee -a /etc/hosts > /dev/null; \
		echo "$(DOMAIN) added to /etc/hosts"; \
	fi
	@BUILDKIT=1 $(DOCKER_COMPOSE) up -d $(SERVICES)

prepare-files:
	@if [ ! -f "$(ROOT_ENV_FILE)" ]; then \
		echo "Downloading $(ROOT_ENV_FILE) from branch $(PROJECT_ENV_BRANCH)..."; \
		curl -fsSL "$(PROJECT_ENV_BASE_URL)/.env" -o "$(ROOT_ENV_FILE)"; \
	fi
	@if [ ! -f "$(PYTHON_ENV_FILE)" ]; then \
		echo "Downloading $(PYTHON_ENV_FILE) from branch $(PROJECT_ENV_BRANCH)..."; \
		curl -fsSL "$(PROJECT_ENV_BASE_URL)/python-service/.env" -o "$(PYTHON_ENV_FILE)"; \
	fi

	@if [ ! -f "$(ROOT_ENV_FILE)" ] || [ ! -f "$(PYTHON_ENV_FILE)" ]; then \
		echo "Error: env files are missing after download attempt."; \
		exit 1; \
	fi
	@project_name=$$(grep -E '^COMPOSE_PROJECT_NAME=' "$(ROOT_ENV_FILE)" | head -n 1 | cut -d '=' -f2-); \
	if [ -n "$$project_name" ]; then \
		sanitized_name=$$(printf '%s' "$$project_name" | sed -E 's/^([a-z0-9][a-z0-9_-]*).*/\1/'); \
		case "$$sanitized_name" in \
			[a-z0-9][a-z0-9_-]*) ;; \
			*) sanitized_name='transcendence' ;; \
		esac; \
		if [ "$$project_name" != "$$sanitized_name" ]; then \
			echo "Fixing invalid COMPOSE_PROJECT_NAME ('$$project_name' -> '$$sanitized_name') in $(ROOT_ENV_FILE)"; \
			sed -i "s/^COMPOSE_PROJECT_NAME=.*/COMPOSE_PROJECT_NAME=$$sanitized_name/" "$(ROOT_ENV_FILE)"; \
		fi; \
	fi

up: prepare-files
	@mkdir -p $(VOLUMES_DIRECTORY)
	@if ! grep -q "$(DOMAIN)" /etc/hosts 2>/dev/null; then \
		echo "127.0.0.1 $(DOMAIN)" | sudo tee -a /etc/hosts > /dev/null; \
		echo "$(DOMAIN) added to /etc/hosts"; \
	fi
	@BUILDKIT=1 $(DOCKER_COMPOSE) up -d $(SERVICES)

stop:
	@$(DOCKER_COMPOSE) stop $(SERVICES)

start:
	@$(DOCKER_COMPOSE) start $(SERVICES)

restart:
	@$(DOCKER_COMPOSE) restart $(SERVICES)

down:
	@$(DOCKER_COMPOSE) down $(SERVICES)

logs:
	@$(DOCKER_COMPOSE) logs --follow $(SERVICES)

build: prepare-files
	@$(DOCKER_COMPOSE) build --no-cache $(SERVICES)

ps:
	@$(DOCKER_COMPOSE) ps --all $(SERVICES)

shell-%:
	@if docker ps | grep -w $* $(QUIET); \
	then \
		docker exec -it $* $(DOCKER_SHELL); \
	else \
		echo "image 'shell-$*' not found"; \
	fi

clean:
	@$(DOCKER_COMPOSE) down --timeout 1 --rmi local 2>/dev/null || true

fclean: clean
	@$(DOCKER_COMPOSE) down --timeout 1 --volumes 2>/dev/null || true
	@docker volume prune -f $(QUIET) || true

re: fclean all

prune:
	@docker system prune

.PHONY: all prepare-files up stop start restart down logs build ps shell-% clean fclean re prune