// server/bybit.js (MEXC API)

async function fetchPrices(symbols) {
  try {
    const res = await fetch('https://api.mexc.com/api/v3/ticker/price');
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      console.error('Ошибка MEXC');
      return [];
    }
    
    const prices = [];
    for (const ticker of data) {
      const symbol = ticker.symbol;
      if (symbols.includes(symbol)) {
        prices.push({ symbol, price: parseFloat(ticker.price) });
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
