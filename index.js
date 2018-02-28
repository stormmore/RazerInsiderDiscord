var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var req = request('https://insider.razerzone.com/index.php?forums/razer-chroma.78/index.rss');
var feedparser = new FeedParser();
const Discord = require('discord.js');
const client = new Discord.Client();
var articles = [];

//get feed from razer
const GetRazerInsider = function(){
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
        articles.push(item);
    }
    });

    setTimeout(()=>{
        console.log(articles[0].title);
        console.log(articles[0].description);
        var guild = client.guilds.get("371593789967564802");
        var channel = guild.channels.get("399879715642408960");
        channel.send(articles[0].title);
        channel.send(articles[0].description, {"split":true});
    }, 2000);
};
//end getting feed from razer


client.on('ready', () => {
    console.log('Bot started');
    console.log("I am connected to " + client.guilds.size);
    client.user.setActivity("insider.razerzone.com", { type: 'WATCHING' });
    GetRazerInsider();
});

client.login(process.env.RazerInsiderBot);