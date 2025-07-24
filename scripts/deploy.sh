#!/bin/bash
set -e

# Configuration
PROJECT_NAME="stack"
ENVIRONMENT="dev"
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Building and deploying Stack project to AWS ECS"
echo "Project: ${PROJECT_NAME}-${ENVIRONMENT}"
echo "Region: ${AWS_REGION}"
echo "Account: ${AWS_ACCOUNT_ID}"

# Step 1: Build Lambda services
echo "📦 Building Lambda services..."
cd services
npm install
npm run build
npm run package

# Step 2: Deploy Terraform infrastructure
echo "🏗️  Deploying infrastructure with Terraform..."
cd ../terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan \
  -var="project_name=${PROJECT_NAME}" \
  -var="environment=${ENVIRONMENT}" \
  -var="aws_region=${AWS_REGION}" \
  -out=tfplan

# Apply the plan
terraform apply tfplan

# Get outputs
ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url)
ECS_CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
ECS_SERVICE_NAME=$(terraform output -raw api_service_name)

echo "✅ Infrastructure deployed"
echo "ECR Repository: ${ECR_REPOSITORY_URL}"
echo "ECS Cluster: ${ECS_CLUSTER_NAME}"

# Step 3: Build and push Docker image
echo "🐳 Building and pushing Docker image..."
cd ..

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URL}

# Build the image
docker build -f docker/api.Dockerfile -t ${PROJECT_NAME}-${ENVIRONMENT}-api .

# Tag the image
docker tag ${PROJECT_NAME}-${ENVIRONMENT}-api:latest ${ECR_REPOSITORY_URL}:latest

# Push the image
docker push ${ECR_REPOSITORY_URL}:latest

echo "✅ Docker image pushed to ECR"

# Step 4: Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster ${ECS_CLUSTER_NAME} \
  --service ${ECS_SERVICE_NAME} \
  --force-new-deployment \
  --region ${AWS_REGION}

echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable \
  --cluster ${ECS_CLUSTER_NAME} \
  --services ${ECS_SERVICE_NAME} \
  --region ${AWS_REGION}

# Step 5: Run database initialization (if needed)
echo "🗄️  Running database initialization..."
cd api
npm run db:init

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "- Infrastructure: ✅ Deployed"
echo "- Docker Image: ✅ Built and pushed"
echo "- ECS Service: ✅ Updated"
echo "- Database: ✅ Initialized"
echo ""
echo "🌐 Access your application:"
ALB_DNS=$(cd ../terraform && terraform output -raw alb_dns_name)
echo "API URL: http://${ALB_DNS}"
echo "Health Check: http://${ALB_DNS}/health"
echo "API Docs: http://${ALB_DNS}/api-docs"
