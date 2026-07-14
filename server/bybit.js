// server/bybit.js

async function fetchPrices(symbols) {
  try {
    const res = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
    const data = await res.json();
    if (data.retCode !== 0 || !data.result?.list) return [];
    
    const prices = [];
    for (const ticker of data.result.list) {
      const symbol = ticker.symbol;
      if (symbols.includes(symbol)) {
        prices.push({
          symbol,
          price: parseFloat(ticker.lastPrice)
        });
      }
    }
    return prices;
  } catch (e) {
    console.error('Ошибка запроса:', e.message);
    return [];
  }
}

module.exports = { fetchPrices };
