# ClearSight — EC2 Production Deployment Guide with DNS, Nginx & Free SSL

This guide covers deploying the **ClearSight Glaucoma Tele-Ophthalmology System** to an **AWS EC2 (t3.micro)** instance using **Docker Hub**, **Nginx Reverse Proxy**, **MongoDB Atlas**, and free **Let's Encrypt SSL certificates (Certbot)** for `api.clearsighteye.app`.

---

## Architecture & URL Routing Overview

```
                                [ Client / Dashboard ]
                                          │
                     https://api.clearsighteye.app (Port 443)
                                          │
                              [ EC2 Nginx Reverse Proxy ]
                                          │
              ┌───────────────────────────┴───────────────────────────┐
              ▼                                                       ▼
  https://api.clearsighteye.app/api                    https://api.clearsighteye.app/fastapi
              │                                                       │
   (Proxy: 127.0.0.1:8081)                                 (Proxy: 127.0.0.1:8000)
    [ Spring Boot Gateway ]                                 [ FastAPI Inference ]
              │                                                       │
(MongoDB Atlas Cloud Database)                    (Model: ~/clearsight/notebook/best_model.pth)
```

**Port Mapping on EC2 Host:**
| Public Endpoint | Proxied Internal Address | Target Service | Description |
|---|---|---|---|
| `https://api.clearsighteye.app/api` | `http://127.0.0.1:8081` | **Spring Boot Gateway** | Auth, scans, user profiles, MongoDB Atlas |
| `https://api.clearsighteye.app/fastapi` | `http://127.0.0.1:8000` | **FastAPI ML Service** | MultiNet CNN + ANFIS glaucoma inference |

---

## Step 1 — DNS Setup (Domain Provider)

1. Log into your domain registrar (e.g. Cloudflare, Namecheap, GoDaddy, AWS Route 53).
2. Add an **A Record**:
   - **Type**: `A`
   - **Name/Host**: `api` (resolves to `api.clearsighteye.app`)
   - **IPv4 Address**: Your EC2 Elastic IP / Public IP (e.g., `13.235.xx.xx`)
   - **TTL**: Auto or 300 seconds
3. Verify DNS propagation:
   ```bash
   ping api.clearsighteye.app
   ```

---

## Step 2 — EC2 Security Group Rules (Inbound)

In AWS EC2 Console → Security Groups, configure inbound rules:

| Type | Protocol | Port Range | Source | Purpose |
|---|---|---|---|---|
| **SSH** | TCP | 22 | Your IP / `0.0.0.0/0` | Terminal access |
| **HTTP** | TCP | **80** | `0.0.0.0/0`, `::/0` | Web traffic & Let's Encrypt validation |
| **HTTPS** | TCP | **443** | `0.0.0.0/0`, `::/0` | Encrypted production API traffic |

---

## Step 3 — One-Time EC2 Host Setup

SSH into your EC2 instance and run:

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

# 4. Copy your trained model file to EC2 (Run on your LOCAL machine)
scp -i your-key.pem notebook/best_model.pth ubuntu@<EC2-IP>:~/clearsight/notebook/
```

---

## Step 4 — Nginx Configuration for `api.clearsighteye.app`

Create the Nginx reverse proxy configuration file:

```bash
sudo nano /etc/nginx/sites-available/clearsight
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name api.clearsighteye.app;

    # Spring Boot Gateway API (https://api.clearsighteye.app/api/...)
    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # FastAPI Direct ML Endpoint (https://api.clearsighteye.app/fastapi/...)
    location /fastapi/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site configuration:

```bash
sudo ln -s /etc/nginx/sites-available/clearsight /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 5 — Issue Free SSL Certificate (Certbot / Let's Encrypt)

Run Certbot to generate the SSL certificate for `api.clearsighteye.app`:

```bash
sudo certbot --nginx -d api.clearsighteye.app
```

- Enter your email address when prompted (used for renewal/security notices).
- Agree to the Terms of Service.
- Certbot will automatically issue the certificate and update Nginx to redirect HTTP to HTTPS!

Verify certificate auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## Step 6 — GitHub Secrets Setup

In your GitHub repository → **Settings → Secrets and variables → Actions**, add:

| Secret Name | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub account username |
| `DOCKERHUB_TOKEN` | Docker Hub Personal Access Token |
| `EC2_HOST` | `api.clearsighteye.app` (or EC2 IP) |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your `.pem` private SSH key |
| `MONGODB_ATLAS_URI` | MongoDB Atlas URI (`mongodb+srv://user:pass@cluster.mongodb.net/...`) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `JWT_SECRET` | 256-bit secret key (`openssl rand -hex 32`) |
| `FASTAPI_INTERNAL_SECRET` | Shared internal secret key |
| `FRONTEND_URL` | `https://clearsighteye.app` |

---

## Step 7 — Verification

Push your code to `main`. GitHub Actions will build and deploy both services.

Test the live HTTPS endpoints:

```bash
# Check Spring API health & auth
curl https://api.clearsighteye.app/api/auth/me

# Check FastAPI health via /fastapi
curl https://api.clearsighteye.app/fastapi/health
```

---

## Step 8 — Enable 2 GB Swap Space on t3.micro

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
