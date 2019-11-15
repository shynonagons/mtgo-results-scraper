const scraper = html => {
    const $ = cheerio.load(html);
    let response = [];

    const decklists = $('.deck-group');

    const cardTypes = [
        'creature',
        'instant',
        'sorcery',
        'enchantment',
        'planeswalker',
        'artifact',
        'land',
    ];

    const cardProps = ['qty', 'name'];

    const _extractCardData = $selector => {
        return $selector
            .text()
            .split('\n\n')
            .slice(2)
            .map(card => {
                const obj = {};
                card.split('\n')
                    .map(c => c.trim())
                    .filter(c => c !== '')
                    .map((c, i) => (obj[cardProps[i]] = c));
                return obj;
            })
            .filter(c => Object.keys(c).length !== 0);
    };

    decklists &&
        decklists.each((i, el) => {
            const deck = { list: { sideboard: [] } };

            deck.owner = $('h4', $(el))
                .text()
                .split(' (')[0];

            cardTypes.forEach(type => {
                const $selector = $(`.sorted-by-${type}`, $(el));
                const typeData = _extractCardData($selector);
                if (typeData.length) deck.list[type] = typeData;
            });

            const sideboard = $('.sorted-by-sideboard-container .row', $(el));
            sideboard.each((i, sbEl) => {
                const card = {};
                card.qty = $('.card-count', $(sbEl)).text();
                card.name = $('.card-name', $(sbEl)).text();
                deck.list.sideboard.push(card);
            });
            response.push(deck);
        });
    return response;
};

module.exports = scraper;
