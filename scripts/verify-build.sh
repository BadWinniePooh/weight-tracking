#!/bin/bash

# Build Verification Script
# This script runs the same checks as the CI pipeline locally

set -e

echo "🔍 Starting build verification..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print step
print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Set up environment variables
export DATABASE_URL="file:./prisma/test.db"
export NEXTAUTH_SECRET="test-secret-local"
export NEXTAUTH_URL="http://localhost:3000"
export NODE_ENV="development"

print_step "Installing dependencies..."
npm ci
print_success "Dependencies installed"

print_step "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

print_step "Running database migrations..."
npx prisma migrate deploy
print_success "Database migrations completed"

print_step "Running ESLint..."
npm run lint
print_success "Linting passed"

print_step "Checking TypeScript compilation..."
npx tsc --noEmit
print_success "TypeScript compilation successful"

print_step "Building Next.js application..."
npm run build
print_success "Next.js build completed"

print_step "Testing module imports..."
node -e "
try {
  console.log('Testing Next.js import...');
  require('next');
  console.log('Testing Prisma import...');
  require('@prisma/client');
  console.log('Testing React import...');
  require('react');
  console.log('All critical dependencies can be imported successfully');
} catch (error) {
  console.error('Import test failed:', error.message);
  process.exit(1);
}
"
print_success "Module imports working"

# Cleanup
print_step "Cleaning up test artifacts..."
rm -f ./prisma/test.db*
print_success "Cleanup completed"

echo -e "${GREEN}🎉 All build verification checks passed!${NC}"