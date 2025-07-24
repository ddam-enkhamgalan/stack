#!/bin/bash
set -e

echo "🧹 Cleaning Stack project build artifacts"

print_status() {
    echo -e "\033[0;32m[INFO]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

# Clean API
print_status "Cleaning API..."
cd api
rm -rf dist/
rm -rf node_modules/.cache/
npm run clean 2>/dev/null || true

# Clean Client
print_status "Cleaning Client..."
cd ../client
rm -rf .next/
rm -rf dist/
rm -rf node_modules/.cache/

# Clean Services
print_status "Cleaning Services..."
cd ../services
rm -rf dist/
rm -rf *.zip
npm run clean 2>/dev/null || true

# Clean Docker
print_status "Cleaning Docker..."
cd ../docker
docker-compose down 2>/dev/null || true
docker system prune -f --volumes 2>/dev/null || true

# Clean root
print_status "Cleaning root directory..."
cd ..
rm -rf node_modules/
rm -rf .nyc_output/
rm -rf coverage/

print_status "✅ Project cleaned successfully!"
echo "To reinstall dependencies, run:"
echo "  cd api && npm install"
echo "  cd client && npm install" 
echo "  cd services && npm install"
