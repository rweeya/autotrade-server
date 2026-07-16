// server/index.js
const { fetchPrices } = require('./bybit');
const { generateSignal } = require('./signals');

const CONFIG = {
  RSI_BUY: 30, RSI_SELL: 70,
  STOCH_BUY: 20, STOCH_SELL: 80,
  ADX_MIN: 25,
  TP_PERCENT: 2.0, SL_PERCENT: 0.5,
  MAX_POSITIONS: 10,
  COOLDOWN: 120000,
  RISK_PERCENT: 3
};

const priceHistory = new Map();
const prices = new Map();
const lastSignalTime = new Map();
const lastTradeTime = new Map();
const openTrades = [];

async function getSymbols() {
  try {
    const res = await fetch('https://api.mexc.com/api/v3/ticker/24hr');
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      console.error('Ошибка MEXC: ответ не массив');
      return [];
    }
    
    const symbols = data
      .filter(t => t.symbol.endsWith('USDT'))
      .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
      .slice(0, 150)
      .map(t => t.symbol);
    
    console.log(`📊 Загружено ${symbols.length} символов`);
    return symbols;
  } catch (e) {
    console.error('Ошибка символов:', e.message);
    return [];
  }
}

function updatePrice(symbol, price) {
  prices.set(symbol, price);
  let history = priceHistory.get(symbol) || [];
  history.push(price);
  if (history.length > 200) history = history.slice(-200);
  priceHistory.set(symbol, history);
  
  if (history.length >= 60) {
    const signal = generateSignal(symbol, price, history, CONFIG, lastSignalTime);
    if (signal) {
      console.log(`🎯 СИГНАЛ: ${signal.action.toUpperCase()} ${symbol} @ ${price}`);
      executeTrade(signal);
    }
  }
}

function executeTrade(signal) {
  if (openTrades.length >= CONFIG.MAX_POSITIONS) return;
  if (openTrades.find(t => t.symbol === signal.symbol)) return;
  const lastTrade = lastTradeTime.get(signal.symbol);
  if (lastTrade && Date.now() - lastTrade < CONFIG.COOLDOWN) return;
  
  const tp = signal.action === 'buy' ? signal.price * (1 + CONFIG.TP_PERCENT / 100) : signal.price * (1 - CONFIG.TP_PERCENT / 100);
  const sl = signal.action === 'buy' ? signal.price * (1 - CONFIG.SL_PERCENT / 100) : signal.price * (1 + CONFIG.SL_PERCENT / 100);
  
  lastTradeTime.set(signal.symbol, Date.now());
  openTrades.push({
    id: `${signal.symbol}_${Date.now()}`,
    symbol: signal.symbol,
    side: signal.action,
    entryPrice: signal.price,
    quantity: 1,
    invested: signal.price,
    tpPrice: tp,
    slPrice: sl,
    entryTime: Date.now(),
    breakevenActivated: false
  });
  console.log(`✅ СДЕЛКА: ${signal.action.toUpperCase()} ${signal.symbol} | TP: ${tp} | SL: ${sl}`);
}

function checkTPSL() {
  for (let i = openTrades.length - 1; i >= 0; i--) {
    const t = openTrades[i];
    const cp = prices.get(t.symbol);
    if (!cp) continue;
    
    let shouldClose = false;
    let reason = '';
    
    if (t.side === 'buy') {
      if (cp >= t.tpPrice) { shouldClose = true; reason = 'TP'; }
      else if (cp <= t.slPrice) { shouldClose = true; reason = 'SL'; }
      else if (!t.breakevenActivated && cp >= t.entryPrice * 1.01) {
        t.slPrice = t.entryPrice;
        t.breakevenActivated = true;
        console.log(`🔒 Безубыток: ${t.symbol}`);
      }
    } else {
      if (cp <= t.tpPrice) { shouldClose = true; reason = 'TP'; }
      else if (cp >= t.slPrice) { shouldClose = true; reason = 'SL'; }
      else if (!t.breakevenActivated && cp <= t.entryPrice * 0.99) {
        t.slPrice = t.entryPrice;
        t.breakevenActivated = true;
        console.log(`🔒 Безубыток: ${t.symbol}`);
      }
    }
    
    if (shouldClose) {
      const pnl = t.side === 'buy' ? (cp - t.entryPrice) * t.quantity : (t.entryPrice - cp) * t.quantity;
      console.log(`📉 ЗАКРЫТА: ${t.symbol} | ${reason} | PnL: ${pnl.toFixed(2)}`);
      openTrades.splice(i, 1);
    }
  }
}

const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({
    status: 'online',
    symbols: prices.size,
    trades: openTrades.length,
    openTrades: openTrades
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Сервер на порту ${PORT}`);
});

(async () => {
  const symbols = await getSymbols();
  
  setInterval(async () => {
    const tickers = await fetchPrices(symbols);
    for (const t of tickers) {
      updatePrice(t.symbol, t.price);
    }
  }, 2000);
  
  setInterval(checkTPSL, 5000);
  console.log('🤖 Сервер готов 24/7');
})();
