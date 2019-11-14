import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [decklists, setDecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    callApi()
      .then(res => setDecklists(res))
      .catch(err => console.log(err));
  }, []);

  const countQty = arr => arr.map(c => c.qty).reduce((a, c) => a + +c, 0);

  const callApi = async () => {
    setLoading(true);
    const response = await fetch(
      "/api/scrape?date=2019-11-08&format=modern&type=league"
    );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    setLoading(false);
    return body;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">MTGO Results Scraper</h1>
      </header>
      {loading && <h1>Loading...</h1>}
      <div>
        {decklists.map((deck, i) => (
          <div key={i}>
            <h4>{deck.owner}</h4>
            {Object.entries(deck.list).map(entry => (
              <p>
                {entry[0]} ({countQty(entry[1])})
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
