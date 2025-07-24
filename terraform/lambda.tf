# Lambda functions for services

# IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-lambda-role"
  }
}

# Attach basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda policy for VPC access
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Policy for Lambda to access Secrets Manager
resource "aws_iam_policy" "lambda_secrets_policy" {
  name        = "${var.project_name}-${var.environment}-lambda-secrets-policy"
  description = "Policy for Lambda functions to access Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_secrets_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_secrets_policy.arn
}

# Security Group for Lambda functions
resource "aws_security_group" "lambda" {
  name_prefix = "${var.project_name}-${var.environment}-lambda-"
  vpc_id      = aws_vpc.main.id

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-lambda-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# CloudWatch Log Groups for Lambda functions
resource "aws_cloudwatch_log_group" "user_service_lambda" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-user-service"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-user-service-logs"
  }
}

resource "aws_cloudwatch_log_group" "notification_service_lambda" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-notification-service"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-notification-service-logs"
  }
}

# User Service Lambda Function
resource "aws_lambda_function" "user_service" {
  filename         = "../services/user-service.zip"
  function_name    = "${var.project_name}-${var.environment}-user-service"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      NODE_ENV = var.environment
      DB_SECRET_ARN = aws_secretsmanager_secret.db_credentials.arn
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_cloudwatch_log_group.user_service_lambda,
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-user-service"
  }
}

# Notification Service Lambda Function
resource "aws_lambda_function" "notification_service" {
  filename         = "../services/notification-service.zip"
  function_name    = "${var.project_name}-${var.environment}-notification-service"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      NODE_ENV = var.environment
      DB_SECRET_ARN = aws_secretsmanager_secret.db_credentials.arn
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_cloudwatch_log_group.notification_service_lambda,
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-notification-service"
  }
}

# API Gateway for Lambda functions
resource "aws_api_gateway_rest_api" "services" {
  name        = "${var.project_name}-${var.environment}-services-api"
  description = "API Gateway for Lambda services"

  tags = {
    Name = "${var.project_name}-${var.environment}-services-api"
  }
}

# API Gateway resources and methods would be added here
# This is a basic setup - you would expand this based on your specific service endpoints
