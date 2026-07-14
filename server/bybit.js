// server/bybit.js (Binance API v2)

async function fetchPrices(symbols) {
  try {
    // Используем разные зеркала Binance
    const urls = [
      'https://api.binance.com/api/v3/ticker/price',
      'https://api1.binance.com/api/v3/ticker/price',
      'https://api2.binance.com/api/v3/ticker/price',
      'https://api3.binance.com/api/v3/ticker/price'
    ];
    
    let data = null;
    for (const url of urls) {
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (Array.isArray(json)) {
          data = json;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!data) {
      console.error('Все зеркала Binance недоступны');
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
    console.error('Ошибка:', e.message);
    return [];
  }
}

module.exports = { fetchPrices };
