# 🦕 Pterodactyl Complete Installer

<div align="center">

![Pterodactyl](https://img.shields.io/badge/Pterodactyl-Complete_Installer-orange?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTExLjUgMmMxLjEwNCAwIDItLjg5NiAyLTIgMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAydyAuODk2IDIgMiAyem0zLjUgMTVoLTEzYzAtLjU1Mi40NDgtMSAxLTFoMTNjLjU1MiAwIDEtLjQ0OCAxLTFzLS40NDgtMS0xLTF6bS0xMi41IDVoMTNjLjU1MiAwIDEtLjQ0OCAxLTFzLS40NDgtMS0xLTFoLTEzYy0uNTUyIDAtMSAuNDQ4LTEgMXMuNDQ4IDEgMSAxem0xMi41IDVoMTNjLjU1MiAwIDEtLjQ0OCAxLTFzLS40NDgtMS0xLTFoLTEzYy0uNTUyIDAtMSAuNDQ4LTEgMXMuNDQ4IDEgMSAxeiIvPjwvc3ZnPg==)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Полный автоматический установщик Pterodactyl Panel + Wings для VDS на Node.js**

[🚀 Быстрый старт](#-быстрый-старт) • [📖 Документация](#-что-устанавливает-скрипт) • [🐛 Проблемы](https://github.com/animesao/pterodactyl-installer/issues)

---

<div align="center">

![Install Preview](https://img.shields.io/badge/✨-Animesao_Pterodactyl_Installer-FF6B6B?style=for-the-badge&logo=github)

*Сделано с ❤️ для сообщества*

</div>

---

## ✨ Возможности

<div align="center">

| 🎛️ Панель | 🌐 Веб-сервер | 🔒 SSL | 🐳 Docker | 🔧 Firewall |
|:---:|:---:|:---:|:---:|:---:|
| Pterodactyl Panel | Nginx + PHP 8.2 | Let's Encrypt | Containerization | UFW/Firewalld |

| 💾 Базы данных | ⚡ Queue Worker | 🦅 Wings Daemon | 📊 Monitoring | 🔄 Auto-update |
|:---:|:---:|:---:|:---:|:---:|
| MariaDB | Cron Jobs | Game Servers | Systemd | System updates |

</div>

## 📋 Требования

<div align="left">

```diff
✅ VDS с Linux (Ubuntu 18.04+ / Debian 10+ / CentOS 7+)
✅ Минимум 2GB RAM
✅ Минимум 30GB SSD
✅ Root доступ
✅ Домен (для SSL)
```

</div>

## 🚀 Быстрый старт

### Вариант 1: Клонирование репозитория

```bash
# 📥 Скачивание
git clone https://github.com/animesao/pterodactyl-installer.git
cd pterodactyl-installer

# 📦 Установка зависимостей
npm install

# ▶️ Запуск
npm start
```

### Вариант 2: Прямой запуск

```bash
# 📥 Скачивание скрипта
curl -sL https://raw.githubusercontent.com/animesao/pterodactyl-installer/master/install.js -o install.js
curl -sL https://raw.githubusercontent.com/animesao/pterodactyl-installer/master/package.json -o package.json

# 📦 Установка зависимостей
npm install

# ▶️ Запуск от root
sudo su -
node install.js
```

## 📖 Что устанавливает скрипт

### 🖥️ Система
```
1️⃣  Обновление системы
2️⃣  Настройка firewall (UFW/Firewalld)
3️⃣  Настройка часового пояса
```

### 🐳 Docker
```
4️⃣  Docker CE
5️⃣  Docker Compose
```

### 🌐 Веб-сервер
```
6️⃣  Nginx
7️⃣  PHP 8.2 + расширения
8️⃣  Composer
```

### 💾 Базы данных
```
9️⃣   MariaDB
🔟   БД для Panel (pterodactyl)
1️⃣1️⃣  БД для Wings (pterodactyl)
```

### 🎛️ Pterodactyl Panel
```
1️⃣2️⃣  Создание пользователя pterodactyl
1️⃣3️⃣  Скачивание Panel с GitHub
1️⃣4️⃣  Конфигурация .env
1️⃣5️⃣  Установка зависимостей Composer
1️⃣6️⃣  Миграции базы данных
1️⃣7️⃣  Seeds (начальные данные)
1️⃣8️⃣  Storage link
1️⃣9️⃣  Queue Worker (cron)
```

### 🌐 Nginx
```
2️⃣0️⃣  Конфигурация виртуального хоста
2️⃣1️⃣  SSL сертификат (опционально)
```

### 🦅 Wings (опционально)
```
2️⃣2️⃣  Создание пользователя wings
2️⃣3️⃣  Установка Wings
2️⃣4️⃣  Конфигурация Wings
2️⃣5️⃣  Systemd service
```

## 📂 Структура проекта

```
pterodactyl-installer/
├── 📄 package.json      # NPM конфигурация
├── 📜 install.js        # Основной скрипт (24 модуля)
└── 📖 README.md         # Документация
```

## ⚙️ Конфигурация при запуске

Скрипт спросит:

| 📝 Параметр | 📌 Описание | 💡 Пример |
|:---|:---|:---|
| 🌐 Домен панели | Адрес вашей панели | `panel.mydomain.com` |
| 📧 Email | Для SSL сертификата | `admin@mydomain.com` |
| 🕐 Часовой пояс | Ваш часовой пояс | `Europe/Moscow` |
| 🦅 Wings | Установить Wings? | `да/нет` |
| 🔒 SSL | Установить SSL? | `да/нет` |

## 🎯 После установки

1. 🌐 Откройте `http://ваш-домен` в браузере
2. 👤 Создайте аккаунт администратора
   - 📧 Email: `admin@pterodactyl.io`
   - 🔑 Пароль: `ChangeMe123!` ⚠️ *(смените после входа)*
3. 📍 Перейдите в **Locations → Create Location**
4. 🖥️ Создайте **Node → Add Node**
5. 📝 Введите имя ноды и адрес (`:8080`)
6. 🔐 Скопируйте API Key и вставьте в конфиг Wings
7. ▶️ Запустите Wings: `systemctl start wings`

## 📟 Команды Wings

```bash
# ▶️ Запуск
systemctl start wings

# ⏹️ Остановка
systemctl stop wings

# 🔄 Перезапуск
systemctl restart wings

# 📊 Статус
systemctl status wings

# 📝 Логи
journalctl -u wings -f
```

## 💾 Базы данных

| 🗄️ База | 👤 Пользователь | 🔑 Пароль |
|:---|:---:|:---:|
| Panel DB: `panel` | `pterodactyl` | Генерируется автоматически |
| Wings DB: `wings` | `pterodactyl` | Генерируется автоматически |

> 💡 Пароли показываются при установке и сохраняются в логах

## 📁 Файлы конфигурации

| 🐍 Компонент | 📍 Путь |
|:---|:---|
| Panel | `/var/www/pterodactyl/.env` |
| Nginx | `/etc/nginx/sites-available/pterodactyl.conf` |
| Wings | `/etc/pterodactyl/config.yml` |
| Wings Service | `/etc/systemd/system/wings.service` |

## 🔧 Устранение неполадок

### 🚫 Ошибка 502 Bad Gateway

```bash
systemctl restart nginx
systemctl status php8.2-fpm
```

### 🦅 Wings не запускается

```bash
journalctl -u wings -e
# Проверьте API Key в /etc/pterodactyl/config.yml
```

### 🔌 Не подключается к базе

```bash
mysql -u pterodactyl -p
# Пароль из вывода установки
```

## 📜 Лицензия

<div align="center">

MIT License

Copyright (c) 2024 Animesao

---

<div align="center">

### 🤝 Сделано с ❤️ от [Animesao](https://github.com/animesao)

[![GitHub followers](https://img.shields.io/github/followers/animesao?style=social&logo=github)](https://github.com/animesao)
[![GitHub stars](https://img.shields.io/github/stars/animesao/pterodactyl-installer?style=social)](https://github.com/animesao/pterodactyl-installer)

</div>

---

## 🔗 Полезные ссылки

<div align="center">

[![📖 Документация](https://img.shields.io/badge/📖-Документация_Pterodactyl-blue?style=for-the-badge)](https://pterodactyl.io/)
[![💬 Discord](https://dsc.gg/alfheimguide)
[![🐙 GitHub Panel](https://img.shields.io/badge/🐙-Panel_GitHub-gray?style=for-the-badge&logo=github)](https://github.com/pterodactyl/panel)
[![🐙 GitHub Wings](https://img.shields.io/badge/🐙-Wings_GitHub-gray?style=for-the-badge&logo=github)](https://github.com/pterodactyl/wings)

</div>

---

<div align="center">

🦕 *Pterodactyl Complete Installer v1.0.0* 🦕

Made with ❤️ by **Animesao**

</div>

