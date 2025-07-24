# Stack - FullStack Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)

[![Code Quality](https://github.com/lemonadewsugar/stack/workflows/Code%20Quality%20%26%20Linting/badge.svg)](https://github.com/lemonadewsugar/stack/actions/workflows/code-quality.yml)
[![CI](https://github.com/lemonadewsugar/stack/workflows/Continuous%20Integration/badge.svg)](https://github.com/lemonadewsugar/stack/actions/workflows/ci.yml)
[![PR Validation](https://github.com/lemonadewsugar/stack/workflows/📝%20Pull%20Request%20Validation/badge.svg)](https://github.com/lemonadewsugar/stack/actions/workflows/pr-validation.yml)
[![Maintenance](https://github.com/lemonadewsugar/stack/workflows/🛠️%20Dependency%20Maintenance/badge.svg)](https://github.com/lemonadewsugar/stack/actions/workflows/maintenance.yml)

A modern, cloud-native web application platform built with **Next.js 15**, **Express 5.1**, and **AWS services**. Features a clean architecture with comprehensive authentication, real-time capabilities, and full TypeScript support.

## ✨ Features

- � **JWT Authentication** with automatic token refresh
- 🏗️ **Clean Architecture** with layered separation of concerns  
- 🔒 **Type Safety** with comprehensive TypeScript definitions
- 🚀 **Cloud Native** deployment on AWS (ECS, RDS, Lambda)
- 📱 **Responsive UI** built with Next.js 15 and modern React patterns
- 🌐 **Internationalization** support (English, Mongolian, Japanese)
- 📊 **Real-time Monitoring** with CloudWatch integration
- 🔧 **Developer Experience** with hot reload, linting, and testing

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 15    │    │   Express 5.1   │    │   AWS Services  │
│     Client      │◄──►│       API       │◄──►│  (ECS, RDS,     │
│                 │    │   (ECS Fargate) │    │   Lambda, etc.) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Next.js 15** with App Router
- **TypeScript 5.0+** for type safety
- **Tailwind CSS** for styling
- **NextAuth.js v5** for authentication
- **React Hook Form** for form management

#### Backend  
- **Express 5.1** with TypeScript
- **PostgreSQL** for data persistence
- **JWT** authentication with refresh tokens
- **OpenAPI/Swagger** for API documentation
- **Winston** for structured logging

#### Cloud Infrastructure
- **AWS ECS Fargate** for container orchestration
- **AWS RDS PostgreSQL** for managed database
- **AWS Lambda** for serverless microservices
- **AWS ALB** for load balancing
- **AWS Secrets Manager** for credential management
- **Terraform** for Infrastructure as Code

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- AWS CLI (for deployment)
- Git

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd project

# Start the complete development environment
./scripts/dev.sh

# Access services:
# • Frontend: http://localhost:4000
# • API: http://localhost:3000  
# • API Docs: http://localhost:3000/api-docs
# • Health Check: http://localhost:3000/health
```

### Manual Setup (Alternative)

```bash
# Install dependencies
cd api && npm install
cd ../client && npm install  
cd ../services && npm install

# Start PostgreSQL
cd ../docker && docker-compose -f docker-compose.dev.yml up postgres -d

# Initialize database
cd ../api && npm run db:init

# Start services
npm run dev # API server
cd ../client && npm run dev # Frontend
```

## 📂 Project Structure

```
project/
├── 📁 api/                    # Express 5.1 API server
│   ├── src/
│   │   ├── database/          # Database operations & queries
│   │   ├── services/          # Business logic layer
│   │   ├── routes/            # HTTP route handlers  
│   │   ├── middleware/        # Express middleware
│   │   ├── types/             # TypeScript definitions
│   │   └── messages/          # i18n message files
│   └── docs/                  # API documentation
├── 📁 client/                 # Next.js 15 frontend
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   └── lib/                   # Client utilities & services
├── 📁 services/               # AWS Lambda microservices
├── 📁 terraform/              # Infrastructure as Code
├── 📁 docker/                 # Container configurations
├── 📁 scripts/                # Automation scripts
│   ├── api/                   # API-specific scripts
│   ├── database/              # Database scripts
│   └── testing/               # Testing scripts
└── 📁 docs/                   # Project documentation
```

## 📚 Documentation

- **[Architecture Guide](ARCHITECTURE.md)** - Comprehensive architectural overview
- **[Deployment Guide](docs/DEPLOYMENT.md)** - AWS deployment instructions  
- **[Database Guide](docs/DATABASE.md)** - Database setup and management
- **[API Documentation](docs/API.md)** - API endpoints and usage
- **[Authentication Guide](docs/authentication.md)** - Auth system documentation
- **[Development Guide](docs/DEVELOPMENT.md)** - Local development setup
- **[Messages System](docs/MESSAGES.md)** - Internationalization guide
- **[OpenAPI Guide](docs/OPENAPI_GUIDE.md)** - API documentation standards

## � Development

### Available Scripts

```bash
# Development
./scripts/dev.sh              # Start complete dev environment
./scripts/clean.sh            # Clean build artifacts and containers

# Database  
./scripts/database/init-database.ts    # Initialize database schema
./scripts/database/reset-database.ts   # Reset database to clean state

# Testing
./scripts/testing/test-complete-auth.sh  # Test authentication flow
./scripts/testing/test-admin.sh          # Test admin functionality  
./scripts/testing/test-uuid-auth.sh      # Test UUID-based auth

# Deployment
./scripts/deploy.sh           # Deploy to AWS
./scripts/health-check.sh     # Check service health
```

### API Commands
```bash
cd api/
npm run dev          # Start development server
npm run build        # Build production bundle
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run db:init      # Initialize database
npm run db:reset     # Reset database
```

### Client Commands  
```bash
cd client/
npm run dev          # Start Next.js development server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript compilation check
```

## 🚀 Deployment

### AWS Deployment (Recommended)

```bash
# Configure AWS CLI
aws configure

# Deploy complete infrastructure
./scripts/deploy.sh

# The deployment creates:
# • ECS cluster with API service
# • RDS PostgreSQL database  
# • Lambda functions for microservices
# • Application Load Balancer
# • All necessary security groups and networking
```

### Manual Deployment

See the detailed [Deployment Guide](docs/DEPLOYMENT.md) for step-by-step instructions.

## 🧪 Testing

The project includes comprehensive testing utilities:

- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API endpoint testing
- **Authentication Tests**: Complete auth flow validation
- **Load Tests**: Performance and scalability testing

## 🔒 Security

- JWT-based authentication with automatic refresh
- Password hashing with bcrypt
- SQL injection prevention with parameterized queries
- CORS configuration for cross-origin requests
- Rate limiting and request validation
- AWS Secrets Manager for credential storage

## 🌐 Internationalization

Supports multiple languages out of the box:
- 🇺🇸 English (default)
- 🇲🇳 Mongolian  
- 🇯🇵 Japanese

Configure via `API_LANGUAGE` environment variable.

## 📊 Monitoring

- **CloudWatch** for metrics and logging
- **Health checks** at `/health` endpoint
- **API documentation** at `/api-docs`
- **Structured logging** with Winston
- **Error tracking** and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` directory
- **Issues**: Open an issue on GitHub
- **API Documentation**: Visit `/api-docs` when server is running
- **Health Status**: Check `/health` endpoint

## � Links

- [Live Demo](https://your-demo-url.com) (if available)
- [API Documentation](https://your-api-docs-url.com)
- [Project Wiki](https://github.com/your-repo/wiki)

---

Built with ❤️ using modern web technologies

```
project/
├── api/                 # Express 5.1 API server (runs on ECS)
├── client/             # Next.js 15 frontend application  
├── services/           # AWS Lambda functions
├── terraform/          # AWS Infrastructure as Code
├── docker/            # Container configurations
├── scripts/           # Project automation scripts
└── docs/              # Comprehensive documentation
```

## 🔧 Technology Stack

- **Backend**: Express.js 5.1 + TypeScript + PostgreSQL
- **Frontend**: Next.js 15 + React + Tailwind CSS
- **Cloud**: AWS (ECS, RDS, Lambda, Secrets Manager)
- **Infrastructure**: Terraform
- **Containers**: Docker + AWS ECR

# API setup and start
cd api
npm install
npm run db:init  # Initialize database schema
npm run dev

# Client (in another terminal)
cd client
npm install
npm run dev
```

### 2. Docker Development

```bash
cd docker
./build.sh --environment development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 3. Docker Production

```bash
cd docker
./build.sh --environment production
docker-compose up -d
```

### 4. AWS Deployment

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings
terraform init
terraform plan
terraform apply
```

## Technology Stack

### Frontend (Client)
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components

### Backend (API)
- **Express 5.1** - Web framework for Node.js
- **TypeScript** - Type safety
- **PostgreSQL** - Relational database
- **Swagger/OpenAPI** - API documentation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling

### Database
- **PostgreSQL 16** - Primary database
- **Connection Pooling** - Efficient database connections
- **UUID Primary Keys** - Better performance and security
- **Automated Migrations** - Database schema management

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy and load balancing
- **AWS RDS** - Managed PostgreSQL database
- **AWS** - Cloud infrastructure
- **Terraform** - Infrastructure as Code

## Development

### Database Setup

```bash
# Start PostgreSQL (Docker)
cd docker
docker-compose up postgres

# Initialize database schema
cd api
npm run db:init
```

### API Development

```bash
cd api
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run docs:serve   # Serve API documentation
```

### Client Development

```bash
cd client
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
```

### Docker Development

```bash
cd docker
./build.sh --help    # See all build options
./build.sh -e development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Deployment

### Local Docker Deployment

```bash
cd docker
./build.sh -e production
docker-compose up -d
```

### AWS Deployment

1. **Configure AWS credentials**
2. **Update Terraform variables**
3. **Deploy infrastructure**

```bash
cd terraform
terraform init
terraform apply
```

### Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificate obtained (for HTTPS)
- [ ] Domain name configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Security groups reviewed

## Configuration

### Environment Variables

**API (.env)**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Client (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Docker Environment

Configuration is handled in `docker-compose.yml` and can be overridden with environment-specific files.

### Terraform Variables

Key variables in `terraform.tfvars`:
- `project_name` - Your project name
- `environment` - Environment (dev/staging/prod)
- `domain_name` - Your domain
- `certificate_arn` - ACM certificate ARN

## Monitoring and Logs

### Local Development
```bash
# API logs
cd api && npm run dev

# Client logs
cd client && npm run dev

# Docker logs
docker-compose logs -f
```

### Production (AWS)
- **CloudWatch Logs** - Application and system logs
- **CloudWatch Metrics** - Performance monitoring
- **CloudWatch Alarms** - Automated alerting
- **CloudWatch Dashboard** - Visual monitoring

## API Documentation

The API includes automatic OpenAPI/Swagger documentation:

- **Local**: http://localhost:3000/api-docs
- **Docker**: http://localhost/api-docs
- **Production**: https://yourdomain.com/api-docs

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin protection
- **Rate limiting** - DDoS protection
- **Input validation** - Data sanitization
- **HTTPS** - Encrypted communication (production)
- **Security groups** - Network-level protection (AWS)

## Performance Optimizations

- **Next.js standalone output** - Minimal Docker images
- **Multi-stage Docker builds** - Optimized container size
- **Nginx compression** - Reduced bandwidth
- **Auto scaling** - Dynamic resource allocation (AWS)
- **CloudFront CDN** - Global content delivery (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Docker
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Change ports in docker-compose.yml
   - Check if ports are already in use

2. **Build failures**
   - Clear Docker cache: `docker system prune`
   - Check .dockerignore files

3. **Network connectivity**
   - Verify service names in Docker network
   - Check environment variables

4. **AWS deployment issues**
   - Verify AWS credentials
   - Check Terraform state
   - Review CloudWatch logs

### Debug Commands

```bash
# Docker
docker-compose logs -f
docker-compose exec api sh
docker system df

# Terraform
terraform plan
terraform state list
terraform output

# AWS
aws logs describe-log-groups
aws ecs list-clusters
```

## Support

For issues and questions:
1. Check the documentation in each directory
2. Review common troubleshooting steps
3. Create an issue in the repository
