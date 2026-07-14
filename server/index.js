async function getSymbols() {
  try {
    const urls = [
      'https://api.binance.com/api/v3/ticker/24hr',
      'https://api1.binance.com/api/v3/ticker/24hr',
      'https://api2.binance.com/api/v3/ticker/24hr',
      'https://api3.binance.com/api/v3/ticker/24hr'
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
      console.error('Не удалось получить символы');
      return [];
    }
    
    const symbols = data
      .filter(t => t.symbol.endsWith('USDT'))
      .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
      .slice(0, 150)
      .map(t => t.symbol.replace('USDT', '/USDT'));
    
    console.log(`📊 Загружено ${symbols.length} символов`);
    return symbols;
  } catch (e) {
    console.error('Ошибка символов:', e.message);
    return [];
  }
}
