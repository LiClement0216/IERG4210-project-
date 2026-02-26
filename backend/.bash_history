sudo apt update && sudo apt upgrade -y
sudo apt install -y apache2
sudo apt install -y nginx
sudo apt install -y nodejs npm
node --version
npm --version
sudo apt install -y sqlite3
sqlite3 --version
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable
sudo ufw status verbose
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
/etc/apache2/conf-available/security.conf
curl -I http://localhost
sudo nano /etc/apache2/conf-available/security.conf
echo "
ServerTokens Prod
ServerSignature Off" | sudo tee -a /etc/apache2/conf-available/security.conf
sudo a2enconf security
sudo systemctl restart apache2
curl -I http://localhost
sudo sed -i 's/# server_tokens off;/server_tokens off;/' /etc/nginx/nginx.conf
echo "server_tokens off;" | sudo tee -a /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
curl -I http://localhost
sudo mkdir -p /var/www/html
sudo chown $USER:$USER /var/www/html  # Make writable
cd /var/www/html
sudo chown -R $USER:$USER /var/www/html/
sudo rm -rf /var/www/html/*
ls -la
python3 -m http.server 8080
cd /var/www/html
sudo rm -rf /var/www/html/*
sudo chown -R www-data:www-data /var/www/html/
sudo chown -R $USER:$USER /var/www/html/
sudo rm -rf /var/www/html/*
sudo chown -R $USER:$USER /var/www/html/
ls -la /var/www/html/
touch /var/www/html/test.txt
rm /var/www/html/test.txt
ls -la /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo systemctl restart nginx
sudo systemctl status nginx.service
sudo systemctl stop apache2
sudo systemctl disable apache2
sudo systemctl start nginx
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
sudo systemctl restart nginx
sudo nginx -t
sudo nano /etc/nginx/nginx.conf
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl stop apache2
sudo systemctl disable apache2
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
sudo nginx -t
sudo nano /etc/nginx/nginx.conf
sudo sed -i '/http {/a \    server_tokens off;' /etc/nginx/nginx.conf
sudo nginx -t
sudo sed -i '/server_tokens off;/d' /etc/nginx/nginx.conf
echo "    server_tokens off;" | sudo tee -a /etc/nginx/nginx.conf >/dev/null
sed -n '18,26p' /etc/nginx/nginx.conf
sudo nginx -t
sudo sed -i '22d' /etc/nginx/nginx.conf
sudo nginx -t  # "syntax is ok"
sudo sed -i '/server_tokens/d' /etc/nginx/nginx.conf
sudo sed -i '/http {/a\ \ \ \ server_tokens off;' /etc/nginx/nginx.conf
sudo nginx -t 
sudo systemctl restart nginx
curl -I http://localhost | grep Server
sudo systemctl status nginx
curl http://localhost
curl -I http://localhost | grep Server
sudo ufw status
sudo ufw allow 80 
echo "    error_log /var/log/nginx/error.log warn;" | sudo tee -a /etc/nginx/nginx.conf
sudo sed -i '/location \/ {/,/}/ s/$/\n        autoindex off;/' /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
