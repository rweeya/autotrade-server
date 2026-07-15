// server/bybit.js (Binance API)

async function fetchPrices(symbols) {
  const urls = [
    'https://api.binance.com/api/v3/ticker/price',
    'https://api1.binance.com/api/v3/ticker/price',
    'https://api2.binance.com/api/v3/ticker/price',
    'https://api3.binance.com/api/v3/ticker/price',
  ];
  
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data)) continue;
      
      const prices = [];
      for (const ticker of data) {
        const match = symbols.find(s => s.replace('/', '') === ticker.symbol);
        if (match) {
          prices.push({ symbol: match, price: parseFloat(ticker.price) });
        }
      }
      console.log(`📊 Получено ${prices.length} цен`);
      return prices;
    } catch (e) {
      continue;
    }
  }
  console.error('Все зеркала Binance недоступны');
  return [];
}

module.exports = { fetchPrices };
