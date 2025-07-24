# Stack Project Documentation

Comprehensive documentation for the Stack system.

## 📚 Documentation Index

### 🏗️ Architecture & Design
- **[Architecture Overview](../ARCHITECTURE.md)** - Complete architectural documentation with code splitting details
- **[Authentication System](authentication.md)** - JWT authentication with automatic token refresh

### 🚀 Development & Deployment  
- **[Development Guide](DEVELOPMENT.md)** - Local development setup and workflows
- **[Deployment Guide](DEPLOYMENT.md)** - Complete AWS deployment instructions
- **[Database Guide](DATABASE.md)** - Database setup, schema, and management

### 📊 API Documentation
- **[API Reference](API.md)** - API endpoints and usage guide
- **[OpenAPI Guide](OPENAPI_GUIDE.md)** - Standards for API documentation
- **[Messages System](MESSAGES.md)** - Internationalization and message management

### 🔧 Scripts & Automation
- **[Scripts Documentation](../scripts/README.md)** - Automation scripts for development, testing, and deployment

### 📁 Archived Documentation
- **[Archived Docs](archived/)** - Older documentation files kept for reference

## 🎯 Quick Navigation

### For New Developers
1. **[Architecture Overview](../ARCHITECTURE.md)** - Understand the system design
2. **[Development Guide](DEVELOPMENT.md)** - Set up your local environment  
3. **[Scripts Documentation](../scripts/README.md)** - Learn available automation tools
4. **[API Reference](API.md)** - Explore available endpoints

### For DevOps Engineers
1. **[Deployment Guide](DEPLOYMENT.md)** - AWS infrastructure setup
2. **[Database Guide](DATABASE.md)** - Database management procedures
3. **[Scripts Documentation](../scripts/README.md)** - Deployment automation

### For API Integrators
1. **[API Reference](API.md)** - Endpoint documentation
2. **[Authentication System](authentication.md)** - Auth flow implementation
3. **[Messages System](MESSAGES.md)** - i18n support details
4. **Live API Docs**: `http://localhost:3000/api-docs` (when server is running)

## 🏗️ Architecture at a Glance

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 15    │    │   Express 5.1   │    │   AWS Services  │
│     Client      │◄──►│       API       │◄──►│  (ECS, RDS,     │
│   (TypeScript)  │    │   (TypeScript)  │    │   Lambda, etc.) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Features
- 🔐 **JWT Authentication** with automatic token refresh
- 🏗️ **Layered Architecture** with clear separation of concerns
- 🔒 **Full Type Safety** with comprehensive TypeScript definitions
- 🚀 **Cloud Native** deployment on AWS infrastructure
- 🌐 **Internationalization** support (EN, MN, JA)
- 📊 **Comprehensive Monitoring** with CloudWatch integration

## 📂 Project Structure Overview

```
project/
├── 📁 api/                    # Express 5.1 API server
│   ├── src/database/          # Database operations & queries (NEW)
│   ├── src/services/          # Business logic layer (NEW)
│   ├── src/routes/            # HTTP route handlers (REFACTORED)
│   └── src/[...]              # Middleware, types, messages, etc.
├── 📁 client/                 # Next.js 15 frontend
│   ├── lib/                   # Client utilities & services (NEW)
│   ├── app/                   # Next.js App Router
│   └── components/            # React components
├── 📁 services/               # AWS Lambda microservices
├── 📁 terraform/              # Infrastructure as Code
├── 📁 scripts/                # Organized automation scripts (NEW)
│   ├── api/                   # API-specific scripts
│   ├── database/              # Database management
│   └── testing/               # Testing utilities
└── 📁 docs/                   # This documentation (CONSOLIDATED)
    ├── archived/              # Older docs for reference
    └── [current docs]         # Active documentation files
```

## � Recent Improvements

### Architecture Enhancements
- ✅ **Complete code splitting** implemented for both API and client
- ✅ **Layered architecture** with database, services, and routes separation
- ✅ **Type safety** improvements across all layers
- ✅ **Error handling** standardization

### Documentation Consolidation
- ✅ **Centralized documentation** in `/docs` directory
- ✅ **Archived outdated** documentation for reference
- ✅ **Comprehensive README** created for public repository
- ✅ **Scripts organization** with proper categorization

### Development Experience
- ✅ **Organized script structure** for better maintainability
- ✅ **Improved build process** with TypeScript compilation
- ✅ **Enhanced error handling** and logging
- ✅ **Better separation of concerns** for easier testing

## 🔗 External Resources

- **Live API Documentation**: Available at `/api-docs` when server is running
- **Health Check**: Monitor system status at `/health`
- **OpenAPI Schema**: Download from `/openapi.json`

## � Contributing to Documentation

When updating documentation:
1. Keep the main README.md focused on getting started
2. Use specific guides for detailed procedures
3. Update this index when adding new documentation
4. Archive outdated docs rather than deleting them
5. Ensure all links are functional and up-to-date

---

This documentation is continuously updated to reflect the current state of the Stack project architecture and development practices.

### Backend
- **API Framework**: Express.js 5.1 with TypeScript
- **Database**: PostgreSQL 16 (AWS RDS)
- **Container**: Docker with multi-stage builds
- **Orchestration**: AWS ECS Fargate
- **Authentication**: AWS Secrets Manager integration

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **TypeScript**: Full type safety

### Infrastructure
- **Cloud Provider**: AWS
- **Infrastructure as Code**: Terraform
- **Container Registry**: AWS ECR
- **Monitoring**: AWS CloudWatch
- **Load Balancing**: Application Load Balancer

### Serverless Services
- **User Management**: AWS Lambda function
- **Notifications**: AWS Lambda function
- **Secrets**: AWS Secrets Manager

## 🚦 Project Status

- ✅ AWS Infrastructure (Terraform)
- ✅ Express API with PostgreSQL integration
- ✅ Lambda functions for microservices
- ✅ Docker containerization
- ✅ Database schema and initialization
- ✅ Code quality tools (ESLint, Prettier)
- 🔄 Frontend development (Next.js components)
- 🔄 CI/CD pipeline setup
- 🔄 Monitoring and alerting

## 🤝 Contributing

1. Follow the coding standards (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## 📄 License

This project is proprietary software for internal application platform use.
