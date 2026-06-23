#!/usr/bin/env bash
# Build script for Laravel on Render

echo "Starting build process..."

# Install Composer dependencies
echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node.js and npm (if not already installed)
echo "Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Build frontend assets
echo "Building frontend assets..."
cd frontend
npm install
npm run build
cd ..

# Set proper permissions
echo "Setting file permissions..."
chmod -R 775 storage bootstrap/cache

# Run Laravel optimizations
echo "Caching configuration and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force --no-interaction

echo "Build complete!"
