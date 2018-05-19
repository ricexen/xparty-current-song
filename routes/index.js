var express = require('express')
var router = express.Router()
var current_song_controller = require('../controllers/currentSongController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'x-party' });
});

router.get('/current-song', current_song_controller.currentSong)

module.exports = router;
