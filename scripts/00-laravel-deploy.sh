#!/usr/bin/env bash
echo "Running composer"
cd /var/www/html
composer install --no-dev

echo "Installing npm dependencies for frontend"
cd /var/www/html/frontend
rm -rf node_modules package-lock.json
npm install

echo "Building React frontend"
npm run build
cd /var/www/html

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force
