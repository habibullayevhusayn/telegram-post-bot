# Telegram kanal post bot

## Ishga tushirish

1. Node.js 18 yoki undan yangisini o‘rnating.
2. Terminalda loyiha papkasiga kiring va `npm install` buyrug‘ini bajaring.
3. `.env.example` faylidan nusxa olib `.env` nomli fayl yarating:

```powershell
Copy-Item .env.example .env
```

4. `.env` ichiga BotFather bergan tokenni `BOT_TOKEN=` dan keyin yozing.
5. Botni ishga tushiring:

```powershell
npm start
```

Botga kanal username yuborishdan oldin uni kanalga administrator qilib qo‘shing va barcha administrator huquqlarini yoqing. Kanal username si public bo‘lishi kerak, masalan `@my_channel`.

Ma’lumotlar `data.json` faylida saqlanadi. Tokenni HTML, Git yoki frontend kodiga yozmang. Siz yuborgan token chatga oshkor bo‘lganligi sababli BotFather’da `/revoke` orqali uni yangilang.

Caption ichidagi Telegram custom/premium emoji entity’lari saqlanadi va kanalga ham shu emoji ko‘rinishida yuboriladi. Bot API 10.3 inline tugmalar uchun `primary` (ko‘k), `success` (yashil) va `danger` (qizil) stillarini qo‘llab-quvvatlaydi. Rangli tugmalar Telegram’ning yangi versiyalarida ko‘rinadi; eski klientlarda standart ko‘rinish bo‘lishi mumkin.

Har bir yuborilgan postga avtomatik ravishda random rangli `👨‍💻 Developer` tugmasi ham qo‘shiladi va u `https://t.me/admn28` manziliga olib boradi.

`@habibullayev_28` username’li admin uchun pastki menyuda `🛠 Admin panel` ko‘rinadi. Panelda foydalanuvchilar va kanallar statistikasi, majburiy obuna kanalini sozlash hamda majburiy obunani o‘chirish mavjud. Majburiy obuna kanalida bot administrator bo‘lishi kerak.

Admin paneldagi `📣 Barchaga post yuborish` orqali rasmni ixtiyoriy qoldirib, izoh va URL tugmalar bilan barcha ro‘yxatdagi kanallarga hamda majburiy obuna kanaliga obuna bo‘lgan foydalanuvchilarga broadcast yuborish mumkin.

Birinchi `/start` paytida til tanlanadi: o‘zbek, ingliz, rus, arab, turk, xitoy, koreys yoki tojik. Tilni `/settings` buyrug‘i yoki pastki menyudagi sozlamalar tugmasi orqali o‘zgartirish mumkin.

`node-telegram-bot-api` bilan premium emoji yuborish namunasi:

```js
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN);

async function sendPremiumEmojiMessage(channelId, emojiId) {
	const text = `Developer: <tg-emoji emoji-id="${emojiId}">⭐</tg-emoji>`;
	return bot.sendMessage(channelId, text, { parse_mode: 'HTML' });
}
```

`emojiId` Telegram custom emoji’ning haqiqiy ID’si bo‘lishi kerak. `EMOJI_ID_HERE` placeholder’ini haqiqiy ID bilan almashtiring.