var express = require('express')
var router = express.Router()
var current_song_controller = require('../controllers/currentSongController')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'x-party' });
});
router.get('/url', (req, res) => {
  res.send({ redirect: `${req.protocol}://${req.get('host') + req.originalUrl}` });
})

router.get('/current-song', current_song_controller.currentSong);
router.get('/auth', current_song_controller.auth);

module.exports = router;
