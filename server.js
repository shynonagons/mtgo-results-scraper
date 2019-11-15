require('dotenv').config();

const express = require('express');
const request = require('request');
const fs = require('fs');
const _ = require('underscore');
const mongoose = require('mongoose');
const slack = require('./lib/slack');
const scraper = require('./lib/scraper');
const cardTypes = require('./lib/cardTypes');
const stringHash = require('./lib/stringHash');

const Results = require('./models/results');
const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/mtgo-results',
    { useNewUrlParser: true }
);

const db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const mtgoUrlBase = `https://magic.wizards.com/en/articles/archive/mtgo-standings/`;

app.get('/api/hello', (req, res) => {
    res.send({ express: 'Yankee Hotel Foxtrot' });
});

app.get('/api/scrape', async (req, res) => {
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
        const hash = stringHash(`${format}-${type}-${date}`);
        console.log(hash);
        const dbResults = await Results.findOne({ hash });
        if (dbResults) {
            console.log(`Entry found! Sending...`);
            res.send(dbResults.decklists);
            return res.end();
        }
    } catch (e) {
        console.log(e);
        console.log(`Entry not found. Going a'scraping now...`);
    }
    let url = `${mtgoUrlBase}/${format}-${type}-${date}#decklists`;
    request(url, (err, re, html) => {
        if (!err) {
            const decklists = scraper(html);
            if (decklists.length) {
                const hash = stringHash(`${format}-${type}-${date}`);
                new Results({
                    format,
                    type,
                    date,
                    decklists,
                    hash,
                }).save();
            }
            res.send(decklists);
            console.log(`${decklists.length} decks scraped!`);
            res.end();
        }
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
