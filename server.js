const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const _ = require("underscore");
const app = express();
const port = process.env.PORT || 5000;

const mtgoUrlBase = `https://magic.wizards.com/en/articles/archive/mtgo-standings/`;

app.get("/api/hello", (req, res) => {
  res.send({ express: "Yankee Hotel Foxtrot" });
});

app.get("/api/scrape", (req, res) => {
  const { date, format, type = "league" } = req.query;
  try {
    const jsonData = require(`./data/${format}-${type}-${date}.json`);
    if (jsonData) {
      res.send(jsonData);
      return res.end();
    }
  } catch(e) {
    console.log(`File not found. Heading to scrapertown...`)
  }
  let url = `${mtgoUrlBase}/${format}-${type}-${date}#decklists`;
  request(url, (err, re, html) => {
    if (!err) {
      const $ = cheerio.load(html);
      let response = [];

      const decklists = $(".deck-group");

      const cardTypes = [
        "creature",
        "instant",
        "sorcery",
        "enchantment",
        "planeswalker",
        "artifact",
        "land"
      ];

      const cardProps = ["qty", "name"];

      const _extractCardData = $selector => {
        return $selector
          .text()
          .split("\n\n")
          .slice(2)
          .map(card => {
            const obj = {};
            card
              .split("\n")
              .map(c => c.trim())
              .filter(c => c !== "")
              .map((c, i) => (obj[cardProps[i]] = c));
            return obj;
          })
          .filter(c => Object.keys(c).length !== 0);
      };

      decklists &&
        decklists.each((i, el) => {
          const deck = { list: { sideboard: [] } };

          deck.owner = $("h4", $(el))
            .text()
            .split(" (")[0];

          cardTypes.forEach(type => {
            const $selector = $(`.sorted-by-${type}`, $(el));
            const typeData = _extractCardData($selector);
            if (typeData.length) deck.list[type] = typeData;
          });

          const sideboard = $(".sorted-by-sideboard-container .row", $(el));
          sideboard.each((i, sbEl) => {
            const card = {};
            card.qty = $(".card-count", $(sbEl)).text();
            card.name = $(".card-name", $(sbEl)).text();
            deck.list.sideboard.push(card);
          });
          response.push(deck);
        });
      if (response.length)
        fs.writeFile(
          `./data/${format}-${type}-${date}.json`,
          JSON.stringify(response, null, 4),
          function(err) {
            console.log("File successfully written!");
          }
        );
      res.send(response);
      res.end();
    }
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
