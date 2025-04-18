# Ocean of Puzzles Makefile
# Simple developer shortcuts for common tasks

.PHONY: dev front back compose clean check help

## make dev          - Full stack (auto ports if DYNAMIC_PORTS=1)
dev:
	./dev.sh all

## make front        - Front-end only
front:
	./dev.sh front

## make back         - Back-end only
back:
	./dev.sh back

## make compose      - Docker compose dev stack 
compose:
	./dev.sh compose

## make clean        - Stop & prune volumes
clean:
	./dev.sh clean

## make check        - Check if ports are available
check:
	./dev.sh check

## make ports        - Run with dynamic port allocation
ports:
	DYNAMIC_PORTS=1 ./dev.sh

## make build        - Build frontend and backend
build:
	npm run build

## make test         - Run all tests
test:
	npm test

## make lint         - Run linting
lint:
	npm run lint

## make help         - Display this help message
help:
	@grep -h -E '^## ' ${MAKEFILE_LIST} | sed -e 's/## //'

# Default target
.DEFAULT_GOAL := help