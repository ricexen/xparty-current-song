const request = require('request');
const axios = require('axios');
const connection = require('../config/connection');

const searchTerm = (currentSong) => {
  const { artist, songName } = currentSong;
  return `${artist} ${artist} music video official animation`;
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
      else {
        const { item: { name: song, artists: [{ name: artist }] } } = JSON.parse(body);
        resolve({ song, artist, full: `${artist} - ${song}` });
      }
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
    const { code } = req.query;
    if (!code) {
      res.redirect('/auth');
    } else {
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
            currentSong(access_token).then(song => {
              res.render('current-song', {
                title: song.full,
                videoURL: 'https://www.youtube.com/embed/_2DkJjBiCWY?rel=0&autoplay=1&amp;showinfo=0&vq=hd1080&mute=1'
              });
            });
          }
        }
      );
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
