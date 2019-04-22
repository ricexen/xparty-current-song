require('dotenv').config();
module.exports = {
    youtube: {
        key: process.env.YOUTUBE_API_KEY,
    },
    spotify: {
        id: process.env.SPOTIFY_CLIENT_ID,
        secret: process.env.SPOTIFY_CLIENT_SECRET,
        scopes: ['user-read-currently-playing'],
    }
};