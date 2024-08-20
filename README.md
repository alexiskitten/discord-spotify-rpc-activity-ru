# Отображение всей активности Spotify в активности Discord

В 2022 году у всех пользователей из России интеграция Spotify с Discord стала работать некорректно. Этот софт на Node.JS за счёт RPC-приложения Discord и API-приложения Spotify передаёт данные о прослушивании в активность Discord. В профиле отображаются автор, название трека, название альбома, обложка альбома, время прослушивания, мини-значок Spotify, кнопка для редиректа.

ЗДЕСЬ ФОТО

## Особенности

- **Интеграция Spotify API**: Данные из Spotify передаются за счёт созданного в [Spotify for Developers](https://developer.spotify.com) приложения.
- **Интеграция с Discord RPC**: Discord, получая данные, создает RPC активность. Обновление происходит каждую секунду.
- **Автозапуск через bat**: Также создан .bat-файл, который будет запускать программу с [pm2](https://www.npmjs.com/package/pm2) автоматически при запуске системы, чтобы скрипт работал всегда.

## Требования

- [Node.js](https://nodejs.org) (v14 и выше)
- Аккаунт Spotify
- Аккаунт Discord

## Установка

1. Клонируйте этот репозиторий:
   
     ```bash
    git clone https://github.com/alexiskitten/discord-spotify-rpc-activity-ru.git
    cd discord-spotify-rpc-activity-ru
    ```
     
2. Установите зависимости:
   
     ```bash
     npm install discord-rpc spotify-web-api-node express fs open
    ```
     
     Отдельный список:
  - [express](https://www.npmjs.com/package/discord-rpc)
  - [spotify-web-api-node](https://www.npmjs.com/package/spotify-web-api-node)
  - [discord-rpc](https://www.npmjs.com/package/express)
  - [puppeteer](https://www.npmjs.com/package/fs)
  - [open](https://www.npmjs.com/package/open)

4. Создайте приложение в [Discord Developer Portal](https://discord.com/developers/applications). Назовите приложение «Spotify». В «App Icon», «Cover Image», Rich Presence Assets (Rich Presence --> Art Assets) установите иконку Spotify для корректного отображения в активности. В разделе OAuth2 скопируйте «CLIENT ID».

5. Создайте приложение в [Spotify for Developers](https://developer.spotify.com/dashboard). Назовите приложение, напишите описание. В «Redirect URIs» укажите «[https://localhost:8888/callback](https://localhost:8888/callback)» (без кавычек). Ниже поставьте галочки у «Web API» и «Web Playback SDK». После создания приложения в «Settings» скопируйте «Client ID» и «Client secret».

6. В файле ds.js вставьте в соответствующие строки ранее скопированные данные.
   
   ```javascript
   const discordClientId = 'YOUR_DISCORD_APP_CLIENTID';
   const spotifyClientId = 'YOUR_SPOTIFY_APP_CLIENTID';
   const spotifyClientSecret = 'YOUR_SPOTIFY_APP_CLIENTSECRET';
   ```
7. Запустите cmd в папке с файлами (или через перейдите туда через cd) и запустите код.

   ```bash
   node ds.js
   ```
   
8. Далее авторизуйтесь в ваш аккаунт Spotify по сгенерированной ссылке в окне, которое откроется автоматически, для получения токена. Токен Spotify API обновляется каждые 30 минут.

  **Готово!**

## Установка автозапуска

1. Откройте start.bat в блокноте. Измените значение «/ЗДЕСЬ УКАЖИТЕ ПУТЬ/» на путь к файлу ds.js.
2. В cmd установите [pm2](https://www.npmjs.com/package/pm2).

   ```bash
   npm install pm2
   ```
3. Откройте системный «Планировщик заданий». Создайте задачу, дайте ей имя. Создайте триггер в разделе «Триггеры», выберите «Начать задачу: при запуске» и поставьте «Включено». В разделе «Действия» выберите «Запуск программы» и укажите путь к файлу start.bat. Сохраните задачу.

**Готово! Теперь скрипт будет автоматически запускаться при запуске системы.**
   
## Лицензия
Этот проект распространяется под лицензией MIT. Подробнее см. в файле **[LICENSE](LICENSE)**.

## Контакты
Все контакты указаны в **[профиле](https://github.com/alexiskitten)**.
