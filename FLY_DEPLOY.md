# Deploy en Fly.io

## Requisitos

1. Cuenta en [Fly.io](https://fly.io)
2. `flyctl` instalado

## Instalación de flyctl

```bash
curl -L https://fly.io/install.sh | sh
```

## Setup Inicial

### 1. Login

```bash
flyctl auth login
```

### 2. Crear la app

```bash
flyctl apps create arsenal-app --org personal
```

### 3. Crear volumen para persistir la base de datos

```bash
flyctl volume create sqlite_data --region iad --size 1
```

### 4. Deploy

```bash
flyctl deploy --remote-only
```

### 5. Verificar

```bash
flyctl status
flyctl open
```

## Con script automático

```bash
./fly-deploy.sh
```

## Variables de Entorno

No necesitas configurar DATABASE_URL — el Dockerfile ya lo hace:

- **Producción**: `/app/data/resources.db`
- **Desarrollo**: `./resources.db`

## Migraciones

Las migraciones se ejecutan automáticamente al hacer deploy gracias a `release_command` en `fly.toml`.

## Comandos Útiles

```bash
# Ver logs
flyctl logs

# SSH a la máquina
flyctl ssh console

# Ver estado
flyctl status

# Escalar
flyctl scale count 1

# Destruir app
flyctl apps destroy arsenal-app
```