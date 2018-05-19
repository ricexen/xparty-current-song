const env = require('dotenv').config()
module.exports = {
  currentSong(req, res){
    var song = 'Vowels - Capital Cities'
    res.render('current-song', {
      title: 'x-party Current Song ('+song+')',
      videoURL: 'https://www.youtube.com/embed/_2DkJjBiCWY?rel=0&autoplay=1&amp;showinfo=0&vq=hd1080&mute=1'
    })
  },
  authorize(req, res){
    var url = env.SPOTIFY_AUTHORIZE_URL
    res.redirect(url)
  }
}
