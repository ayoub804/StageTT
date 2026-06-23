#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
composer install --no-dev --optimize-autoloader

# Build frontend assets
cd frontend
npm install
npm run build
cd ..

# Create symbolic link for storage
php artisan storage:link

# Run migrations
php artisan migrate --force
