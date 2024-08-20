const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const DiscordRPC = require('discord-rpc');
const fs = require('fs');

const app = express();
const port = 8888;

// Заполните 3 поля ниже
const discordClientId = 'YOUR_DISCORD_APP_CLIENTID';
const spotifyClientId = 'YOUR_SPOTIFY_APP_CLIENTID';
const spotifyClientSecret = 'YOUR_SPOTIFY_APP_CLIENTSECRET';
const redirectUri = 'http://localhost:8888/callback';

const scopes = ['user-read-playback-state', 'user-read-currently-playing'];

let accessToken = null;
let refreshToken = null;

const spotifyApi = new SpotifyWebApi({
  clientId: spotifyClientId,
  clientSecret: spotifyClientSecret,
  redirectUri: redirectUri,
});

// Путь для сохранения токенов
const tokensPath = 'tokens.json';

function loadTokens() {
  if (fs.existsSync(tokensPath)) {
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);
    console.log('Токены были загружены');
    return true;
  }
  return false;
}

function saveTokens(accessToken, refreshToken) {
  const tokens = {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
  console.log('Токены были сохранены');
}

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
DiscordRPC.register(discordClientId);

async function setActivity(track, progressMs, durationMs) {
  const progressMinutes = Math.floor(progressMs / 60000);
  const progressSeconds = Math.floor((progressMs % 60000) / 1000).toString().padStart(2, '0');

  rpc.setActivity({
    type: 2,
    details: `Слушает: ${track.name}`,
    state: `Автор: ${track.artists.map(artist => artist.name).join(', ')}`,
    largeImageKey: track.album.images[0].url,
    largeImageText: track.album.name,
    smallImageKey: 'spotify',
    smallImageText: 'Spotify',
    instance: false,
    startTimestamp: Date.now() - progressMs,
    buttons: [
      { label: 'Слушать в Spotify', url: track.external_urls.spotify },
      { label: 'Хочу активность', url: 'https://github.com/alexiskitten/discord-spotify-rpc-activity-ru' }
    ]
  });

  console.log(`Проиграно: ${progressMinutes}:${progressSeconds}`);
}

async function updateActivity() {
  if (!accessToken) {
    console.error('Отсутствует токен доступа. Авторизуйтесь через /login.');
    return;
  }

  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();

    if (data.body && data.body.is_playing && data.body.item) {
      const track = data.body.item;
      const progressMs = data.body.progress_ms;
      const durationMs = track.duration_ms;

      await setActivity(track, progressMs, durationMs);
    } else {
      rpc.clearActivity();
    }
  } catch (error) {
    console.error('Ошибка при получении текущего трека:', error);
  }
}

// Обновляем активность каждую секунду
setInterval(updateActivity, 1000);

// Discord RPC ready
rpc.on('ready', () => {
  console.log('Discord RPC активен!');
  updateActivity();
});

// Вход через Spotify
app.get('/login', (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  console.log(`Перейдите по следующему URL для авторизации: ${authorizeURL}`);
  res.send('Перейдите по следующему URL для авторизации: ' + authorizeURL);
});

// Callback для получения токена
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    accessToken = data.body.access_token;
    refreshToken = data.body.refresh_token;

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    saveTokens(accessToken, refreshToken);

    res.send('Авторизация прошла успешно! Можете закрыть это окно.');
    console.log('Токены успешно получены!');
  } catch (err) {
    console.error('Ошибка авторизации:', err);
    res.send('Ошибка авторизации!');
  }
});

// Обновляем токен каждые 30 минут
setInterval(async () => {
  if (refreshToken) {
    try {
      const data = await spotifyApi.refreshAccessToken();
      accessToken = data.body.access_token;
      spotifyApi.setAccessToken(accessToken);
      saveTokens(accessToken, refreshToken);
      console.log('Токен обновлен!');
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
    }
  }
}, 1800000); // 30 минут

// Запускаем сервер
app.listen(port, async () => {
  console.log(`Сервер запущен на порту ${port}`);

  if (!loadTokens()) {
    console.log('Токены не найдены. Выполните авторизацию.');
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    console.log(`Перейдите по следующему URL для авторизации: ${authorizeURL}`);
    
    // Открываем URL в браузере
    const { default: open } = await import('open');
    open(authorizeURL);
  }
});

// Авторизуемся в Discord
rpc.login({ clientId: discordClientId }).catch(console.error);
