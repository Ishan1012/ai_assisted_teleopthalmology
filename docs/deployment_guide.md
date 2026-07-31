# ClearSight — EC2 Production Deployment Guide with DNS, Nginx & Free SSL

This guide covers deploying the **ClearSight Glaucoma Tele-Ophthalmology System** to an **AWS EC2 (t3.micro)** instance using **Docker Hub**, **Nginx Reverse Proxy**, **MongoDB Atlas**, and free **Let's Encrypt SSL certificates (Certbot)**.

---

## Architecture Overview

```
[ User Browser / Frontend ] ── HTTPS (443) ──► [ EC2 Public IP / Domain ]
                                                      │
                                           [ Nginx Reverse Proxy ]
                                                      │
                      ┌───────────────────────────────┴───────────────────────────────┐
                      ▼ (127.0.0.1:8081)                                             ▼ (127.0.0.1:8000)
            [ Spring Boot Gateway ]                                                [ FastAPI Inference ]
                      │                                                               │
       (MongoDB Atlas Cloud Database)                                     (Model File: ~/clearsight/notebook/best_model.pth)
```

**Port Mapping on EC2 Host:**
| Service | External Access | Internal Listening Address | Description |
|---|---|---|---|
| **Nginx** | **80 (HTTP), 443 (HTTPS)** | `0.0.0.0` | Public reverse proxy & SSL termination |
| **Spring Boot API** | Blocked / Proxy Only | `127.0.0.1:8081` | Handles auth, MongoDB Atlas, API routing |
| **FastAPI Service** | Blocked / Proxy Only | `127.0.0.1:8000` | MultiNet CNN + ANFIS inference engine |
| **MongoDB Atlas** | Cloud Hosted | N/A | Secured cloud database |

---

## Step 1 — DNS Setup (Domain Provider)

1. Log into your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare, AWS Route 53).
2. Create an **A Record**:
   - **Host/Name**: `api` (or `@` for root domain)
   - **Value/Target**: Your EC2 Elastic IP / Public IP (e.g., `13.235.xx.xx`)
   - **TTL**: Auto or 300 seconds
3. Verify DNS propagation:
   ```bash
   ping api.yourdomain.com
   ```

---

## Step 2 — EC2 Security Group Rules (Inbound)

In the AWS EC2 Management Console, set your instance Security Group inbound rules to:

| Type | Protocol | Port Range | Source | Purpose |
|---|---|---|---|---|
| **SSH** | TCP | 22 | Your IP / `0.0.0.0/0` | Remote terminal access |
| **HTTP** | TCP | **80** | `0.0.0.0/0`, `::/0` | Web traffic & Let's Encrypt SSL challenge |
| **HTTPS** | TCP | **443** | `0.0.0.0/0`, `::/0` | Encrypted web traffic |

> [!IMPORTANT]
> Ports `8000` and `8081` do **NOT** need to be opened in AWS Security Groups because Nginx handles incoming requests on port 443 and proxies them locally (`127.0.0.1`).

---

## Step 3 — One-Time EC2 Host Setup

SSH into your t3.micro instance and run:

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

# 3. Create app directories
mkdir -p ~/clearsight/notebook

# 4. Copy your trained model file to EC2 (Run this command from your LOCAL machine)
scp -i your-key.pem notebook/best_model.pth ubuntu@<EC2-IP>:~/clearsight/notebook/
```

---

## Step 4 — Configure Nginx as Reverse Proxy

Create an Nginx configuration file for your domain on EC2:

```bash
sudo nano /etc/nginx/sites-available/clearsight
```

Paste the following configuration (replace `api.yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Spring Boot Gateway API
    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # FastAPI Direct Health / Docs Endpoint (Optional)
    location /fastapi/ {
        rewrite ^/fastapi/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site configuration and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/clearsight /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 5 — Obtain Free SSL Certificate (Certbot / Let's Encrypt)

Run Certbot with the Nginx plugin:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

- Enter your email when prompted.
- Accept the terms of service.
- Certbot will automatically verify domain ownership, request the SSL certificate, edit `/etc/nginx/sites-available/clearsight` to configure SSL on port 443, and set up HTTP -> HTTPS redirection!

Verify automatic renewal:
```bash
sudo certbot renew --dry-run
```

---

## Step 6 — GitHub Secrets Setup

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and configure:

| Secret Name | Description / Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub account username |
| `DOCKERHUB_TOKEN` | Docker Hub Personal Access Token |
| `EC2_HOST` | EC2 Public IP or DNS domain |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your private `.pem` SSH key |
| `MONGODB_ATLAS_URI` | MongoDB Atlas URI (`mongodb+srv://user:pass@cluster.mongodb.net/...`) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `JWT_SECRET` | 256-bit secret key (generated via `openssl rand -hex 32`) |
| `FASTAPI_INTERNAL_SECRET` | Internal secret for service-to-service auth |
| `FRONTEND_URL` | Your frontend application URL (e.g., `https://clearsight.yourdomain.com`) |

---

## Step 7 — Deploy & Verify

Whenever code is pushed to `main`:
1. `deploy-fastapi.yml` builds `clearsight-fastapi:latest` → Docker Hub → updates EC2.
2. `deploy-spring.yml` builds `clearsight-spring-api:latest` → Docker Hub → updates EC2.

### Verify Deployment on EC2:
```bash
cd ~/clearsight
docker compose -f docker-compose.prod.yml ps
```

### Test SSL Endpoints:
```bash
# Check Spring API health / auth
curl https://api.yourdomain.com/api/auth/me

# Check FastAPI health via Nginx
curl https://api.yourdomain.com/fastapi/health
```

---

## Step 8 — Performance Optimization for t3.micro (1 GB RAM)

Since PyTorch + Spring Boot JVM are running on a t3.micro instance, enable **2 GB Swap Space** to prevent Out-Of-Memory (OOM) kills:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
