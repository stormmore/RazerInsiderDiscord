const request = require('request');
const Discord = require('discord.js');
const TurndownService = require('turndown');
const cheerio = require('cheerio');

// TEST DISCORD
// const GUILD = "411239555421962240";
// const CHANNEL = "411239555421962243";

// RAZER DISCORD
const GUILD = "342761229544194048";
const CHANNEL = "416027296881704970";

const HOST = "https://insider.razerzone.com/";
const THREADURL = "https://insider.razerzone.com/index.php?forums/razer-chroma.78/&order=post_date";


/**
* @param context {WebtaskContext}
*/
module.exports = (context, cb) => {
    const client = new Discord.Client();
    const turndownService = new TurndownService();

    client.on('ready', () => {
        client.user.setActivity("insider.razerzone.com", { type: "WATCHING" });
        GetRazerInsider();
    });

    // Read the token from the webtask context/secret
    client.login(context.data.botToken);

    async function GetRazerInsider(){
        const url = THREADURL;
        request(url, async (error, response, html) => {
            if (!error && response.statusCode == 200) {
                await handleRazerInsiderResponse(html);
            }
        });
    };

    async function handleRazerInsiderResponse(html) {
        var $ = cheerio.load(html);
        // Get the ID of the last processed item
        let store = await getStore();

        var articles = [];

        // Get all discussionListItems from HTML
        var items = $(".discussionListItems li");
        items.each((key, item) => {
            var article = {};
            // Parse HTML and create the article
            article.posterImage = $(item).find(".avatar img").first().attr("src");
            article.poster = $(item).find(".avatar img").first().attr("alt");
            article.id = parseInt($(item).attr("id").replace("thread-",""));
            article.title = $(item).find(".main .titleText .title a").text();
            article.dateOriginal = $(item).find(".main .titleText .secondRow .posterDate .startDate .DateTime").text();
            article.date = new Date($(item).find(".main .titleText .secondRow .posterDate .startDate .DateTime").text().replace("at ",""));
            article.url = HOST + $(item).find(".main .titleText .title a").attr("href");
            article.previewurl = HOST + $(item).find(".main .titleText .title a").data("previewurl");
            // If we already processed the item then we're done with all new items
            if(article.id <= store.last) return false;
            articles.push(article);
        });

        if(articles.length <= 0) {
            // The task is done.
            cb(null, "");
            return;
        }

        // Request the Preview for the item
        let promises = [];
        for(let article of articles) {
            let art = article;
            let promise = getPreviewText(art.previewurl).then((res) => { art.data = res; });
            promises.push(promise);
        }
        try {
            // Wait for all requests to finish.
            await Promise.all(promises);
            store.last = articles[0].id;

            // Save last id to store
            await setStore(store);

            // Finally send all Articles we got
            for(const article of articles) {
                sendArticle(article);
            }

            // The task is done.
            cb(null, articles);
        } catch (ex) {
            cb(ex);
        }
    }

    function getPreviewText(url) {
        return new Promise((res, rej) => {
            request(url + "&_xfResponseType=json", async function (error, response, html) {
                if (error || response.statusCode !== 200) return rej(error);
                let result = JSON.parse(response.body);
                let $ = cheerio.load(result.templateHtml);
                result = $(".previewText").html();
                res({markdown: turndownService.turndown(result), html: result});
            });
        });
    }
    
    function sendArticle(article) {
        var guild = client.guilds.get(GUILD);
        var channel = guild.channels.get(CHANNEL);
        const message = {embed: {
            color: 3447003,
            author: {
                name: article.poster,
                icon_url: article.posterImage
            },
            title: article.title,
            url: article.url,
            description: article.data.markdown.replace("\\[MEDIA\\]","").replace("\\[ATTACH\\]",""),
            timestamp: article.date,
            footer: {
                icon_url: article.posterImage,
                text: "Posted on Insider"
            }
        }};
        channel.send(message);
    }

    function getStore() {
        return new Promise((res, rej) => {
            context.storage.get(function(error, data) {
                if (error) return rej(error);
                data = data || { last: 0 };
                res(data);
            });
        });
    }

    function setStore(data) {
        return new Promise((res, rej) => {
            context.storage.set(data, function (error) {
                if(error) rej(error);
                res();
            });
        });
    }
};
