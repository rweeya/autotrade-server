// server/bybit.js (Bybit API)

async function fetchPrices(symbols) {
  try {
    const res = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
    const data = await res.json();
    
    if (data.retCode !== 0 || !data.result?.list) {
      console.error('Ошибка Bybit:', data.retMsg || 'нет данных');
      return [];
    }
    
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
    console.log(`📊 Получено ${prices.length} цен`);
    return prices;
  } catch (e) {
    console.error('Ошибка Bybit:', e.message);
    return [];
  }
}

module.exports = { fetchPrices };
