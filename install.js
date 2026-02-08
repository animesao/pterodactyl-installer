#!/usr/bin/env node

/**
 * Pterodactyl Panel + Wings Complete Installer
 * Полный установщик Pterodactyl Panel и Wings на VDS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const axios = require('axios');
const crypto = require('crypto');

// Цвета
const colors = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', 
    yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};

const C = colors;
let config = {};

// Логирование
function log(msg, color = 'reset') { console.log(`${C[color]}${msg}${C.reset}`); }
function logHdr(msg) { console.log('\n' + '='.repeat(60)); log(msg, 'cyan'); console.log('='.repeat(60) + '\n'); }
function logStep(msg) { log(`[.] ${msg}`, 'yellow'); }
function logOK(msg) { log(`✓ ${msg}`, 'green'); }
function logErr(msg) { log(`✗ ${msg}`, 'red'); }

// Выполнение команды
function exec(cmd, desc = '') {
    if (desc) logStep(desc);
    try {
        execSync(cmd, { stdio: 'inherit', shell: '/bin/bash' });
        return true;
    } catch (e) { logErr(`Error: ${e.message}`); return false; }
}

// Проверка root
function isRoot() {
    try { execSync('id -u', { encoding: 'utf8' }); return true; }
    catch { return false; }
}

// Получение OS
function getOS() {
    try { return execSync('cat /etc/os-release | grep "^ID=" | cut -d= -f2', { encoding: 'utf8' }).trim(); }
    catch { return 'unknown'; }
}

// Проверка команды
function hasCmd(cmd) {
    try { execSync(`which ${cmd}`, { encoding: 'utf8' }); return true; }
    catch { return false; }
}

// Генерация пароля
function genPass(len = 32) {
    return crypto.randomBytes(len).toString('hex').slice(0, len);
}

// Модуль 1: Система
async function setupSystem() {
    logHdr('1. System Update');
    const os = getOS();
    log(`OS: ${os}`, 'cyan');
    
    if (['ubuntu', 'debian'].includes(os)) {
        exec('apt-get update', 'Update packages');
        exec('apt-get upgrade -y', 'Upgrade system');
        exec('apt-get install -y curl wget git unzip zip ca-certificates', 'Utils');
    } else if (['centos', 'rhel', 'fedora'].includes(os)) {
        exec('yum update -y', 'Update system');
        exec('yum install -y curl wget git unzip', 'Utils');
    }
    logOK('System updated');
}

// Модуль 2: Docker
async function setupDocker() {
    logHdr('2. Install Docker');
    
    if (hasCmd('docker')) { logOK('Docker already installed'); return; }
    
    const os = getOS();
    if (['ubuntu', 'debian'].includes(os)) {
        exec('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -', 'Docker GPG');
        exec('add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"', 'Docker Repo');
        exec('apt-get update', 'Update');
        exec('apt-get install -y docker-ce docker-ce-cli containerd.io', 'Docker CE');
        exec('systemctl start docker', 'Start Docker');
        exec('systemctl enable docker', 'Docker autostart');
    } else if (['centos', 'rhel', 'fedora'].includes(os)) {
        exec('yum install -y yum-utils', 'yum-utils');
        exec('yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo', 'Docker Repo');
        exec('yum install -y docker-ce docker-ce-cli containerd.io', 'Docker CE');
        exec('systemctl start docker', 'Start Docker');
        exec('systemctl enable docker', 'Docker autostart');
    }
    logOK('Docker installed');
}

// Модуль 3: Docker Compose
async function setupDockerCompose() {
    logHdr('3. Install Docker Compose');
    
    if (hasCmd('docker-compose')) { logOK('Docker Compose already installed'); return; }
    
    const ver = 'v2.21.0';
    exec(`curl -L "https://github.com/docker/compose/releases/download/${ver}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`, 'Download');
    exec('chmod +x /usr/local/bin/docker-compose', 'Permissions');
    exec('ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose', 'Symlink');
    logOK('Docker Compose installed');
}

// Модуль 4: Nginx
async function setupNginx() {
    logHdr('4. Install Nginx');
    
    if (hasCmd('nginx')) { logOK('Nginx already installed'); return; }
    
    const os = getOS();
    if (['ubuntu', 'debian'].includes(os)) {
        exec('apt-get install -y nginx', 'Install Nginx');
        exec('systemctl start nginx', 'Start Nginx');
        exec('systemctl enable nginx', 'Nginx autostart');
    } else if (['centos', 'rhel', 'fedora'].includes(os)) {
        exec('yum install -y nginx', 'Install Nginx');
        exec('systemctl start nginx', 'Start Nginx');
        exec('systemctl enable nginx', 'Nginx autostart');
    }
    logOK('Nginx installed');
}

// Модуль 5: PHP 8.2
async function setupPHP() {
    logHdr('5. Install PHP 8.2');
    
    if (hasCmd('php') && execSync('php -v', { encoding: 'utf8' }).includes('8.2')) {
        logOK('PHP 8.2 already installed'); return;
    }
    
    const os = getOS();
    if (['ubuntu', 'debian'].includes(os)) {
        exec('apt-get install -y software-properties-common', 'add-apt-repository');
        exec('add-apt-repository -y ppa:ondrej/php', 'PPA PHP');
        exec('apt-get update', 'Update');
        exec('apt-get install -y php8.2 php8.2-cli php8.2-common php8.2-curl php8.2-gd php8.2-intl php8.2-mbstring php8.2-mysql php8.2-xml php8.2-zip php8.2-bcmath php8.2-redis php8.2-fpm', 'PHP 8.2');
    }
    logOK('PHP 8.2 installed');
}

// Модуль 6: Composer
async function setupComposer() {
    logHdr('6. Install Composer');
    
    if (hasCmd('composer')) { logOK('Composer already installed'); return; }
    
    exec('curl -sS https://getcomposer.org/installer | php', 'Download Composer');
    exec('mv composer.phar /usr/local/bin/composer', 'Install Composer');
    exec('chmod +x /usr/local/bin/composer', 'Composer permissions');
    logOK('Composer installed');
}

// Модуль 7: MariaDB
async function setupMariaDB() {
    logHdr('7. Install MariaDB');
    
    if (hasCmd('mysql')) { logOK('MariaDB already installed'); return; }
    
    const os = getOS();
    if (['ubuntu', 'debian'].includes(os)) {
        exec('apt-get install -y mariadb-server mariadb-client', 'MariaDB');
        exec('systemctl start mariadb', 'Start MariaDB');
        exec('systemctl enable mariadb', 'MariaDB autostart');
    } else if (['centos', 'rhel', 'fedora'].includes(os)) {
        exec('yum install -y mariadb-server mariadb', 'MariaDB');
        exec('systemctl start mariadb', 'Start MariaDB');
        exec('systemctl enable mariadb', 'MariaDB autostart');
    }
    logOK('MariaDB installed');
}

// Модуль 8: Panel DB
async function setupPanelDB() {
    logHdr('8. Configure Panel Database');
    
    const panelDBPass = genPass(24);
    config.panelDBPass = panelDBPass;
    
    log(`Panel DB Password: ${panelDBPass}`, 'cyan');
    
    const sql = `
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
CREATE DATABASE panel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pterodactyl'@'localhost' IDENTIFIED BY '${panelDBPass}';
GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'localhost';
FLUSH PRIVILEGES;
`;
    
    fs.writeFileSync('/tmp/panel-db.sql', sql);
    exec(`mysql -u root < /tmp/panel-db.sql`, 'Create Panel DB');
    exec('rm /tmp/panel-db.sql', 'Cleanup');
    logOK('Panel DB configured');
}

// Модуль 9: Wings DB
async function setupWingsDB() {
    logHdr('9. Configure Wings Database');
    
    const wingsDBPass = genPass(24);
    config.wingsDBPass = wingsDBPass;
    
    log(`Wings DB Password: ${wingsDBPass}`, 'cyan');
    
    const sql = `
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
CREATE DATABASE wings CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pterodactyl'@'localhost' IDENTIFIED BY '${wingsDBPass}';
GRANT ALL PRIVILEGES ON wings.* TO 'pterodactyl'@'localhost';
FLUSH PRIVILEGES;
`;
    
    fs.writeFileSync('/tmp/wings-db.sql', sql);
    exec(`mysql -u root < /tmp/wings-db.sql`, 'Create Wings DB');
    exec('rm /tmp/wings-db.sql', 'Cleanup');
    logOK('Wings DB configured');
}

// Модуль 10: Panel User
async function createPanelUser() {
    logHdr('10. Create Panel User');
    
    try {
        execSync('id pterodactyl', { encoding: 'utf8' });
        logOK('User pterodactyl already exists');
    } catch {
        exec('useradd -r -s /sbin/nologin pterodactyl', 'Create user');
        exec('mkdir -p /var/www/pterodactyl', 'Panel directory');
        exec('chown -R pterodactyl:pterodactyl /var/www/pterodactyl', 'Permissions');
    }
    logOK('Panel user created');
}

// Модуль 11: Download Panel
async function downloadPanel() {
    logHdr('11. Download Pterodactyl Panel');
    
    const panelDir = '/var/www/pterodactyl';
    exec(`cd ${panelDir} && rm -rf *`, 'Clean directory');
    
    logStep('Downloading from GitHub...');
    exec(`wget -O ${panelDir}/panel.zip "https://github.com/pterodactyl/panel/archive/refs/heads/develop.zip"`, 'Download Panel');
    exec(`cd ${panelDir} && unzip -q panel.zip`, 'Extract');
    exec(`cd ${panelDir} && mv panel-*/* . && mv panel-*/.* . 2>/dev/null || true`, 'Move files');
    exec(`cd ${panelDir} && rmdir panel-*`, 'Remove folder');
    exec(`rm ${panelDir}/panel.zip`, 'Remove archive');
    exec(`chown -R pterodactyl:pterodactyl ${panelDir}`, 'Permissions');
    logOK('Panel downloaded');
}

// Модуль 12: Panel .env
async function configurePanelEnv() {
    logHdr('12. Configure Panel .env');
    
    const appKey = 'base64:' + crypto.randomBytes(32).toString('base64');
    config.appKey = appKey;
    
    const env = `
APP_NAME=Pterodactyl
APP_ENV=production
APP_KEY=${appKey}
APP_DEBUG=false
APP_URL=http://${config.panelDomain}

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=panel
DB_USERNAME=pterodactyl
DB_PASSWORD=${config.panelDBPass}

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_ADDRESS=null
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
`;
    
    fs.writeFileSync('/var/www/pterodactyl/.env', env);
    exec('chown pterodactyl:pterodactyl /var/www/pterodactyl/.env', '.env permissions');
    logOK('.env created');
}

// Модуль 13: Composer deps
async function installPanelDeps() {
    logHdr('13. Install Panel Dependencies');
    
    exec('cd /var/www/pterodactyl && composer install --no-dev --optimize-autoloader', 'Composer install');
    logOK('Dependencies installed');
}

// Модуль 14: Panel migrations
async function runPanelMigrations() {
    logHdr('14. Run Panel Migrations');
    
    exec('cd /var/www/pterodactyl && php artisan migrate --force', 'Migrations');
    logOK('Migrations completed');
}

// Модуль 15: Panel seeds
async function seedPanel() {
    logHdr('15. Seed Panel Data');
    
    exec('cd /var/www/pterodactyl && php artisan db:seed --force', 'Seeds');
    logOK('Seeds completed');
}

// Модуль 16: Storage link
async function setupStorageLink() {
    logHdr('16. Configure Storage');
    
    exec('cd /var/www/pterodactyl && php artisan storage:link', 'Storage link');
    exec('cd /var/www/pterodactyl && chmod -R 755 storage bootstrap/cache', 'Permissions');
    logOK('Storage configured');
}

// Модуль 17: Firewall
async function setupFirewall() {
    logHdr('17. Configure Firewall');
    
    if (hasCmd('ufw')) {
        exec('ufw allow OpenSSH', 'OpenSSH');
        exec('ufw allow "Nginx Full"', 'Nginx');
        exec('ufw --force enable', 'Enable UFW');
        logOK('UFW configured');
    } else if (hasCmd('firewall-cmd')) {
        exec('firewall-cmd --permanent --add-service=http', 'HTTP');
        exec('firewall-cmd --permanent --add-service=https', 'HTTPS');
        exec('firewall-cmd --permanent --add-service=ssh', 'SSH');
        exec('firewall-cmd --reload', 'Reload firewall');
        logOK('Firewalld configured');
    }
}

// Модуль 18: Nginx Panel config
async function configureNginxPanel() {
    logHdr('18. Configure Nginx for Panel');
    
    const panelDir = '/var/www/pterodactyl/public';
    const nginxConf = `server {
    listen 80;
    server_name ${config.panelDomain};
    root ${panelDir};
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }

    location ~ /\\. {
        deny all;
    }

    client_max_body_size 100m;
}
`;
    
    fs.writeFileSync('/etc/nginx/sites-available/pterodactyl.conf', nginxConf);
    exec('ln -sf /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-enabled/', 'Enable');
    exec('rm -f /etc/nginx/sites-enabled/default', 'Remove default');
    exec('nginx -t', 'Test Nginx');
    exec('systemctl reload nginx', 'Reload Nginx');
    logOK('Nginx configured for Panel');
}

// Модуль 19: SSL
async function setupSSL() {
    logHdr('19. SSL Certificate (Let\'s Encrypt)');
    
    if (!hasCmd('certbot')) {
        const os = getOS();
        if (['ubuntu', 'debian'].includes(os)) {
            exec('apt-get install -y certbot python3-certbot-nginx', 'Certbot');
        }
    }
    
    logStep('Getting SSL certificate...');
    const cmd = `certbot --nginx -d ${config.panelDomain} --non-interactive --agree-tos --email ${config.adminEmail}`;
    try {
        exec(cmd, 'SSL Certificate');
        logOK('SSL certificate installed');
    } catch {
        logErr('Failed to get SSL. Skipping.');
    }
}

// Модуль 20: Wings User
async function createWingsUser() {
    logHdr('20. Create Wings User');
    
    try {
        execSync('id pterodactylwings', { encoding: 'utf8' });
        logOK('User wings already exists');
    } catch {
        exec('useradd -r -s /sbin/nologin pterodactylwings', 'Create wings user');
        exec('mkdir -p /var/lib/pterodactyl', 'Wings directory');
        exec('mkdir -p /etc/pterodactyl', 'Wings config');
        exec('chown -R pterodactylwings:pterodactylwings /var/lib/pterodactyl', 'Permissions');
        exec('chown -R pterodactylwings:pterodactylwings /etc/pterodactyl', 'Config permissions');
    }
    logOK('Wings user created');
}

// Модуль 21: Install Wings
async function installWings() {
    logHdr('21. Install Wings');
    
    logStep('Downloading Wings...');
    try {
        const response = await axios.get('https://api.github.com/repos/pterodactyl/wings/releases/latest');
        const latest = response.data.tag_name;
        const url = `https://github.com/pterodactyl/wings/releases/download/${latest}/wings_linux_amd64`;
        exec(`wget -O /usr/local/bin/wings "${url}"`, 'Download wings');
        exec('chmod +x /usr/local/bin/wings', 'Wings permissions');
        logOK('Wings downloaded');
    } catch (e) {
        logErr('Wings download error: ' + e.message);
        return;
    }
    
    logOK('Wings installed');
}

// Модуль 22: Configure Wings
async function configureWings() {
    logHdr('22. Configure Wings');
    
    const wingsConf = {
        logLevel: "info",
        api: {
            host: "0.0.0.0",
            port: 8080,
            ssl: { enabled: false }
        },
        system: {
            data: "/var/lib/pterodactyl/volumes",
            sftp: { bindPort: 2022 }
        },
        remote: {
            base: `http://${config.panelDomain}`,
            key: config.wingsAPIKey
        }
    };
    
    fs.writeFileSync('/etc/pterodactyl/config.yml', JSON.stringify(wingsConf, null, 2));
    exec('chown pterodactylwings:pterodactylwings /etc/pterodactyl/config.yml', 'Config permissions');
    
    const service = `[Unit]
Description=Pterodactyl Wings Daemon
After=docker.service
Requires=docker.service

[Service]
User=pterodactylwings
Group=pterodactylwings
ExecStart=/usr/local/bin/wings
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s

[Install]
WantedBy=multi-user.target
`;
    
    fs.writeFileSync('/etc/systemd/system/wings.service', service);
    exec('systemctl daemon-reload', 'Reload systemd');
    exec('systemctl enable wings', 'Wings autostart');
    logOK('Wings configured');
}

// Модуль 23: Queue Worker
async function setupQueueWorker() {
    logHdr('23. Configure Queue Worker');
    
    const cron = `* * * * * cd /var/www/pterodactyl && php artisan queue:work --sleep=3 --tries=3 --max-time=3600 >> /dev/null 2>&1`;
    exec(`echo "${cron}" | crontab -u pterodactyl -`, 'Crontab');
    logOK('Queue worker configured');
}

// Модуль 24: Timezone
async function setupTimezone() {
    logHdr('24. Configure Timezone');
    
    exec(`timedatectl set-timezone ${config.timezone}`, 'Timezone');
    logOK(`Timezone: ${config.timezone}`);
}

// Главное меню
async function showMenu() {
    console.clear();
    logHdr('Pterodactyl Complete Installer v2.0');
    log('Full installer: Panel + Wings + Nginx + SSL', 'cyan');
    console.log();
    
    const answers = await inquirer.prompt([
        { type: 'input', name: 'panelDomain', message: 'Panel domain:', default: 'panel.example.com', validate: d => d ? true : 'Required' },
        { type: 'input', name: 'adminEmail', message: 'Email for SSL:', default: 'admin@example.com' },
        { type: 'input', name: 'timezone', message: 'Timezone:', default: 'UTC' },
        { type: 'confirm', name: 'installWings', message: 'Install Wings?', default: true },
        { type: 'confirm', name: 'installSSL', message: 'Install SSL (Let\'s Encrypt)?', default: true }
    ]);
    
    config = answers;
    config.wingsAPIKey = genPass(32);
    
    return answers;
}

// Main function
async function main() {
    if (!isRoot()) {
        logErr('Run as root: sudo su -');
        process.exit(1);
    }
    
    const answers = await showMenu();
    
    logHdr('Starting Installation');
    
    // System
    await setupSystem();
    await setupFirewall();
    await setupTimezone();
    
    // Docker
    await setupDocker();
    await setupDockerCompose();
    
    // Web
    await setupNginx();
    await setupPHP();
    await setupComposer();
    
    // DB
    await setupMariaDB();
    await setupPanelDB();
    
    // Panel
    await createPanelUser();
    await downloadPanel();
    await configurePanelEnv();
    await installPanelDeps();
    await runPanelMigrations();
    await seedPanel();
    await setupStorageLink();
    await setupQueueWorker();
    
    // Nginx
    await configureNginxPanel();
    
    // SSL
    if (answers.installSSL) {
        await setupSSL();
    }
    
    // Wings
    if (answers.installWings) {
        await setupWingsDB();
        await createWingsUser();
        await installWings();
        await configureWings();
    }
    
    // Final
    logHdr('Installation Complete!');
    logOK('Pterodactyl Panel installed!');
    
    console.log('\nLogin credentials:');
    console.log(`   URL: http://${answers.panelDomain}`);
    console.log(`   Email: admin@pterodactyl.io`);
    console.log(`   Password: ChangeMe123!`);
    console.log(`   Wings API Key: ${config.wingsAPIKey}`);
    
    console.log('\nNext steps:');
    console.log('   1. Open http://' + answers.panelDomain);
    console.log('   2. Create admin account');
    console.log('   3. Add Node in panel (Wings)');
    console.log('   4. Start wings: systemctl start wings');
    
    if (answers.installWings) {
        console.log('\nWings API Key saved in /etc/pterodactyl/config.yml');
    }
}

// Run
main().catch(e => { logErr(e.message); process.exit(1); });
