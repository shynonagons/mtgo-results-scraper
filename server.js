require('dotenv').config();

const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const _ = require('underscore');
const app = express();
const port = process.env.PORT || 5000;
const slack = require('./lib/slack');
const scraper = require('./lib/scraper');

const mtgoUrlBase = `https://magic.wizards.com/en/articles/archive/mtgo-standings/`;

app.get('/api/hello', (req, res) => {
    res.send({ express: 'Yankee Hotel Foxtrot' });
});

app.get('/api/scrape', (req, res) => {
    const { date, format, type = 'league' } = req.query;
    slack.send({
        text: `
    New Scraper Search!
    format: ${format},
    type: ${type},
    date: ${date}
    `,
    });
    try {
        const jsonData = require(`./data/${format}-${type}-${date}.json`);
        if (jsonData) {
            res.send(jsonData);
            return res.end();
        }
    } catch (e) {
        console.log(`File not found. Going a'scraping now...`);
    }
    let url = `${mtgoUrlBase}/${format}-${type}-${date}#decklists`;
    request(url, (err, re, html) => {
        if (!err) {
            const response = scraper(html);
            if (response.length) {
                fs.mkdirSync('data', { recursive: true });
                fs.writeFile(
                    `./data/${format}-${type}-${date}.json`,
                    JSON.stringify(response, null, 4),
                    function(err) {
                        console.log('File successfully written!');
                    }
                );
            }
            res.send(response);
            res.end();
        }
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
