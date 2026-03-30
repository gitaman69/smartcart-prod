<div align="center">

<!-- Animated Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=SmartCart&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Scalable%20Microservices%20E-Commerce%20Backend&descAlignY=55&descSize=20" width="100%"/>

<!-- Typing Animation -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=6366F1&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=Production-Ready+Microservices+Architecture;Event-Driven+with+RabbitMQ;Kubernetes+Deployed+%7C+MongoDB+Read+Replicas" alt="Typing SVG" />
</a>

<br/>

<!-- Badges -->
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.x-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Minikube-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)
![Services](https://img.shields.io/badge/Microservices-6-blueviolet?style=flat-square)

</div>

---

## 📖 What is SmartCart?

**SmartCart** is a production-style **microservices e-commerce backend** built with Node.js. Instead of one big application, it's split into small independent services that each handle one job — auth, products, orders, payments, and notifications. They all talk to each other through an API Gateway and use RabbitMQ for async event-driven communication.

> Built to demonstrate real-world backend architecture patterns used at companies like Flipkart, Amazon, and JPMC.

---

## 🏗️ Architecture

```
                        ┌─────────────────────────────┐
                        │   Client (React / Postman)   │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │       API Gateway :3000       │
                        │  Rate Limiting · JWT · Logs   │
                        └──┬──────┬──────┬──────┬──────┘
                           │      │      │      │
              ┌────────────▼─┐ ┌──▼───┐ ┌▼─────┴──┐ ┌──────────┐
              │ Auth  :3001  │ │Prod  │ │Order    │ │Payment   │
              │ JWT · bcrypt │ │:3002 │ │:3003    │ │:3004     │
              └──────┬───────┘ └──┬───┘ └────┬────┘ └──────────┘
                     │            │           │
              ┌──────▼────┐ ┌────▼────┐ ┌────▼─────────────────┐
              │  MongoDB  │ │ MongoDB │ │ MongoDB Primary :27017 │
              │   (auth)  │ │  (prod) │ │ MongoDB Replica :27018 │
              └───────────┘ └─────────┘ └──────────┬────────────┘
                                                    │
                                         ┌──────────▼──────────┐
                                         │   RabbitMQ :5672     │
                                         └──────────┬───────────┘
                                                    │
                                         ┌──────────▼──────────┐
                                         │ Notification :3005   │
                                         │  Email · Logs        │
                                         └─────────────────────┘
```

---

## ⚡ Services

| Service | Port | Responsibility |
|---|---|---|
| **API Gateway** | 3000 | Routes all requests, JWT verification, rate limiting |
| **Auth Service** | 3001 | Register, Login, JWT + Refresh tokens, roles |
| **Product Service** | 3002 | CRUD products, pagination, search |
| **Order Service** | 3003 | Place orders, MongoDB read replica routing |
| **Payment Service** | 3004 | Mock payment processing, payment events |
| **Notification Service** | 3005 | RabbitMQ consumer, email/log notifications |

---

## 🔑 Key Features

- 🔐 **JWT Authentication** — Access token (15min) + Refresh token (7d) flow
- 👮 **Role-based Access** — Admin and User roles with middleware guards
- 🐇 **Event-Driven** — Orders trigger RabbitMQ events consumed by Notification service
- 📖 **MongoDB Read Replica** — Writes go to Primary `:27017`, reads go to Replica `:27018`
- 🚦 **Rate Limiting** — Global 100 req/15min, stricter 20 req/15min on auth routes
- 🐳 **Dockerized** — Full `docker-compose` setup with one command startup
- ☸️ **Kubernetes Ready** — Order service deployed on Minikube with 2+ replicas
- 📊 **Load Tested** — Verified 400 concurrent requests with 0% failure rate

---

## 🚀 Quick Start

### Prerequisites

```bash
node >= 18
docker + docker compose
```

### Run with Docker Compose

```bash
# Clone the repo
git clone https://github.com/yourusername/smartcart.git
cd smartcart

# Start MongoDB primary only first
docker-compose up -d mongodb-primary mongodb-replica

# Wait 10 seconds, then initialize replica set
docker exec -it smartcart-mongodb-primary-1 mongosh --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongodb-primary:27017', priority: 2 },
    { _id: 1, host: 'mongodb-replica:27018', priority: 1 }
  ]
})"

# Start all services
docker-compose up --build
```

✅ API Gateway running at `http://localhost:3000`

---

## 🐇 RabbitMQ Event Flow

```
Place Order
    │
    ▼
Order Service ──publishes──► order_created queue
                                    │
                                    ▼
                         Notification Service
                              consumes msg
                                    │
                                    ▼
                            📧 Send Email / Log

Pay for Order
    │
    ▼
Payment Service ──publishes──► payment_success queue
                                    │
                                    ▼
                         Notification Service
                              consumes msg
                                    │
                                    ▼
                            📧 Payment Receipt
```

View live queues at: `http://localhost:15672` (guest/guest)

---

## ☸️ Kubernetes (Minikube)

The Order Service is deployed on Kubernetes with 2 replicas:

```bash
# Deploy
kubectl apply -f k8s/order-service/

# Watch pods
kubectl get pods -n smartcart -w

# Get service URL
minikube service order-service -n smartcart --url

# Scale up
kubectl scale deployment order-service -n smartcart --replicas=5
```

```
k8s/order-service/
├── namespace.yaml      # smartcart namespace
├── secret.yaml         # DB URI, JWT, RabbitMQ credentials
├── configmap.yaml      # PORT, NODE_ENV
├── deployment.yaml     # 2 replicas, health probes
└── service.yaml        # NodePort :30003
```

---

## 📊 Load Test Results

Tested with custom Node.js load test script against 2 Kubernetes pods:

| Concurrency | Write (Primary) | Read by ID (Replica) | Success Rate |
|---|---|---|---|
| 10 | 744ms | 487ms | 100% |
| 50 | 673ms | 585ms | 100% |
| 100 | 1043ms | 790ms | 100% |
| 200 | 1222ms | 878ms | 100% |
| 400 | 1422ms | 1033ms | 100% |

> **0 failures** across 400 concurrent requests on 2 pods. Read replica consistently outperforms primary under load.

---

## 📁 Project Structure

```
smartcart/
├── docker-compose.yml
├── api-gateway/
│   └── src/
│       ├── index.js
│       └── middleware/
│           ├── auth.middleware.js
│           ├── rateLimiter.js
│           └── logger.js
├── services/
│   ├── auth-service/
│   │   └── src/
│   │       ├── models/User.js
│   │       ├── controllers/auth.controller.js
│   │       ├── routes/auth.routes.js
│   │       └── utils/jwt.utils.js
│   ├── product-service/
│   │   └── src/
│   │       ├── models/Product.js
│   │       └── controllers/product.controller.js
│   ├── order-service/
│   │   └── src/
│   │       ├── config/db.js           ← dual connection (primary + replica)
│   │       ├── models/Order.js
│   │       ├── controllers/order.controller.js
│   │       └── utils/rabbitmq.js
│   ├── payment-service/
│   └── notification-service/
├── k8s/
│   └── order-service/
│       ├── namespace.yaml
│       ├── secret.yaml
│       ├── configmap.yaml
│       ├── deployment.yaml
│       └── service.yaml
└── scripts/
    └── load-test.js
```

---

## 🛠️ Tech Stack

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)

</div>

<div align="center">

<!-- Footer wave -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer" width="100%"/>

**Built with ❤️ for learning production-grade backend architecture**

⭐ Star this repo if it helped you!

</div>