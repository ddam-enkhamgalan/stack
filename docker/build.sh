#!/bin/bash

# Stack Docker Build Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
ENVIRONMENT="development"
BUILD_CACHE="true"
PUSH_REGISTRY=""
REGISTRY_PREFIX=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --no-cache)
            BUILD_CACHE="false"
            shift
            ;;
        --push)
            PUSH_REGISTRY="$2"
            shift 2
            ;;
        --registry-prefix)
            REGISTRY_PREFIX="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment ENV    Set environment (development|production) [default: development]"
            echo "  --no-cache              Build without using cache"
            echo "  --push REGISTRY         Push images to registry"
            echo "  --registry-prefix PREFIX Registry prefix for image names"
            echo "  -h, --help              Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Building Stack application for $ENVIRONMENT environment"

# Change to docker directory
cd "$(dirname "$0")"

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Environment must be 'development' or 'production'"
    exit 1
fi

# Set cache flag
CACHE_FLAG=""
if [[ "$BUILD_CACHE" == "false" ]]; then
    CACHE_FLAG="--no-cache"
    print_warning "Building without cache"
fi

# Build images
print_status "Building API image..."
if [[ -n "$REGISTRY_PREFIX" ]]; then
    API_IMAGE="$REGISTRY_PREFIX/stack-api:latest"
else
    API_IMAGE="stack-api:latest"
fi

docker build $CACHE_FLAG -f api.Dockerfile -t "$API_IMAGE" ../
if [[ $? -eq 0 ]]; then
    print_status "API image built successfully: $API_IMAGE"
else
    print_error "Failed to build API image"
    exit 1
fi

print_status "Building Client image..."
if [[ -n "$REGISTRY_PREFIX" ]]; then
    CLIENT_IMAGE="$REGISTRY_PREFIX/stack-client:latest"
else
    CLIENT_IMAGE="stack-client:latest"
fi

docker build $CACHE_FLAG -f client.Dockerfile -t "$CLIENT_IMAGE" ../
if [[ $? -eq 0 ]]; then
    print_status "Client image built successfully: $CLIENT_IMAGE"
else
    print_error "Failed to build client image"
    exit 1
fi

# Push to registry if specified
if [[ -n "$PUSH_REGISTRY" ]]; then
    print_status "Pushing images to registry: $PUSH_REGISTRY"
    
    # Tag images for registry
    if [[ -z "$REGISTRY_PREFIX" ]]; then
        REGISTRY_PREFIX="$PUSH_REGISTRY"
    fi
    
    docker tag "$API_IMAGE" "$REGISTRY_PREFIX/stack-api:latest"
    docker tag "$CLIENT_IMAGE" "$REGISTRY_PREFIX/stack-client:latest"
    
    # Push images
    print_status "Pushing API image..."
    docker push "$REGISTRY_PREFIX/stack-api:latest"
    
    print_status "Pushing Client image..."
    docker push "$REGISTRY_PREFIX/stack-client:latest"
    
    print_status "Images pushed successfully!"
fi

# Show next steps
echo ""
print_status "Build complete! Next steps:"
if [[ "$ENVIRONMENT" == "development" ]]; then
    echo "  • Start development environment: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up"
else
    echo "  • Start production environment: docker-compose up -d"
fi
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo ""
print_status "Application will be available at:"
echo "  • Client: http://localhost:4000"
echo "  • API: http://localhost:3000"
echo "  • API Docs: http://localhost:3000/api-docs"
