const axios = require('axios');

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '1769712870:AAGIv4YSDX2g-9mZN-vRDR8SU101HVwOgq0';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

let priceMode = false;

const mainKeybord = [
  ['Просчет по сумме заказа', 'Список сайтов', 'Как все работает'], 
['FAQ', 'Контактная информация']
];

const backKeybord = [
  ['Главное меню']
];



bot.onText(/\/start/, (msg, match) => {
 
  const chatId = msg.chat.id;
  const resp = match[1]; 
 

  bot.sendMessage(chatId, 'Выберите пункт меню', {
    reply_markup: {
      keyboard: mainKeybord, 
      resize_keyboard: true
    }
  });
});


bot.on('message', (msg) => {
  
  const chatId = msg.chat.id;
  const msgText = msg.text;

  if(priceMode && msgText != 'Главное меню'){
    const isPrice = isNaN(msgText);
    if(isPrice) return bot.sendMessage(chatId, 'Введите сумму в долларах без букв и знаков');
    
    axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
    .then(response => {
      const UAH_COURSE = response['data'].filter(exchange => exchange.ccy == 'USD')[0].sale;
      const priceInUah = msgText * UAH_COURSE;
      const ourPrice = Math.floor( priceInUah + (priceInUah * 10) / 100);
      bot.sendMessage(chatId, `${ourPrice} UAH`);
    });
    
  }
  
  if(msgText == 'Просчет по сумме заказа'){
      
    const html = `
    <strong>Введите общую сумму заказа в долларах</strong>

Ps: внимательно смотрите акции на сайтах, если есть какой либо промокод на скидку, то необходимо добавить все товары в корзину и затем применить промокод , что бы увидеть сумму заказа с учетом скидки!
    `
    bot.sendMessage(chatId, html, {
      parse_mode: 'HTML', 
      reply_markup: {
        keyboard: backKeybord, 
        resize_keyboard: true
      }
    });
    
    priceMode = true;
   

  }else if(msgText == 'Главное меню'){
    priceMode = false;
    bot.sendMessage(chatId, 'Главное меню', {
      reply_markup: {
        keyboard: mainKeybord, 
        resize_keyboard: true
      }
    });
  }
  
  

});

