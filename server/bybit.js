// server/bybit.js

async function fetchPrices(symbols) {
  try {
    const res = await fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    const text = await res.text();
    
    // Логируем что пришло (первые 200 символов)
    console.log('Bybit ответ:', text.substring(0, 200));
    
    const data = JSON.parse(text);
    if (data.retCode !== 0 || !data.result?.list) return [];
    
    const prices = [];
    for (const ticker of data.result.list) {
      if (symbols.includes(ticker.symbol)) {
        prices.push({
          symbol: ticker.symbol,
          price: parseFloat(ticker.lastPrice)
        });
      }
    }
    return prices;
  } catch (e) {
    console.error('Ошибка:', e.message);
    return [];
  }
}

module.exports = { fetchPrices };
