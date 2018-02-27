var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

var req = request('https://insider.razerzone.com/index.php?forums/index.rss')
var feedparser = new FeedParser();

req.on('error', function (error) {
  // handle any request errors
  console.log(error);
});

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
  // TODO: handle errors
  console.log(error);
});

feedparser.on('readable', function () {
  var stream = this;
  var meta = this.meta;
  var item;
  while (item = stream.read()) {
    console.log(item);
  }
});