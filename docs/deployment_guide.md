# ClearSight — EC2 Production Deployment Guide with DNS, Nginx & Free SSL

This guide covers deploying the **ClearSight Glaucoma Tele-Ophthalmology System** across two separate **AWS EC2 (t3.micro)** instances using **Docker Hub**, **Nginx Reverse Proxy**, **MongoDB Atlas**, and free **Let's Encrypt SSL certificates (Certbot)** for `inference.clearsighteye.app` and `api.clearsighteye.app`.

---

## Architecture & URL Routing Overview

```
                                [ Client / Dashboard ]
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
 https://inference.clearsighteye.app                         https://api.clearsighteye.app
       (Port 443)                                                  (Port 443)
            │                                                           │
┌──────────────────────────────┐                            ┌──────────────────────────────┐
│       EC2 #1 (FastAPI)       │                            │       EC2 #2 (Spring)        │
│ [ Nginx Reverse Proxy ]      │                            │ [ Nginx Reverse Proxy ]      │
│            │                 │                            │            │                 │
│  (Proxy: 127.0.0.1:8000)     │                            │  (Proxy: 127.0.0.1:8081)     │
│  [ FastAPI ML Service ]      │                            │  [ Spring Boot Gateway ]     │
│            │                 │                            │     │               │        │
│ (Model: best_model.pth)      │                            └─────┼───────────────┼────────┘
└──────────────────────────────┘                                  │               │
                                                                  ▼               ▼
                                                         (MongoDB Atlas)   (HTTPS Proxy Calls to
                                                         Cloud Database    https://inference.clearsighteye.app)
```

**Instance Port & Service Mappings:**
| EC2 Instance | Public Endpoint | Proxied Internal Address | Target Service | Description |
|---|---|---|---|---|
| **EC2 #1** | `https://inference.clearsighteye.app` | `http://127.0.0.1:8000` | **FastAPI ML Service** | MultiNet CNN + ANFIS glaucoma inference |
| **EC2 #2** | `https://api.clearsighteye.app` | `http://127.0.0.1:8081` | **Spring Boot Gateway** | Auth, scans, user profiles, MongoDB Atlas & inference forwarder |

---

## Step 1 — DNS Setup (Domain Provider)

1. Log into your domain registrar (e.g., Cloudflare, Namecheap, GoDaddy, AWS Route 53).
2. Add two **A Records**:
   - **EC2 #1 (FastAPI Inference)**:
     - **Type**: `A`
     - **Name/Host**: `inference` (resolves to `inference.clearsighteye.app`)
     - **IPv4 Address**: EC2 #1 Elastic IP / Public IP (e.g., `13.235.xx.x1`)
     - **TTL**: Auto or 300 seconds
   - **EC2 #2 (Spring Boot Gateway)**:
     - **Type**: `A`
     - **Name/Host**: `api` (resolves to `api.clearsighteye.app`)
     - **IPv4 Address**: EC2 #2 Elastic IP / Public IP (e.g., `13.235.xx.x2`)
     - **TTL**: Auto or 300 seconds
3. Verify DNS propagation:
   ```bash
   ping inference.clearsighteye.app
   ping api.clearsighteye.app
   ```

---

## Step 2 — EC2 Security Group Rules (Inbound)

For both EC2 instances (EC2 #1 and EC2 #2) in AWS EC2 Console → Security Groups, configure inbound rules:

| Type | Protocol | Port Range | Source | Purpose |
|---|---|---|---|---|
| **SSH** | TCP | 22 | Your IP / `0.0.0.0/0` | Terminal access |
| **HTTP** | TCP | **80** | `0.0.0.0/0`, `::/0` | Web traffic & Let's Encrypt validation |
| **HTTPS** | TCP | **443** | `0.0.0.0/0`, `::/0` | Encrypted production API traffic |

---

## Step 3 — One-Time Host Setup & Swap Space Configuration

Perform the following steps on **both EC2 instances** (EC2 #1 and EC2 #2).

### 3.1 Install System Dependencies & Docker
SSH into the EC2 instance and run:

```bash
# 1. Update system & install Docker, Nginx, Certbot
sudo apt-get update && sudo apt-get install -y \
    docker.io \
    docker-compose-plugin \
    nginx \
    certbot \
    python3-certbot-nginx

# 2. Start & enable Docker and Nginx
sudo systemctl enable --now docker
sudo systemctl enable --now nginx
sudo usermod -aG docker $USER
newgrp docker
```

### 3.2 Enable 2 GB Swap Space on t3.micro (Both EC2 Instances)
To prevent out-of-memory errors on `t3.micro` instances:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3.3 Instance-Specific Directory & File Preparation

- **For EC2 #1 (FastAPI ML Service)**:
  ```bash
  mkdir -p ~/clearsight/notebook
  # Copy trained model file from local machine:
  # scp -i your-key.pem notebook/best_model.pth ubuntu@<EC2-1-IP>:~/clearsight/notebook/
  ```

- **For EC2 #2 (Spring Boot Gateway)**:
  ```bash
  mkdir -p ~/clearsight
  ```

---

## Step 4 — Environment Configuration (.env Templates)

Create the required environment files on each EC2 instance.

### 4.1 EC2 #1 Environment File (`~/clearsight/.env`)
```env
# EC2 #1 - FastAPI ML Service Environment Configuration
PORT=8000
FASTAPI_INTERNAL_SECRET=clearsight_internal_secret_key_2026
MODEL_PATH=/app/notebook/best_model.pth
CORS_ORIGINS=https://api.clearsighteye.app,https://clearsighteye.app
```

### 4.2 EC2 #2 Environment File (`~/clearsight/.env`)
```env
# EC2 #2 - Spring Boot Gateway Environment Configuration
SERVER_PORT=8081
SPRING_DATA_MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/clearsight?retryWrites=true&w=majority
SPRING_DATA_MONGODB_DATABASE=clearsight
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b
JWT_EXPIRATION_MS=86400000
FASTAPI_BASE_URL=https://inference.clearsighteye.app
FASTAPI_INTERNAL_SECRET=clearsight_internal_secret_key_2026
FRONTEND_URL=https://clearsighteye.app
```

---

## Step 5 — Nginx Configuration & Certbot SSL Setup

### 5.1 EC2 #1 Nginx Setup (`inference.clearsighteye.app`)

On EC2 #1, copy `infra/nginx/fastapi.conf` to Nginx configuration:

```bash
sudo cp infra/nginx/fastapi.conf /etc/nginx/sites-available/fastapi.conf
sudo ln -sf /etc/nginx/sites-available/fastapi.conf /etc/nginx/sites-enabled/fastapi.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Issue SSL certificate for `inference.clearsighteye.app`:
```bash
sudo certbot --nginx -d inference.clearsighteye.app
```

### 5.2 EC2 #2 Nginx Setup (`api.clearsighteye.app`)

On EC2 #2, copy `infra/nginx/spring.conf` to Nginx configuration:

```bash
sudo cp infra/nginx/spring.conf /etc/nginx/sites-available/spring.conf
sudo ln -sf /etc/nginx/sites-available/spring.conf /etc/nginx/sites-enabled/spring.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Issue SSL certificate for `api.clearsighteye.app`:
```bash
sudo certbot --nginx -d api.clearsighteye.app
```

### 5.3 Verify SSL Auto-Renewal (Both Instances)
```bash
sudo certbot renew --dry-run
```

---

## Step 6 — GitHub Secrets Setup

In your GitHub repository → **Settings → Secrets and variables → Actions**, configure the following secrets:

| Secret Name | Description / Value |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub account username |
| `DOCKERHUB_TOKEN` | Docker Hub Personal Access Token |
| `EC2_FASTAPI_HOST` | Hostname/IP for EC2 #1 (`inference.clearsighteye.app` or EC2 #1 IP) |
| `EC2_FASTAPI_USER` | SSH user for EC2 #1 (`ubuntu`) |
| `EC2_FASTAPI_SSH_KEY` | Contents of `.pem` SSH private key for EC2 #1 |
| `EC2_SPRING_HOST` | Hostname/IP for EC2 #2 (`api.clearsighteye.app` or EC2 #2 IP) |
| `EC2_SPRING_USER` | SSH user for EC2 #2 (`ubuntu`) |
| `EC2_SPRING_SSH_KEY` | Contents of `.pem` SSH private key for EC2 #2 |
| `MONGODB_ATLAS_URI` | MongoDB Atlas URI (`mongodb+srv://user:pass@cluster.mongodb.net/...`) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `JWT_SECRET` | 256-bit JWT secret key (`openssl rand -hex 32`) |
| `FASTAPI_INTERNAL_SECRET` | Shared internal authentication secret key |
| `FRONTEND_URL` | Frontend application URL (`https://clearsighteye.app`) |

---

## Step 7 — Deployment Verification

Push code to `main` branch to trigger GitHub Actions deployment pipelines.

Test the live HTTPS endpoints:

```bash
# 1. Check FastAPI ML Service health on EC2 #1
curl https://inference.clearsighteye.app/health

# 2. Check Spring Boot Gateway health/auth on EC2 #2
curl https://api.clearsighteye.app/api/auth/me
```

---
