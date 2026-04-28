#!/bin/bash
# Script para deployar arsenal-app en Fly.io
# Uso: ./fly-deploy.sh

set -e

echo "🚀 Deploying arsenal-app to Fly.io..."

# Verificar que flyctl esté instalado
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl no está instalado."
    echo "Instálalo con: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Login si no está autenticado
echo "🔐 Verificando autenticación..."
flyctl auth whoami &> /dev/null || flyctl auth login

# Crear la app si no existe
echo "📦 Verificando app..."
if ! flyctl apps list | grep -q "arsenal-app"; then
    echo "📦 Creando nueva app..."
    flyctl apps create arsenal-app --org personal
else
    echo "✅ App ya existe"
fi

# Crear volumen para SQLite si no existe
echo "💾 Verificando volumen..."
if ! flyctl volume list | grep -q "sqlite_data"; then
    echo "💾 Creando volumen para datos..."
    flyctl volume create sqlite_data --region iad --size 1
fi

# Deploy
echo "🚀 Ejecutando deploy..."
flyctl deploy --remote-only

# Verificar estado
echo "✅ Deploy completado!"
flyctl status