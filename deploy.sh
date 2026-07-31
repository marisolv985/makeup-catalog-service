#!/bin/bash
# GlowFlow - Oracle Cloud Deployment Script
# Run this on your Oracle Cloud ARM VM (Ubuntu 22.04)

set -e

echo "=== Instalando Docker ==="
sudo apt update -y
sudo apt install -y docker.io git nginx certbot python3-certbot-nginx
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

echo "=== Instalando Docker Compose ==="
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "=== Clonando proyecto ==="
cd ~
git clone https://github.com/marisolv985/makeup-catalog-service.git
cd makeup-catalog-service

echo "=== Levantando servicios ==="
docker compose up -d

echo "=== Configurando NGINX + SSL ==="
sudo tee /etc/nginx/sites-available/glowflow > /dev/null << 'NGINX'
server {
    listen 80;
    server_name TU_DOMINIO.com www.TU_DOMINIO.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/glowflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=== LISTO ==="
echo "1. Apunta tu dominio a la IP de esta VM"
echo "2. Ejecuta: sudo certbot --nginx -d TU_DOMINIO.com"
echo "   para activar HTTPS automaticamente"
echo "3. Tu tienda estara en https://TU_DOMINIO.com"
