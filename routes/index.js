var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'X-PARTY' });
});

router.get('/current-song', function(req, res){
  res.render('current-song', {
    title: 'x-party - music',
    videoURL: 'https://www.youtube.com/embed/sEICvn4VwVg?rel=0&autoplay=1&amp;showinfo=0&vq=hd1080&mute=1'
  })
})

module.exports = router;
