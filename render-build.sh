#!/usr/bin/env bash
# Build script for Laravel on Render

echo "Starting build process..."

# Install Composer dependencies
echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node.js 20 using NVM
echo "Installing Node.js 20..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# Build frontend assets
echo "Building frontend assets..."
cd frontend
npm install
npm run build
cd ..

# Set proper permissions
echo "Setting file permissions..."
chmod -R 775 storage bootstrap/cache

# Copy built frontend assets to public directory for Laravel to serve
echo "Copying frontend build to Laravel public..."
cp -r frontend/dist/* public/

# Run Laravel optimizations
echo "Caching configuration and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force --no-interaction

echo "Build complete!"
