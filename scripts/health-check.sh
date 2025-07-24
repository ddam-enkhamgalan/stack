#!/bin/bash

# Project Health Check Script
# This script checks the health and quality of the Stack project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Stack Project Health Check${NC}"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "✅ ${GREEN}$2${NC}"
    else
        echo -e "❌ ${RED}$2${NC}"
    fi
}

# Check Node.js and npm
echo -e "\n${YELLOW}📦 Checking Dependencies...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "✅ ${GREEN}Node.js: $NODE_VERSION${NC}"
else
    echo -e "❌ ${RED}Node.js not found${NC}"
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "✅ ${GREEN}npm: $NPM_VERSION${NC}"
else
    echo -e "❌ ${RED}npm not found${NC}"
fi

# Check project structure
echo -e "\n${YELLOW}🏗️  Checking Project Structure...${NC}"
REQUIRED_DIRS=("api" "client" "services" "docker" "terraform" "docs")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "✅ ${GREEN}$dir/ exists${NC}"
    else
        echo -e "❌ ${RED}$dir/ missing${NC}"
    fi
done

# Check package.json files
echo -e "\n${YELLOW}📋 Checking package.json files...${NC}"
PACKAGE_DIRS=("api" "client" "services")
for dir in "${PACKAGE_DIRS[@]}"; do
    if [ -f "$dir/package.json" ]; then
        echo -e "✅ ${GREEN}$dir/package.json exists${NC}"
        
        # Check if dependencies are installed
        if [ -d "$dir/node_modules" ]; then
            echo -e "  ✅ ${GREEN}Dependencies installed${NC}"
        else
            echo -e "  ⚠️  ${YELLOW}Dependencies not installed (run: cd $dir && npm install)${NC}"
        fi
    else
        echo -e "❌ ${RED}$dir/package.json missing${NC}"
    fi
done

# Check Docker files
echo -e "\n${YELLOW}🐳 Checking Docker Configuration...${NC}"
DOCKER_FILES=("docker/docker-compose.yml" "api/Dockerfile" "client/Dockerfile")
for file in "${DOCKER_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$file exists${NC}"
    else
        echo -e "❌ ${RED}$file missing${NC}"
    fi
done

# Check environment files
echo -e "\n${YELLOW}🔐 Checking Environment Configuration...${NC}"
ENV_FILES=("api/.env.example" "client/.env.example")
for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$file exists${NC}"
    else
        echo -e "⚠️  ${YELLOW}$file missing (recommended)${NC}"
    fi
done

# Check linting and formatting
echo -e "\n${YELLOW}🔧 Checking Code Quality Tools...${NC}"
for dir in "${PACKAGE_DIRS[@]}"; do
    echo -e "\n📁 ${BLUE}$dir/${NC}"
    
    # Check ESLint
    if [ -f "$dir/eslint.config.js" ] || [ -f "$dir/.eslintrc.js" ] || [ -f "$dir/eslint.config.mjs" ]; then
        echo -e "  ✅ ${GREEN}ESLint configured${NC}"
    else
        echo -e "  ⚠️  ${YELLOW}ESLint not configured${NC}"
    fi
    
    # Check Prettier
    if [ -f "$dir/.prettierrc" ] || [ -f "$dir/prettier.config.js" ]; then
        echo -e "  ✅ ${GREEN}Prettier configured${NC}"
    else
        echo -e "  ⚠️  ${YELLOW}Prettier not configured${NC}"
    fi
    
    # Check TypeScript
    if [ -f "$dir/tsconfig.json" ]; then
        echo -e "  ✅ ${GREEN}TypeScript configured${NC}"
    else
        echo -e "  ⚠️  ${YELLOW}TypeScript not configured${NC}"
    fi
done

# Check documentation
echo -e "\n${YELLOW}📚 Checking Documentation...${NC}"
DOC_FILES=("README.md" "docs/README.md" "docs/DEPLOYMENT.md" "docs/DATABASE.md" "docs/API.md" "docs/DEVELOPMENT.md")
for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$file exists${NC}"
    else
        echo -e "⚠️  ${YELLOW}$file missing${NC}"
    fi
done

# Security check
echo -e "\n${YELLOW}🔒 Security Check...${NC}"
SENSITIVE_FILES=(".env" "api/.env" "client/.env" "services/.env")
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "⚠️  ${YELLOW}$file found (ensure it's in .gitignore)${NC}"
    fi
done

# Check git configuration
echo -e "\n${YELLOW}📝 Checking Git Configuration...${NC}"
if [ -d ".git" ]; then
    echo -e "✅ ${GREEN}Git repository initialized${NC}"
    
    if [ -f ".gitignore" ]; then
        echo -e "✅ ${GREEN}.gitignore exists${NC}"
    else
        echo -e "❌ ${RED}.gitignore missing${NC}"
    fi
else
    echo -e "⚠️  ${YELLOW}Not a git repository${NC}"
fi

echo -e "\n${BLUE}Health check complete!${NC}"
echo -e "Run ${YELLOW}./scripts/clean.sh${NC} to clean and organize the project"
echo -e "Run ${YELLOW}npm install${NC} in api/, client/, and services/ directories"
