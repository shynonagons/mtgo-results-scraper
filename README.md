# MTGO Results Scraper

Scrapes through MTGO 5-0 deck dumps and returns JSON data.

[Try it out](https://mtgo-results-scraper.herokuapp.com/api/scrape?date=2019-11-08&format=modern&type=league)

## Usage

`/api/scrape?date=2019-11-08&format=modern&type=league`

## Data Structure

Returns decklists from the dump in the following shape: 

```
{
  "owner": "coolguy123",
  "list": {
    "creature": [
    {
      "qty": 1,
      "name": "Birchlore Rangers"
    }
    ],
    ...,
    "sideboard": [
      {
        "qty": 1,
        "name": "Relic of Progenitus"
      }
    ]
  }
}
```

Comments, feature requests, and PRs welcome.