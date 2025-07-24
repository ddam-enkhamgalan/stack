# AWS Deployment Guide

This guide covers deploying the Stack project to AWS using the provided Terraform infrastructure and deployment scripts.

## 🏗️ Architecture Overview

The application is deployed using a modern AWS-native architecture:

```
Internet Gateway
       │
   ┌───▼───┐
   │  ALB  │ (Application Load Balancer)
   └───┬───┘
       │
   ┌───▼────┐    ┌─────────────┐    ┌──────────────┐
   │  ECS   │    │   Lambda    │    │     RDS      │
   │Fargate │    │ Functions   │    │ PostgreSQL   │
   │  API   │    │ (Services)  │    │   Database   │
   └────────┘    └─────────────┘    └──────────────┘
       │               │                     │
   ┌───▼───┐    ┌─────▼─────┐        ┌──────▼──────┐
   │  ECR  │    │  Secrets  │        │ CloudWatch  │
   │Images │    │ Manager   │        │   Logs      │
   └───────┘    └───────────┘        └─────────────┘
```

## 🔧 AWS Services Used

### Core Infrastructure
- **VPC**: Isolated network with public and private subnets
- **ECS Fargate**: Serverless container platform for the API
- **Application Load Balancer**: Traffic distribution and SSL termination
- **ECR**: Container registry for Docker images

### Database & Storage
- **RDS PostgreSQL**: Managed database with automated backups
- **AWS Secrets Manager**: Secure credential storage with auto-rotation

### Serverless Functions
- **Lambda Functions**: Microservices for user management and notifications
- **API Gateway**: HTTP API endpoints for Lambda functions

### Security & Monitoring
- **IAM Roles**: Least-privilege access control
- **Security Groups**: Network-level security
- **CloudWatch**: Logging, monitoring, and alerting
- **VPC Flow Logs**: Network traffic monitoring

## 🚀 Deployment Process

### Prerequisites

1. **AWS CLI Configuration**
   ```bash
   aws configure
   # Enter your AWS Access Key, Secret Key, Region, and Output format
   ```

2. **Required Permissions**
   Your AWS user/role needs permissions for:
   - ECS (full access)
   - RDS (full access)
   - Lambda (full access)
   - IAM (role creation)
   - VPC (full access)
   - ECR (full access)
   - Secrets Manager (full access)
   - CloudWatch (full access)

3. **Tools Installation**
   ```bash
   # Install Terraform
   curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
   sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
   sudo apt-get update && sudo apt-get install terraform

   # Install Docker
   sudo apt-get install docker.io
   sudo usermod -aG docker $USER
   ```

### Automated Deployment

The easiest way to deploy is using the provided script:

```bash
# Make the script executable
chmod +x scripts/deploy.sh

# Deploy everything to AWS
./scripts/deploy.sh
```

This script will:
1. Build and push Docker images to ECR
2. Package Lambda functions
3. Deploy infrastructure with Terraform
4. Configure database and secrets
5. Start all services

### Manual Deployment Steps

If you prefer to deploy manually:

#### 1. Terraform Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your specific values

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply
```

#### 2. Build and Push Docker Images

```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push API image
cd docker
./build.sh
```

#### 3. Deploy Lambda Functions

```bash
cd services

# Install dependencies and build
npm install
npm run build
npm run package

# Deploy Lambda functions (handled by Terraform)
```

#### 4. Database Initialization

```bash
cd api

# Run database initialization
npm run init:db
```

## 🔐 Security Configuration

### Secrets Manager

Database credentials are automatically generated and stored in AWS Secrets Manager:

- **Secret Name**: `stack/database/credentials`
- **Auto-rotation**: Enabled (30 days)
- **Access**: Limited to ECS tasks and Lambda functions

### Network Security

- **Private Subnets**: Database and internal services
- **Public Subnets**: Load balancer only
- **Security Groups**: Restrictive ingress/egress rules
- **NACLs**: Additional network-level protection

### IAM Roles

- **ECS Task Role**: Database and Secrets Manager access
- **Lambda Execution Role**: Basic execution + Secrets Manager
- **EC2 Instance Profile**: ECR and CloudWatch access

## 📊 Monitoring & Logging

### CloudWatch Logs

- **API Logs**: `/aws/ecs/stack-api`
- **Lambda Logs**: `/aws/lambda/stack-user-service`, `/aws/lambda/stack-notification-service`
- **VPC Flow Logs**: `/aws/vpc/flowlogs`

### CloudWatch Metrics

- **ECS Metrics**: CPU, memory, task count
- **RDS Metrics**: Connections, CPU, storage
- **Lambda Metrics**: Invocations, duration, errors
- **ALB Metrics**: Request count, latency, errors

### CloudWatch Alarms

Pre-configured alarms for:
- High CPU usage (>80%)
- Database connection errors
- Lambda function errors
- ECS service health

## 🔄 Scaling Configuration

### ECS Auto Scaling

- **Min Capacity**: 1 task
- **Max Capacity**: 10 tasks
- **Target CPU**: 70%
- **Target Memory**: 80%

### RDS Scaling

- **Storage**: Auto-scaling enabled
- **Read Replicas**: Can be added for read-heavy workloads
- **Multi-AZ**: Enabled for high availability

## 🧪 Environment Variables

### ECS Task Environment

```bash
NODE_ENV=production
DB_SECRET_ARN=arn:aws:secretsmanager:region:account:secret:stack/database/credentials
AWS_REGION=us-east-1
```

### Lambda Environment

```bash
DB_SECRET_ARN=arn:aws:secretsmanager:region:account:secret:stack/database/credentials
AWS_REGION=us-east-1
```

## 🔧 Troubleshooting

### Common Issues

1. **ECS Tasks Not Starting**
   - Check CloudWatch logs for container errors
   - Verify ECR image exists and is accessible
   - Check IAM permissions for task role

2. **Database Connection Errors**
   - Verify security groups allow ECS → RDS traffic
   - Check Secrets Manager permissions
   - Confirm database is in available state

3. **Lambda Function Errors**
   - Check CloudWatch logs for function execution
   - Verify environment variables are set
   - Check IAM permissions for execution role

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster stack-cluster --services stack-api-service

# View ECS task logs
aws logs get-log-events --log-group-name /aws/ecs/stack-api --log-stream-name <stream-name>

# Check RDS instance status
aws rds describe-db-instances --db-instance-identifier stack-database

# Test Lambda function
aws lambda invoke --function-name stack-user-service --payload '{}' response.json
```

## 🗑️ Cleanup

To completely remove all AWS resources:

```bash
cd terraform
terraform destroy
```

⚠️ **Warning**: This will permanently delete all resources including the database. Make sure to backup any important data first.

## 💰 Cost Optimization

### Estimated Monthly Costs (us-east-1)

- **ECS Fargate**: ~$30-50/month (1-2 tasks)
- **RDS db.t3.micro**: ~$15-20/month
- **Application Load Balancer**: ~$20/month
- **Lambda**: ~$1-5/month (depending on usage)
- **Data Transfer**: ~$5-10/month
- **Total**: ~$70-105/month

### Cost Reduction Tips

1. Use smaller instance types for development
2. Enable RDS scheduled start/stop for dev environments
3. Configure ECS service auto-scaling appropriately
4. Monitor CloudWatch usage and adjust retention periods

## 📋 Post-Deployment Checklist

- [ ] Verify API health endpoint responds
- [ ] Test database connectivity
- [ ] Confirm Lambda functions are deployable
- [ ] Check CloudWatch logs are flowing
- [ ] Verify SSL certificate (if configured)
- [ ] Test auto-scaling policies
- [ ] Confirm backup schedules
- [ ] Review security group rules
- [ ] Test disaster recovery procedures
