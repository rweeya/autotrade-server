// server/bybit.js (Binance API)

async function fetchPrices(symbols) {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price');
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      console.error('Binance ответ не массив:', typeof data);
      return [];
    }
    
    const prices = [];
    for (const ticker of data) {
      const symbol = ticker.symbol;
      const match = symbols.find(s => s.replace('/', '') === symbol);
      if (match) {
        prices.push({
          symbol: match,
          price: parseFloat(ticker.price)
        });
      }
    }
    console.log(`📊 Получено ${prices.length} цен`);
    return prices;
  } catch (e) {
    console.error('Ошибка Binance:', e.message);
    return [];
  }
}

module.exports = { fetchPrices };
