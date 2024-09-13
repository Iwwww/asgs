# Автоматическая система поставки товаров

# Installation

## Pre requirements

- bun
- docker

## Installation

Get sources

```shell
git clone git@github.com:Iwwww/asgs.git
cd asgs
```

### Backend

```shell
docker compose --env-file=.env.dev up -d
```

Verify backend works fine on [localhost:8000](http://localhost:8000)

You can log in as superuse with this credentials:

**Username:** `superuser`

**Password:** `superpassword`

### Frontend

```shell
cd frontend
bun install
bun dev
```

Verify frontend works fine on [localhost:5173](http://localhost:5173)

To login as **factory**/**carrier**/**sale point** user you have to add this users with this route: [localhost:8000/register-user/](http://localhost:8000/register-user/)
