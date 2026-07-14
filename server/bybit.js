// server/bybit.js (теперь Binance API)

async function fetchPrices(symbols) {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price');
    const data = await res.json();
    
    const prices = [];
    for (const ticker of data) {
      const symbol = ticker.symbol;
      // Ищем совпадение: BTCUSDT -> BTC/USDT
      const match = symbols.find(s => s.replace('/', '') === symbol);
      if (match) {
        prices.push({
          symbol: match,
          price: parseFloat(ticker.price)
        });
      }
    }
    return prices;
  } catch (e) {
    console.error('Ошибка Binance:', e.message);
    return [];
  }
}

module.exports = { fetchPrices };
