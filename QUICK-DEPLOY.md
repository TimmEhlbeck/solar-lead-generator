# Schnelle Deployment-Anleitung

Das GitHub Repository wurde bereits erstellt: https://github.com/TimmEhlbeck/solar-lead-generator

## Schritt 1: Code zu GitHub pushen

Da dein SSH-Key passwortgeschützt ist, führe bitte folgende Befehle in deinem Terminal aus:

```bash
cd /Users/timmehlbeck/Projects/Solar-Lead-Generator/solar-lead-backend

# SSH Key zum Agent hinzufügen (Passwort eingeben wenn gefragt)
ssh-add ~/.ssh/id_ed25519

# Code zu GitHub pushen
git push -u origin main
```

## Schritt 2: Auf Hetzner Server deployen

### Option A: Via Hetzner Cloud Console (Einfachste Methode)

1. Gehe zu https://console.hetzner.cloud/
2. Logge dich ein
3. Wähle deinen Server aus
4. Klicke auf "Console" um Web-Terminal zu öffnen
5. Logge dich mit root-Passwort ein: `Tf3WPiWvpvXt9WpgLpX3`

6. Führe diese Befehle aus:

```bash
# System aktualisieren
apt update && apt upgrade -y

# PHP 8.3 installieren
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml \
  php8.3-curl php8.3-zip php8.3-gd php8.3-intl php8.3-bcmath php8.3-sqlite3

# Composer installieren
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Node.js 20 installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# MySQL installieren
apt install -y mysql-server

# Nginx installieren
apt install -y nginx

# Git und Supervisor installieren
apt install -y git supervisor

# MySQL Datenbank erstellen
mysql -e "CREATE DATABASE solar_lead_generator;"
mysql -e "CREATE USER 'solar_user'@'localhost' IDENTIFIED BY 'Solar2025!Secure';"
mysql -e "GRANT ALL PRIVILEGES ON solar_lead_generator.* TO 'solar_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Application klonen
cd /var/www
git clone https://github.com/TimmEhlbeck/solar-lead-generator.git
cd solar-lead-generator

# Dependencies installieren
composer install --optimize-autoloader --no-dev
npm install
npm run build

# .env konfigurieren
cp .env.example .env
nano .env
```

7. In nano `.env` editieren (wichtige Werte):

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://angebot.gw-energytec.de

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=solar_lead_generator
DB_USERNAME=solar_user
DB_PASSWORD=Solar2025!Secure

QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
```

Speichern: `Ctrl+X`, dann `Y`, dann `Enter`

8. Laravel Setup:

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permissions
chown -R www-data:www-data /var/www/solar-lead-generator
chmod -R 755 /var/www/solar-lead-generator
chmod -R 775 storage bootstrap/cache
```

9. Nginx konfigurieren:

```bash
nano /etc/nginx/sites-available/solar-lead-generator
```

Einfügen:

```nginx
server {
    listen 80;
    server_name angebot.gw-energytec.de www.angebot.gw-energytec.de;
    root /var/www/solar-lead-generator/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Site aktivieren
ln -s /etc/nginx/sites-available/solar-lead-generator /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL installieren
apt install -y certbot python3-certbot-nginx
certbot --nginx -d angebot.gw-energytec.de --non-interactive --agree-tos --email admin@gw-energytec.de

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

10. Admin-User erstellen:

```bash
cd /var/www/solar-lead-generator
php artisan tinker
```

In Tinker:

```php
App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@gw-energytec.de',
    'password' => bcrypt('ChangeThis123!'),
    'is_admin' => true
]);
exit;
```

## Fertig!

Deine App sollte jetzt unter https://angebot.gw-energytec.de erreichbar sein!

### Troubleshooting

**502 Bad Gateway:**
```bash
systemctl status php8.3-fpm
systemctl restart php8.3-fpm nginx
```

**500 Internal Server Error:**
```bash
tail -f /var/www/solar-lead-generator/storage/logs/laravel.log
chmod -R 775 storage bootstrap/cache
```

**DNS nicht erreichbar:**
- Warte 24-48h für DNS-Propagation
- Prüfe ob Domain auf 91.99.233.173 zeigt: `dig angebot.gw-energytec.de`
