# SmartCart - Microservices Platform

A modern, scalable microservices architecture for an e-commerce platform built with Node.js, Docker, and Kubernetes.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Docker Setup](#docker-setup)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

SmartCart is a containerized microservices platform designed for high scalability and maintainability. Each service is independently deployable and communicates through well-defined APIs and message queues.

### Key Features

- **Microservices Architecture**: Independently deployable services
- **API Gateway**: Centralized entry point for all client requests
- **Authentication**: JWT-based authentication across services
- **Message Queue**: RabbitMQ integration for asynchronous communication
- **Container Ready**: Docker support for all services
- **Kubernetes Ready**: Complete K8s configuration included
- **Load Testing**: Built-in load testing scripts

## 🏗️ Architecture

```
Client Requests
      ↓
  API Gateway
      ↓
 ┌────────────────────────────────────┐
 ├→ Auth Service       (Port 3001)    │
 ├→ Product Service    (Port 3002)    │
 ├→ Order Service      (Port 3003)    │
 ├→ Payment Service    (Port 3004)    │
 └→ Notification Service (Port 3005)  │
      ↓
┌─────────────────────────────────────┐
├→ MongoDB (Data Persistence)         │
├→ RabbitMQ (Message Queue)           │
└─────────────────────────────────────┘
```

## 🔧 Services

### API Gateway
- **Port**: 3000
- **Purpose**: Routes requests to appropriate microservices
- **Key Features**:
  - Request routing
  - Authentication middleware
  - Rate limiting
  - Request logging

### Auth Service
- **Port**: 3001
- **Purpose**: User authentication and authorization
- **Endpoints**:
  - `POST /auth/register` - Register new user
  - `POST /auth/login` - User login
  - `POST /auth/verify` - Verify JWT token

### Product Service
- **Port**: 3002
- **Purpose**: Product catalog management
- **Endpoints**:
  - `GET /products` - List all products
  - `GET /products/:id` - Get product details
  - `POST /products` - Create new product
  - `PUT /products/:id` - Update product
  - `DELETE /products/:id` - Delete product

### Order Service
- **Port**: 3003
- **Purpose**: Order processing and management
- **Endpoints**:
  - `GET /orders` - List orders
  - `POST /orders` - Create new order
  - `GET /orders/:id` - Get order details
  - `PUT /orders/:id` - Update order status

### Payment Service
- **Port**: 3004
- **Purpose**: Payment processing
- **Features**: Handles payment validation and processing

### Notification Service
- **Port**: 3005
- **Purpose**: Send notifications to users
- **Features**: Email, SMS, and push notifications via message queue

## 📦 Prerequisites

- **Node.js**: v14 or higher
- **Docker**: v20.10 or higher
- **Docker Compose**: v1.29 or higher
- **MongoDB**: v4.4 or higher (optional, if running locally)
- **RabbitMQ**: v3.9 or higher (optional, if running locally)
- **kubectl**: v1.20 or higher (for Kubernetes deployment)

## 🚀 Getting Started

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartcart.git
   cd smartcart
   ```

2. **Install dependencies for all services**
   ```bash
   npm install
   cd api-gateway && npm install && cd ..
   cd services && npm install && cd ..
   ```

3. **Create environment files**
   ```bash
   cp .env.example .env
   cp api-gateway/.env.example api-gateway/.env
   cp services/auth-service/.env.example services/auth-service/.env
   # ... repeat for other services
   ```

4. **Start services locally**
   ```bash
   # Terminal 1: API Gateway
   cd api-gateway && npm start

   # Terminal 2: Auth Service
   cd services/auth-service && npm start

   # Terminal 3: Product Service
   cd services/product-service && npm start

   # ... start other services in separate terminals
   ```

### Using Docker Compose

The easiest way to run the entire application locally:

```bash
docker-compose up -d
```

This will start all services, MongoDB, RabbitMQ, and required infrastructure.

To stop everything:
```bash
docker-compose down
```

## ⚙️ Configuration

### Environment Variables

Create `.env` files in each service directory. Example:

**api-gateway/.env**
```
PORT=3000
LOG_LEVEL=debug
AUTH_SERVICE_URL=http://auth-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003
PAYMENT_SERVICE_URL=http://payment-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005
RATE_LIMIT_WINDOW_MS=15000
RATE_LIMIT_MAX_REQUESTS=100
```

**services/auth-service/.env**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/smartcart
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h
```

**services/order-service/.env**
```
PORT=3003
MONGODB_URI=mongodb://localhost:27017/smartcart
RABBITMQ_URL=amqp://localhost:5672
```

## 🐳 Docker Setup

### Building Individual Services

```bash
# Build API Gateway
docker build -t smartcart/api-gateway:latest ./api-gateway

# Build Auth Service
docker build -t smartcart/auth-service:latest ./services/auth-service

# Build all services
for dir in api-gateway services/*/; do
  docker build -t smartcart/$(basename $dir):latest ./$dir
done
```

### Running with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, EKS, GKE, etc.)
- kubectl configured

### Deploy to Kubernetes

1. **Create namespace**
   ```bash
   kubectl apply -f k8s/order-service/namespace.yaml
   ```

2. **Create secrets and configmaps**
   ```bash
   kubectl apply -f k8s/order-service/secret.yaml
   kubectl apply -f k8s/order-service/configmap.yaml
   ```

3. **Deploy services**
   ```bash
   kubectl apply -f k8s/order-service/deployment.yaml
   kubectl apply -f k8s/order-service/service.yaml
   ```

4. **Verify deployment**
   ```bash
   kubectl get pods -n smartcart
   kubectl get services -n smartcart
   ```

## 📁 Project Structure

```
smartcart/
├── api-gateway/              # API Gateway service
│   ├── src/
│   │   ├── index.js
│   │   └── middleware/      # Auth, logging, rate limiting
│   ├── Dockerfile
│   └── package.json
├── services/                 # Business logic services
│   ├── auth-service/        # Authentication & Authorization
│   ├── product-service/     # Product Management
│   ├── order-service/       # Order Processing
│   ├── payment-service/     # Payment Processing
│   └── notification-service/ # Notifications
├── k8s/                      # Kubernetes manifests
│   └── order-service/
├── scripts/                  # Utility scripts
│   ├── load-test.js        # Load testing
│   └── load-test2.js
├── docker-compose.yml        # Docker Compose configuration
├── .gitignore               # Git ignore rules
├── .dockerignore            # Docker ignore rules
└── README.md                # This file
```

## 📚 API Documentation

### Authentication

Most endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <TOKEN>
```

### Example Requests

**Register User**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

**Get Products**
```bash
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer <TOKEN>"
```

**Create Order**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "123", "quantity": 2}],
    "shippingAddress": "123 Main St, City, State 12345"
  }'
```

## 💻 Development

### Running Tests

```bash
# Run tests for all services
npm test

# Run tests with coverage
npm run test:coverage
```

### Load Testing

Run load tests to verify system performance:

```bash
node scripts/load-test.js
node scripts/load-test2.js
```

### Debugging

Enable debug logging:

```bash
DEBUG=smartcart:* npm start
```

### Code Style

The project uses ESLint for code linting:

```bash
# Lint all files
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow Node.js best practices
- Write meaningful commit messages
- Ensure tests pass before submitting PR
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review service-specific README files

## 🔄 CI/CD

The project is set up for continuous integration and deployment. Add your CI/CD workflow file to `.github/workflows/` or your preferred CI/CD platform configuration.

---

**Last Updated**: March 2026
