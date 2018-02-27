var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

var {extract} = require('article-parser');

let url = 'https://insider.razerzone.com/index.php?threads/razer-phone-now-in-gold-edition.27528/';

extract(url).then((article) => {
    console.log(article.title);
    console.log(article.description);
    console.log(article.url);
}).catch((err) => {
    console.log(err);
});



url = 'https://insider.razerzone.com/index.php';

request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);

        var title, release, rating;
        var json = { title : "", release : "", rating : ""};
        console.log(json);
        // We'll use the unique header class as a starting point.

        $('.header').filter(function(){

       // Let's store the data we filter into a variable so we can easily see what's going on.

            var data = $(this);

       // In examining the DOM we notice that the title rests within the first child element of the header tag. 
       // Utilizing jQuery we can easily navigate and get the text by writing the following code:

            title = data.children().first().text();

       // Once we have our title, we'll store it to the our json object.

            json.title = title;
            console.log(json.title);
        })
    }
});