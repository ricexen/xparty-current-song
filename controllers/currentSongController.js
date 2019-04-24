const request = require('request');
const axios = require('axios');
const googleapis = require('googleapis');
const connection = require('../config/connection');

const searchTerm = (currentSong) => {
  const { artist, song } = currentSong;
  return `${artist} ${song} music video official`;
}

const currentSong = (access_token) => {
  const url = 'https://api.spotify.com/v1/me/player/currently-playing';
  return new Promise((resolve, reject) => {
    request({
      url,
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }, (error, response, body) => {
      if (error) reject(error);
      else if (!body) reject({ currentSong: 'Nothing Playing' });
      else {
        const json = JSON.parse(body);
        const { item: { name: song, artists: [{ name: artist }] } } = json;
        let { progress_ms: progress } = json;
        progress = Number(Math.floor(progress / 1000).toFixed(0)) + 1;
        resolve({ song, artist, full: `${artist} - ${song}`, progress });
      }
    });
  })
}

const YoutubeVideoSearch = (currentSong) => {
  const part = searchTerm(currentSong);
  const { key } = connection.youtube;
  const url = `https://www.googleapis.com/youtube/v3/search?key=${key}&part=snippet&q=${encodeURIComponent(part)}`;
  return new Promise((resolve, reject) => {
    request.get(url, {}, (error, response, body) => {
      const json = JSON.parse(body);
      if (error || response.statusCode !== 200) reject(json);
      else resolve(json);
    });
  })
}

const objectToRawParams = (object) => {
  return Object.keys(object)
    .map(key => [key, object[key]])
    .map(param => `${param[0]}=${encodeURI(param[1])}`)
    .join('&');
}

module.exports = {
  currentSong(req, res) {
    const { code, spotify_access_token } = req.query;
    if (!spotify_access_token && !code) {
      res.redirect('/auth');
    } else if (code) {
      const credentials = `${connection.spotify.id}:${connection.spotify.secret}`;
      request.post(
        'https://accounts.spotify.com/api/token', {
          form: {
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://localhost:3000/auth'
          },
          headers: {
            Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`
          }
        },
        (error, response, body) => {
          const { access_token } = JSON.parse(body);
          if (!access_token) res.redirect('/auth');
          else {
            const params = objectToRawParams({ spotify_access_token: access_token });
            res.redirect(`/current-song?${params}`);
          }
        }
      );
    } else if (spotify_access_token) {
      currentSong(spotify_access_token)
        .then(song => {
          YoutubeVideoSearch(song)
            .then(result => {
              const items = result.items.filter(item => item.id.kind.includes('video'));
              const [{ id: { videoId } }] = items;
              res.render('current-song', {
                title: song.full,
                videoURL: `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&amp;showinfo=0&vq=hd1080&mute=1&start=${song.progress}`
              });
            })
            .catch(error => res.redirect('/auth'));
        })
        .catch(error => res.render('current-song', {
          title: error.currentSong,
          videoURL: `https://www.youtube.com/embed/`
        }));
    } else {
      res.redirect('/auth');
    }
  },

  auth(req, res) {
    const { code } = req.query;
    if (!code) {
      const { id: client_id, scopes, secret: client_secret } = connection.spotify;
      const params = {
        client_id,
        scope: scopes.join(' '),
        client_secret,
        response_type: 'code',
        redirect_uri: 'http://localhost:3000/auth'
      };
      const redirect = `https://accounts.spotify.com/authorize?${objectToRawParams(params)}`;
      res.render('auth', { redirect });
    } else {
      res.redirect(`/current-song?code=${code}`);
    }
  }
}
