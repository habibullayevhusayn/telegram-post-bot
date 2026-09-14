require('dotenv').config();
const express = require('express');
const app = express();
const port = Number(process.env.PORT) || 3000;

app.get('/', (req, res) => res.send('Bot ishlamoqda...'));
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

app.listen(port, '0.0.0.0', () => {
  console.log(`Express server ${port} portda ishlayapti.`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Telegraf, Markup, session } = require('telegraf');

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN is missing. Copy .env.example to .env and add the token.');
}

const bot = new Telegraf(token);
const localDataPath = path.join(__dirname, 'data.json');
const renderDiskDataPath = '/opt/render/project/src/data/data.json';
const dataPath = fs.existsSync(renderDiskDataPath) ? renderDiskDataPath : localDataPath;
fs.mkdirSync(path.dirname(dataPath), { recursive: true });
const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : { users: {} };
data.users ||= {};
data.settings ||= {};
data.settings.requiredChannels ||= [];
if (data.settings.requiredChannel && !Array.isArray(data.settings.requiredChannels)) {
  data.settings.requiredChannels = [data.settings.requiredChannel];
}
if (data.settings.requiredChannel && Array.isArray(data.settings.requiredChannels)) {
  data.settings.requiredChannels.unshift(data.settings.requiredChannel);
  delete data.settings.requiredChannel;
}
if (!Array.isArray(data.settings.requiredChannels)) data.settings.requiredChannels = [];
const ADMIN_USERNAME = 'habibullayev_28';
const ADMIN_PUBLIC_USERNAME = '@habibullayev_28';
const languages = {
  uz: 'O\'zbekcha', en: 'English', ru: 'Русский', ar: 'العربية',
  tr: 'Türkçe', zh: '中文', ko: '한국어', tg: 'Тоҷикӣ'
};
const text = {
  welcome: { uz: 'Tilni tanlang:', en: 'Choose your language:', ru: 'Выберите язык:', ar: 'اختر لغتك:', tr: 'Dilinizi seçin:', zh: '请选择语言：', ko: '언어를 선택하세요:', tg: 'Забонро интихоб кунед:' },
  channels: { uz: '📢 Kanallar ro\'yxati', en: '📢 Channel list', ru: '📢 Список каналов', ar: '📢 قائمة القنوات', tr: '📢 Kanal listesi', zh: '📢 频道列表', ko: '📢 채널 목록', tg: '📢 Рӯйхати каналҳо' },
  addChannel: { uz: '➕ Kanal qo\'shish', en: '➕ Add channel', ru: '➕ Добавить канал', ar: '➕ إضافة قناة', tr: '➕ Kanal ekle', zh: '➕ 添加频道', ko: '➕ 채널 추가', tg: '➕ Иловаи канал' },
  settings: { uz: '⚙️ Sozlamalar', en: '⚙️ Settings', ru: '⚙️ Настройки', ar: '⚙️ الإعدادات', tr: '⚙️ Ayarlar', zh: '⚙️ 设置', ko: '⚙️ 설정', tg: '⚙️ Танзимот' },
  admin: { uz: '🛠 Admin panel', en: '🛠 Admin panel', ru: '🛠 Панель администратора', ar: '🛠 لوحة المشرف', tr: '🛠 Yönetici paneli', zh: '🛠 管理员面板', ko: '🛠 관리자 패널', tg: '🛠 Панели админ' },
  languageSaved: { uz: '✅ Til saqlandi.', en: '✅ Language saved.', ru: '✅ Язык сохранён.', ar: '✅ تم حفظ اللغة.', tr: '✅ Dil kaydedildi.', zh: '✅ 语言已保存。', ko: '✅ 언어가 저장되었습니다.', tg: '✅ Забон нигоҳ дошта шуд.' },
  createPost: { uz: '📨 Post yuborish', en: '📨 Create Post', ru: '📨 Создать пост', ar: '📨 إنشاء منشور', tr: '📨 Gönderi oluştur', zh: '📨 创建帖子', ko: '📨 게시물 만들기', tg: '📨 Эҷоди пост' },
  videoSave: { uz: '🎬 Video saqlash', en: '🎬 Save video', ru: '🎬 Сохранить видео', ar: '🎬 حفظ فيديو', tr: '🎬 Video kaydet', zh: '🎬 保存视频', ko: '🎬 영상 저장', tg: '🎬 Сабти видео' }
};
const replyTranslations = {
  en: {
    'Ruxsat yo\'q.': 'Access denied.', 'Kanal topilmadi.': 'Channel not found.', 'Post uchun rasm yuboring.': 'Send a photo for the post.',
    'Tugma matnini yuboring:': 'Send the button text:', 'Tugma rangini tanlang:': 'Choose the button color:',
    'Amal bekor qilindi.': 'Action cancelled.', 'Kanalni tanlang:': 'Choose a channel:',
    'Kanal username sini yuboring, masalan: @my_channel': 'Send the channel username, for example: @my_channel',
    'Izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:': 'Caption saved. You can add URL buttons:',
    'Post tayyor. Havolali tugmalar qo\'shishingiz mumkin:': 'Post ready. You can add URL buttons:',
    'Tugma rangini tanlang:': 'Choose the button color:',
    'Havola http:// yoki https:// bilan boshlanishi kerak. Qayta yuboring:': 'The URL must start with http:// or https://. Send it again:',
    'Kerakli amalni pastki menyudan tanlang.': 'Choose an action from the menu.',
    'Broadcast boshlanmagan.': 'Broadcast has not started.', 'Broadcast izohini yuboring:': 'Send the broadcast caption:',
    'Rasm saqlandi. Broadcast izohini yuboring:': 'Photo saved. Send the broadcast caption:',
    'Post ma\'lumotlari topilmadi.': 'Post data was not found.', 'Broadcast mazmuni topilmadi.': 'Broadcast content was not found.',
    'Texnik xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.': 'A technical error occurred. Try again later.',
    'Assalomu alaykum! Kanal postlarini boshqarish botiga xush kelibsiz.': 'Welcome to the channel post management bot.',
    'Rasm va izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:': 'Photo and caption saved. You can add URL buttons:',
    'Endi post izohini yuboring yoki «Izohsiz» tugmasini bosing.': 'Send the post caption or press “No caption”.',
    'Avval post yaratishni boshlang.': 'Start creating a post first.', 'Tugma ma\'lumotlari topilmadi. Qaytadan boshlang.': 'Button data was not found. Start again.',
    'Rangli tugma qo\'shildi. Yana tugma qo\'shasizmi yoki postni yuboramizmi?': 'Colored button added. Add another button or publish the post?',
    'Majburiy obuna kanalining public username sini yuboring, masalan: @my_channel': 'Send the required subscription channel username, for example: @my_channel',
    'Broadcast uchun rasm yuboring yoki «Rasmsiz» tugmasini bosing.': 'Send a broadcast photo or press “Without photo”.',
    'Tugma havolasini yuboring (https://...):': 'Send the button URL (https://...):', 'Rasm va izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:': 'Photo and caption saved. You can add URL buttons:'
  },
  ru: {
    'Ruxsat yo\'q.': 'Нет доступа.', 'Kanal topilmadi.': 'Канал не найден.', 'Post uchun rasm yuboring.': 'Отправьте фото для поста.',
    'Tugma matnini yuboring:': 'Отправьте текст кнопки:', 'Tugma rangini tanlang:': 'Выберите цвет кнопки:', 'Amal bekor qilindi.': 'Действие отменено.',
    'Kanalni tanlang:': 'Выберите канал:', 'Kanal username sini yuboring, masalan: @my_channel': 'Отправьте username канала, например: @my_channel',
    'Izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:': 'Подпись сохранена. Можно добавить URL-кнопки:', 'Post tayyor. Havolali tugmalar qo\'shishingiz mumkin:': 'Пост готов. Можно добавить URL-кнопки:',
    'Havola http:// yoki https:// bilan boshlanishi kerak. Qayta yuboring:': 'Ссылка должна начинаться с http:// или https://. Отправьте ещё раз:', 'Kerakli amalni pastki menyudan tanlang.': 'Выберите действие в меню.',
    'Broadcast boshlanmagan.': 'Рассылка не начата.', 'Broadcast izohini yuboring:': 'Отправьте подпись рассылки:', 'Rasm saqlandi. Broadcast izohini yuboring:': 'Фото сохранено. Отправьте подпись рассылки:',
    'Post ma\'lumotlari topilmadi.': 'Данные поста не найдены.', 'Broadcast mazmuni topilmadi.': 'Содержимое рассылки не найдено.', 'Texnik xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.': 'Произошла техническая ошибка. Попробуйте позже.',
    'Assalomu alaykum! Kanal postlarini boshqarish botiga xush kelibsiz.': 'Добро пожаловать в бот управления постами каналов.', 'Rasm va izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:': 'Фото и подпись сохранены. Можно добавить URL-кнопки:', 'Endi post izohini yuboring yoki «Izohsiz» tugmasini bosing.': 'Отправьте подпись поста или нажмите «Без подписи».', 'Avval post yaratishni boshlang.': 'Сначала начните создание поста.', 'Tugma ma\'lumotlari topilmadi. Qaytadan boshlang.': 'Данные кнопки не найдены. Начните заново.', 'Rangli tugma qo\'shildi. Yana tugma qo\'shasizmi yoki postni yuboramizmi?': 'Цветная кнопка добавлена. Добавить ещё или отправить пост?', 'Majburiy obuna kanalining public username sini yuboring, masalan: @my_channel': 'Отправьте username канала обязательной подписки, например: @my_channel', 'Broadcast uchun rasm yuboring yoki «Rasmsiz» tugmasini bosing.': 'Отправьте фото рассылки или нажмите «Без фото».', 'Tugma havolasini yuboring (https://...):': 'Отправьте URL кнопки (https://...):'
  },
  tr: {
    'Ruxsat yo\'q.': 'Erişim yok.', 'Kanal topilmadi.': 'Kanal bulunamadı.', 'Post uchun rasm yuboring.': 'Gönderi için fotoğraf gönderin.', 'Tugma matnini yuboring:': 'Buton metnini gönderin:', 'Tugma rangini tanlang:': 'Buton rengini seçin:', 'Amal bekor qilindi.': 'İşlem iptal edildi.', 'Kanalni tanlang:': 'Bir kanal seçin:', 'Kerakli amalni pastki menyudan tanlang.': 'Menüden bir işlem seçin:', 'Broadcast izohini yuboring:': 'Yayın açıklamasını gönderin:', 'Post ma\'lumotlari topilmadi.': 'Gönderi bilgileri bulunamadı.'
  },
  ar: { 'Ruxsat yo\'q.': 'لا يوجد صلاحية.', 'Kanal topilmadi.': 'لم يتم العثور على القناة.', 'Post uchun rasm yuboring.': 'أرسل صورة للمنشور.', 'Amal bekor qilindi.': 'تم إلغاء العملية.', 'Kanalni tanlang:': 'اختر قناة:', 'Tugma matnini yuboring:': 'أرسل نص الزر:', 'Tugma rangini tanlang:': 'اختر لون الزر:' },
  zh: { 'Ruxsat yo\'q.': '无权限。', 'Kanal topilmadi.': '未找到频道。', 'Post uchun rasm yuboring.': '请发送帖子图片。', 'Amal bekor qilindi.': '操作已取消。', 'Kanalni tanlang:': '请选择频道：', 'Tugma matnini yuboring:': '请发送按钮文字：', 'Tugma rangini tanlang:': '请选择按钮颜色：' },
  ko: { 'Ruxsat yo\'q.': '권한이 없습니다.', 'Kanal topilmadi.': '채널을 찾을 수 없습니다.', 'Post uchun rasm yuboring.': '게시물 사진을 보내세요.', 'Amal bekor qilindi.': '작업이 취소되었습니다.', 'Kanalni tanlang:': '채널을 선택하세요:', 'Tugma matnini yuboring:': '버튼 문구를 보내세요:', 'Tugma rangini tanlang:': '버튼 색상을 선택하세요:' },
  tg: { 'Ruxsat yo\'q.': 'Иҷозат нест.', 'Kanal topilmadi.': 'Канал ёфт нашуд.', 'Post uchun rasm yuboring.': 'Барои пост акс фиристед.', 'Amal bekor qilindi.': 'Амалиёт бекор шуд.', 'Kanalni tanlang:': 'Каналро интихоб кунед:', 'Tugma matnini yuboring:': 'Матни тугмаро фиристед:', 'Tugma rangini tanlang:': 'Ранги тугмаро интихоб кунед:' }
};
const keyboardTranslations = {
  en: { '➕ Kanal qo\'shish': '➕ Add channel', '✍️ Post yaratish': '✍️ Create post', '🗑 Kanalni o\'chirish': '🗑 Remove channel', '⬅️ Orqaga': '⬅️ Back', '🔗 Havolali tugma qo\'shish': '🔗 Add URL button', '✅ Postni yuborish': '✅ Publish post', '❌ Bekor qilish': '❌ Cancel', '🔵 Ko\'k': '🔵 Blue', '🟢 Yashil': '🟢 Green', '🔴 Qizil': '🔴 Red', '📊 Statistika': '📊 Statistics', '📣 Barchaga post yuborish': '📣 Broadcast post', '📢 Majburiy obunani sozlash': '📢 Set required subscription', '❌ Majburiy obunani o\'chirish': '❌ Disable required subscription', '📢 Kanalga obuna bo\'lish': '📢 Subscribe to channel', '✅ Obunani tekshirish': '✅ Check subscription' },
  ru: { '➕ Kanal qo\'shish': '➕ Добавить канал', '✍️ Post yaratish': '✍️ Создать пост', '🗑 Kanalni o\'chirish': '🗑 Удалить канал', '⬅️ Orqaga': '⬅️ Назад', '🔗 Havolali tugma qo\'shish': '🔗 Добавить URL-кнопку', '✅ Postni yuborish': '✅ Опубликовать', '❌ Bekor qilish': '❌ Отмена', '🔵 Ko\'k': '🔵 Синий', '🟢 Yashil': '🟢 Зелёный', '🔴 Qizil': '🔴 Красный', '📊 Statistika': '📊 Статистика', '📣 Barchaga post yuborish': '📣 Рассылка поста', '📢 Majburiy obunani sozlash': '📢 Настроить подписку', '❌ Majburiy obunani o\'chirish': '❌ Отключить подписку', '📢 Kanalga obuna bo\'lish': '📢 Подписаться', '✅ Obunani tekshirish': '✅ Проверить подписку' },
  tr: { '➕ Kanal qo\'shish': '➕ Kanal ekle', '✍️ Post yaratish': '✍️ Gönderi oluştur', '🗑 Kanalni o\'chirish': '🗑 Kanalı sil', '⬅️ Orqaga': '⬅️ Geri', '🔗 Havolali tugma qo\'shish': '🔗 URL butonu ekle', '✅ Postni yuborish': '✅ Gönderiyi yayınla', '❌ Bekor qilish': '❌ İptal', '🔵 Ko\'k': '🔵 Mavi', '🟢 Yashil': '🟢 Yeşil', '🔴 Qizil': '🔴 Kırmızı', '📊 Statistika': '📊 İstatistik', '📣 Barchaga post yuborish': '📣 Herkese gönder', '📢 Majburiy obunani sozlash': '📢 Zorunlu abonelik', '📋 Majburiy obuna kanallar ro\'yxati': '📋 Zorunlu abonelik kanalları listesi', '❌ Majburiy obunani o\'chirish': '❌ Aboneliği kapat', '📢 Kanalga obuna bo\'lish': '📢 Kanala abone ol', '✅ Obunani tekshirish': '✅ Aboneliği kontrol et' },
  ar: { '➕ Kanal qo\'shish': '➕ إضافة قناة', '✍️ Post yaratish': '✍️ إنشاء منشور', '🗑 Kanalni o\'chirish': '🗑 حذف القناة', '⬅️ Orqaga': '⬅️ رجوع', '🔗 Havolali tugma qo\'shish': '🔗 إضافة زر رابط', '✅ Postni yuborish': '✅ نشر المنشور', '❌ Bekor qilish': '❌ إلغاء', '🔵 Ko\'k': '🔵 أزرق', '🟢 Yashil': '🟢 أخضر', '🔴 Qizil': '🔴 أحمر', '📊 Statistika': '📊 الإحصائيات', '📣 Barchaga post yuborish': '📣 إرسال للجميع', '📢 Majburiy obunani sozlash': '📢 إعداد الاشتراك', '❌ Majburiy obunani o\'chirish': '❌ تعطيل الاشتراك', '📢 Kanalga obuna bo\'lish': '📢 اشترك بالقناة', '✅ Obunani tekshirish': '✅ تحقق من الاشتراك' },
  zh: { '➕ Kanal qo\'shish': '➕ 添加频道', '✍️ Post yaratish': '✍️ 创建帖子', '🗑 Kanalni o\'chirish': '🗑 删除频道', '⬅️ Orqaga': '⬅️ 返回', '🔗 Havolali tugma qo\'shish': '🔗 添加链接按钮', '✅ Postni yuborish': '✅ 发布帖子', '❌ Bekor qilish': '❌ 取消', '🔵 Ko\'k': '🔵 蓝色', '🟢 Yashil': '🟢 绿色', '🔴 Qizil': '🔴 红色', '📊 Statistika': '📊 统计', '📣 Barchaga post yuborish': '📣 广播帖子', '📢 Majburiy obunani sozlash': '📢 设置强制订阅', '❌ Majburiy obunani o\'chirish': '❌ 关闭强制订阅', '📢 Kanalga obuna bo\'lish': '📢 订阅频道', '✅ Obunani tekshirish': '✅ 检查订阅' },
  ko: { '➕ Kanal qo\'shish': '➕ 채널 추가', '✍️ Post yaratish': '✍️ 게시물 만들기', '🗑 Kanalni o\'chirish': '🗑 채널 삭제', '⬅️ Orqaga': '⬅️ 뒤로', '🔗 Havolali tugma qo\'shish': '🔗 URL 버튼 추가', '✅ Postni yuborish': '✅ 게시물 게시', '❌ Bekor qilish': '❌ 취소', '🔵 Ko\'k': '🔵 파란색', '🟢 Yashil': '🟢 초록색', '🔴 Qizil': '🔴 빨간색', '📊 Statistika': '📊 통계', '📣 Barchaga post yuborish': '📣 전체 방송', '📢 Majburiy obunani sozlash': '📢 필수 구독 설정', '❌ Majburiy obunani o\'chirish': '❌ 필수 구독 해제', '📢 Kanalga obuna bo\'lish': '📢 채널 구독', '✅ Obunani tekshirish': '✅ 구독 확인' },
  tg: { '➕ Kanal qo\'shish': '➕ Иловаи канал', '✍️ Post yaratish': '✍️ Эҷоди пост', '🗑 Kanalni o\'chirish': '🗑 Нест кардани канал', '⬅️ Orqaga': '⬅️ Бозгашт', '🔗 Havolali tugma qo\'shish': '🔗 Иловаи тугмаи пайванд', '✅ Postni yuborish': '✅ Нашри пост', '❌ Bekor qilish': '❌ Бекор кардан', '🔵 Ko\'k': '🔵 Кабуд', '🟢 Yashil': '🟢 Сабз', '🔴 Qizil': '🔴 Сурх', '📊 Statistika': '📊 Омори', '📣 Barchaga post yuborish': '📣 Ирсол ба ҳама', '📢 Majburiy obunani sozlash': '📢 Танзими обуна', '❌ Majburiy obunani o\'chirish': '❌ Хомӯш кардани обуна', '📢 Kanalga obuna bo\'lish': '📢 Обуна ба канал', '✅ Obunani tekshirish': '✅ Санҷиши обуна' }
};
for (const language of Object.keys(languages)) {
  keyboardTranslations[language] ||= {};
  keyboardTranslations[language]['🛠 Admin panel'] ||= text.admin[language];
}
const previewLabels = {
  uz: ['👀 Preview', '✅ Tasdiqlash'], en: ['👀 Preview', '✅ Confirm'], ru: ['👀 Предпросмотр', '✅ Подтвердить'],
  tr: ['👀 Önizleme', '✅ Onayla'], ar: ['👀 معاينة', '✅ تأكيد'], zh: ['👀 预览', '✅ 确认'], ko: ['👀 미리보기', '✅ 확인'], tg: ['👀 Пешнамоиш', '✅ Тасдиқ']
};
for (const [language, labels] of Object.entries(previewLabels)) {
  keyboardTranslations[language]['👀 Preview'] = labels[0];
  keyboardTranslations[language]['✅ Tasdiqlash'] = labels[1];
}
function localizeReply(ctx, message) {
  return replyTranslations[userLanguage(ctx)]?.[message] || keyboardTranslations[userLanguage(ctx)]?.[message] || message;
}
data.settings ||= {};
data.stats ||= { postsSent: 0, broadcastsSent: 0 };

function saveData() {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function userData(userId) {
  const key = String(userId);
  if (!data.users[key]) {
    const usedIds = Object.values(data.users || {})
      .map((item) => Number(item.personalId))
      .filter((id) => Number.isFinite(id));
    const nextId = usedIds.length ? Math.max(...usedIds) + 1 : 1728000;

    data.users[key] = {
      channels: [],
      language: null,
      balance: 0,
      personalId: nextId,
      username: '',
      nickname: '',
      referrals: [],
      referredBy: null,
      referralRewarded: [],
      postLog: [],
      profileSeen: false
    };
  }

  data.users[key].channels ||= [];
  data.users[key].language ||= null;
  data.users[key].balance ??= 0;
  data.users[key].referrals ||= [];
  data.users[key].postLog ||= [];
  data.users[key].referralRewarded ||= [];
  data.users[key].profileSeen ??= false;

  if (!data.users[key].personalId || String(data.users[key].personalId).length !== 7) {
    const usedIds = Object.values(data.users || {})
      .map((item) => Number(item.personalId))
      .filter((id) => Number.isFinite(id));
    const nextId = usedIds.length ? Math.max(...usedIds) + 1 : 1728000;
    data.users[key].personalId = nextId;
  }

  return data.users[key];
}

function userLanguage(ctx) {
  return userData(ctx.from.id).language || 'uz';
}

function tr(ctx, key, fallback = key) {
  return text[key]?.[userLanguage(ctx)] || text[key]?.uz || fallback;
}

function languageKeyboard() {
  return Markup.inlineKeyboard(Object.entries(languages).map(([code, name]) => [Markup.button.callback(name, `language:${code}`)]));
}

function isAdmin(ctx) {
  return ctx.from?.username?.toLowerCase() === ADMIN_USERNAME;
}

function mainKeyboard(ctx) {
  const keyboard = [[tr(ctx, 'channels'), tr(ctx, 'addChannel')], [tr(ctx, 'settings')], ['👤 Profilim', '📣 Referal']];
  if (isAdmin(ctx)) keyboard.push([tr(ctx, 'admin')]);
  return Markup.keyboard(keyboard).resize();
}

function adminKeyboard(ctx) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(localizeReply(ctx, '📊 Statistika'), 'admin:stats')],
    [Markup.button.callback(localizeReply(ctx, '📣 Barchaga post yuborish'), 'admin:broadcast')],
    [Markup.button.callback(localizeReply(ctx, '📢 Majburiy obunani sozlash'), 'admin:subscription')],
    [Markup.button.callback(localizeReply(ctx, '📋 Majburiy obuna kanallar ro\'yxati'), 'admin:required_list')],
    [Markup.button.callback(localizeReply(ctx, '❌ Majburiy obunani o\'chirish'), 'admin:subscription_off')],
    [Markup.button.callback('🔍 Userni qidirish', 'admin:user_search')]
  ]);
}

function adminBalanceKeyboard(personalId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Balansga pul qo\'shish', `admin:balance_add:${personalId}`), Markup.button.callback('➖ Balansdan pul ayirish', `admin:balance_subtract:${personalId}`)],
    [Markup.button.callback('⬅️ Orqaga', 'admin:user_search')]
  ]);
}

function subscriptionKeyboard(ctx, channel) {
  return Markup.inlineKeyboard([
    [Markup.button.url(localizeReply(ctx, '📢 Kanalga obuna bo\'lish'), `https://t.me/${channel.username.replace(/^@/, '')}`)],
    [Markup.button.callback(localizeReply(ctx, '✅ Obunani tekshirish'), 'check_subscription')]
  ]);
}

function statsText() {
  const users = Object.values(data.users || {});
  const channels = users.reduce((total, user) => total + (user.channels?.length || 0), 0);
  const posts = data.stats.postsSent || 0;
  const broadcasts = data.stats.broadcastsSent || 0;
  return { uz: `📊 Bot statistikasi\n\n👤 Barcha foydalanuvchilar: ${users.length}\n📢 Barcha kanallar: ${channels}\n📨 Yuborilgan postlar: ${posts}\n📣 Broadcastlar: ${broadcasts}`, en: `📊 Bot statistics\n\n👤 All users: ${users.length}\n📢 All channels: ${channels}\n📨 Posts sent: ${posts}\n📣 Broadcasts: ${broadcasts}`, ru: `📊 Статистика бота\n\n👤 Все пользователи: ${users.length}\n📢 Все каналы: ${channels}\n📨 Отправлено постов: ${posts}\n📣 Рассылки: ${broadcasts}`, tr: `📊 Bot istatistikası\n\n👤 Tüm kullanıcılar: ${users.length}\n📢 Tüm kanallar: ${channels}\n📨 Gönderilen gönderiler: ${posts}\n📣 Yayınlar: ${broadcasts}`, ar: `📊 إحصائيات البوت\n\n👤 جميع المستخدمين: ${users.length}\n📢 جميع القنوات: ${channels}\n📨 المنشورات المرسلة: ${posts}\n📣 الإرسالات: ${broadcasts}`, zh: `📊 机器人统计\n\n👤 用户总数：${users.length}\n📢 频道总数：${channels}\n📨 已发送帖子：${posts}\n📣 广播：${broadcasts}`, ko: `📊 봇 통계\n\n👤 전체 사용자: ${users.length}\n📢 전체 채널: ${channels}\n📨 보낸 게시물: ${posts}\n📣 방송: ${broadcasts}`, tg: `📊 Омори бот\n\n👤 Ҳамаи корбарон: ${users.length}\n📢 Ҳамаи каналҳо: ${channels}\n📨 Постҳои фиристодашуда: ${posts}\n📣 Ирсолҳо: ${broadcasts}` };
}

async function requiredSubscription(ctx) {
  if (isAdmin(ctx)) return true;
  const channels = getRequiredChannels();
  if (!channels.length) {
    await rewardReferralIfEligible(ctx);
    return true;
  }

  for (const channel of channels) {
    try {
      const member = await ctx.telegram.getChatMember(channel.id, ctx.from.id);
      if (!['creator', 'administrator', 'member'].includes(member.status)) {
        await ctx.reply(`Botdan foydalanish uchun ${channel.title || channel.username} kanaliga obuna bo\'ling.`, subscriptionKeyboard(ctx, channel));
        return false;
      }
    } catch (error) {
      console.error('Subscription check failed:', error.response?.description || error.message);
      await ctx.reply(`Botdan foydalanish uchun ${channel.title || channel.username} kanaliga obuna bo\'ling.`, subscriptionKeyboard(ctx, channel));
      return false;
    }
  }

  await rewardReferralIfEligible(ctx);
  return true;
}

async function checkRequiredSubscriptionChannel(ctx, username) {
  const chat = await ctx.telegram.getChat(username);
  if (chat.type !== 'channel' || !chat.username) throw new Error('Public username’li kanal yuboring.');
  const botInfo = await ctx.telegram.getMe();
  const member = await ctx.telegram.getChatMember(chat.id, botInfo.id);
  if (!['creator', 'administrator'].includes(member.status)) {
    throw new Error('Bot majburiy obuna kanalida administrator bo\'lishi kerak.');
  }
  return { id: chat.id, title: chat.title || username, username: `@${chat.username}` };
}

function getRequiredChannels() {
  const list = Array.isArray(data.settings?.requiredChannels) ? data.settings.requiredChannels : [];
  if (data.settings?.requiredChannel && !list.some((item) => item.id === data.settings.requiredChannel.id)) {
    list.push(data.settings.requiredChannel);
  }
  return list;
}

function formatRequiredChannelList() {
  const channels = getRequiredChannels();
  if (!channels.length) return 'Majburiy obuna kanallari yo\'q.';
  return channels.map((channel) => `${channel.title || channel.username} (${channel.username || ''})`).join('\n');
}

async function sendBroadcastToChat(ctx, chatId, post, replyMarkup) {
  if (post.photo) {
    await ctx.telegram.sendPhoto(chatId, post.photo, {
      caption: post.caption || undefined,
      caption_entities: post.caption ? post.captionEntities : undefined,
      reply_markup: replyMarkup
    });
  } else {
    await ctx.telegram.sendMessage(chatId, post.caption || ' ', {
      reply_markup: replyMarkup,
      entities: post.captionEntities || undefined
    });
  }
}

async function broadcastPost(ctx, post) {
  const userIds = new Set(Object.keys(data.users || {}));
  const channelIds = new Set();

  for (const account of Object.values(data.users || {})) {
    for (const channel of account.channels || []) {
      if (channel?.id) channelIds.add(String(channel.id));
    }
  }

  for (const channel of getRequiredChannels()) {
    if (channel?.id) channelIds.add(String(channel.id));
  }

  const buttons = post.finalButtons || postButtons(post);
  const replyMarkup = Markup.inlineKeyboard(buttons).reply_markup;
  let sent = 0;

  for (const chatId of channelIds) {
    try {
      await sendBroadcastToChat(ctx, chatId, post, replyMarkup);
      sent += 1;
    } catch (error) {
      console.error(`Broadcast to channel ${chatId} failed:`, error.response?.description || error.message);
    }
  }

  for (const chatId of userIds) {
    try {
      let canSend = true;
      for (const required of getRequiredChannels()) {
        if (!required?.id) continue;
        try {
          const member = await ctx.telegram.getChatMember(required.id, Number(chatId));
          if (!['creator', 'administrator', 'member'].includes(member.status)) {
            canSend = false;
            break;
          }
        } catch (error) {
          canSend = false;
          break;
        }
      }

      if (!canSend) continue;
      await sendBroadcastToChat(ctx, chatId, post, replyMarkup);
      sent += 1;
    } catch (error) {
      console.error(`Broadcast to user ${chatId} failed:`, error.response?.description || error.message);
    }
  }

  data.stats.broadcastsSent += 1;
  data.stats.postsSent += sent;
  saveData();
  return sent;
}

function channelKeyboard(ctx, channels) {
  return Markup.inlineKeyboard([
    ...channels.map((channel) => [Markup.button.callback(`📢 ${channel.title}`, `channel:${channel.id}`)]),
    [Markup.button.callback(localizeReply(ctx, '➕ Kanal qo\'shish'), 'add_channel')]
  ]);
}

function channelActions(ctx, channelId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(localizeReply(ctx, '✍️ Post yaratish'), `compose:${channelId}`)],
    [Markup.button.callback(localizeReply(ctx, '🗑 Kanalni o\'chirish'), `remove:${channelId}`)],
    [Markup.button.callback(localizeReply(ctx, '⬅️ Orqaga'), 'channels')]
  ]);
}

function composerKeyboard(ctx) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(localizeReply(ctx, '🔗 Havolali tugma qo\'shish'), 'add_button')],
    [Markup.button.callback(localizeReply(ctx, '👀 Preview'), 'preview')],
    [Markup.button.callback(localizeReply(ctx, '❌ Bekor qilish'), 'cancel')]
  ]);
}

function confirmationKeyboard(ctx) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(localizeReply(ctx, '✅ Tasdiqlash'), 'publish')],
    [Markup.button.callback(localizeReply(ctx, '❌ Bekor qilish'), 'cancel')]
  ]);
}

function postButtons(post) {
  return post.buttons || [];
}

async function sendPreview(ctx) {
  const { post } = ctx.session;
  if (!post?.photo && !post?.caption) return ctx.reply('Post ma\'lumotlari topilmadi.');
  ctx.session.previewButtons = postButtons(post);
  const replyMarkup = Markup.inlineKeyboard(ctx.session.previewButtons).reply_markup;
  ctx.session.step = 'confirm';
  if (post.photo) {
    await ctx.telegram.sendPhoto(ctx.from.id, post.photo, {
      caption: post.caption || undefined,
      caption_entities: post.caption ? post.captionEntities : undefined,
      reply_markup: replyMarkup
    });
  } else {
    await ctx.telegram.sendMessage(ctx.from.id, post.caption, {
      entities: post.captionEntities || [],
      reply_markup: replyMarkup
    });
  }
  return ctx.reply('👀 Preview tayyor. Yuborishni tasdiqlaysizmi?', confirmationKeyboard(ctx));
}

async function sendMediaFromUrl(ctx, url) {
  const lower = String(url).trim().toLowerCase();
  const botAddress = getBotPublicLink();
  const footer = `\n\n📍 Bot manzili: ${botAddress}`;

  try {
    if (/youtube\.com|youtu\.be|instagram\.com|instagr\.am|tiktok\.com|x\.com|twitter\.com|fb\.com|facebook\.com|vk\.com|vimeo\.com/.test(lower)) {
      const output = path.join(__dirname, 'tmp-media', `media-${Date.now()}.mp4`);
      const ytdlp = spawnSync('yt-dlp', ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '-o', output, url], { encoding: 'utf8' });
      if (ytdlp.status !== 0 || !fs.existsSync(output)) {
        return ctx.reply('Ushbu URL dan video olib bo\'lmadi. To\'g\'ri public video yoki media URL yuboring.', mainKeyboard(ctx));
      }
      await ctx.telegram.sendVideo(ctx.chat.id, { source: fs.createReadStream(output), filename: 'media.mp4' }, { caption: footer, supports_streaming: true });
      return ctx.reply('✅ Video yuborildi.', mainKeyboard(ctx));
    }

    if (/\.(mp4|mov|m4v|webm|ogg|avi)(\?|$)/.test(lower)) {
      await ctx.telegram.sendVideo(ctx.chat.id, url, { caption: footer, supports_streaming: true });
      return ctx.reply('✅ Video yuborildi.', mainKeyboard(ctx));
    }

    if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/.test(lower)) {
      await ctx.telegram.sendPhoto(ctx.chat.id, url, { caption: footer });
      return ctx.reply('✅ Rasm yuborildi.', mainKeyboard(ctx));
    }

    return ctx.reply('Iltimos, rasm yoki video URL yuboring.', mainKeyboard(ctx));
  } catch (error) {
    console.error('Media send failed:', error);
    return ctx.reply('Media URL ni yuborishda xatolik yuz berdi.', mainKeyboard(ctx));
  }
}

function buttonStyleKeyboard(ctx) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(localizeReply(ctx, '🔵 Ko\'k'), 'button_style:primary')],
    [Markup.button.callback(localizeReply(ctx, '🟢 Yashil'), 'button_style:success')],
    [Markup.button.callback(localizeReply(ctx, '🔴 Qizil'), 'button_style:danger')],
    [Markup.button.callback(localizeReply(ctx, '❌ Bekor qilish'), 'cancel')]
  ]);
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'tg:';
  } catch {
    return false;
  }
}

function normalizeChannel(value) {
  const trimmed = value.trim();
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function normalizeBotUsername(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) return 'postmboefdbot';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value.replace(/^https?:\/\/t\.me\//i, '').replace(/^https?:\/\/telegram\.me\//i, '').split(/[/?#]/)[0].replace(/^@/, '');
  }
  return value.replace(/^@/, '').split(/[/?#]/)[0];
}

function getBotPublicLink() {
  const configured = normalizeBotUsername(process.env.BOT_USERNAME || process.env.BOT_LINK || process.env.BOT_ID || '');
  return `https://t.me/${configured}`;
}

function normalizePersonalId(value) {
  const input = String(value).trim();
  return input.replace(/\D/g, '');
}

function findUserByPersonalId(value) {
  const target = String(value);
  for (const [key, user] of Object.entries(data.users || {})) {
    if (String(user.personalId || user.id || '').trim() === target) return { key, user };
  }
  return null;
}

function buildUserProfileText(user, fromId) {
  return `👤 Foydalanuvchi profili\n\n` +
    `Username: ${user.username || user.nickname || '—'}\n` +
    `Nickname: ${user.nickname || '—'}\n` +
    `Bot personal ID: ${user.personalId || '—'}\n` +
    `Telegram ID: ${fromId}\n` +
    `Balans: ${Number(user.balance || 0)} UZS\n` +
    `Taklif qilganlar: ${Array.isArray(user.referrals) ? user.referrals.length : 0}`;
}

async function sendToAdmin(message) {
  try {
    const chat = await bot.telegram.getChat(ADMIN_USERNAME);
    return bot.telegram.sendMessage(chat.id, message);
  } catch (error) {
    console.error('Admin message send failed:', error.message);
  }
}

async function chargeOrAllowPost(ctx) {
  const account = userData(ctx.from.id);
  const postLog = Array.isArray(account.postLog) ? account.postLog : [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = postLog.filter((time) => Number(time) > cutoff);
  account.postLog = recent;

  if (recent.length >= 2) {
    if ((Number(account.balance) || 0) < 1000) {
      return { ok: false, message: 'Sizning balansingizda yetarli mablag\' yo\'q. Har bir qo\'shimcha post uchun 1000 UZS yechiladi.' };
    }
    account.balance = Number(account.balance || 0) - 1000;
  }

  account.postLog.push(Date.now());
  saveData();
  return { ok: true };
}

function normalizeReferralPayload(payload) {
  return String(payload || '').trim();
}

function findUserByPersonalId(id) {
  const target = String(id).trim();
  for (const [key, account] of Object.entries(data.users || {})) {
    if (String(account.personalId) === target) return { key, account };
  }
  return null;
}

function buildProfileText(ctx) {
  const account = userData(ctx.from.id);
  const invited = Array.isArray(account.referrals) ? account.referrals.length : 0;
  const invitedNames = Array.isArray(account.referrals) ? account.referrals.map((id) => String(id)).join(', ') : '—';
  return `👤 Profilim\n\n` +
    `Botdagi ID: ${account.personalId}\n` +
    `Telegram ID: ${ctx.from.id}\n` +
    `Username: ${ctx.from.username || '—'}\n` +
    `Nickname: ${ctx.from.first_name || '—'}\n` +
    `Balans: ${Number(account.balance || 0)} UZS\n` +
    `Taklif qilgan dostlar: ${invited}\n` +
    `Taklif qilgan dostlar botdagi IDlari: ${invitedNames}`;
}

function buildReferralText(ctx) {
  const account = userData(ctx.from.id);
  const key = String(ctx.from.id);
  const botLink = getBotPublicLink();
  const inviteLink = `${botLink}?start=${account.personalId}`;
  return `📣 Referal bo\'limi\n\n` +
    `Taklif qilish uchun havola:\n${inviteLink}\n\n` +
    `Taklif qilinganlar: ${Array.isArray(account.referrals) ? account.referrals.length : 0}\n` +
    `Balans: ${Number(account.balance || 0)} UZS`;
}

async function handleStart(ctx) {
  const account = userData(ctx.from.id);
  account.username = ctx.from.username || '';
  account.nickname = ctx.from.first_name || ctx.from.last_name || '';
  if (!account.language) {
    account.language = 'uz';
  }

  const payload = normalizeReferralPayload(ctx.startPayload || ctx.message?.text?.replace(/^\/start\s*/i, ''));
  const isNewUser = Boolean(ctx.session?.justCreated);
  if (isNewUser && payload && payload.length >= 4 && !account.referredBy && !account.referralRewarded?.includes(payload)) {
    const found = findUserByPersonalId(payload);
    if (found && found.key !== String(ctx.from.id)) {
      account.referredBy = found.key;
      found.account.referrals ||= [];
      if (!found.account.referrals.includes(String(account.personalId))) {
        found.account.referrals.push(String(account.personalId));
      }
      found.account.referralRewarded ||= [];
    }
  }

  saveData();
  await rewardReferralIfEligible(ctx);
  reset(ctx);
  if (!account.language) return ctx.reply(tr(ctx, 'welcome'), languageKeyboard());
  return ctx.reply('Assalomu alaykum! Kanal postlarini boshqarish botiga xush kelibsiz.', mainKeyboard(ctx));
}

async function sendAdminMessage(ctx, messageText) {
  try {
    const chat = await bot.telegram.getChat(ADMIN_PUBLIC_USERNAME);
    const account = userData(ctx.from.id);
    return bot.telegram.sendMessage(chat.id, `📬 Adminga murojaat\n\n` +
      `Foydalanuvchi: ${ctx.from.username || ctx.from.first_name || ctx.from.id}\n` +
      `Bot personal ID: ${account.personalId || '—'}\n` +
      `Telegram ID: ${ctx.from.id}\n\n` +
      `${messageText}`);
  } catch (error) {
    console.error('Admin message send failed:', error.response?.description || error.message);
  }
}

async function chargeForPostIfNeeded(ctx) {
  const account = userData(ctx.from.id);
  const now = Date.now();
  const windowStart = now - 24 * 60 * 60 * 1000;
  const recentLog = Array.isArray(account.postLog) ? account.postLog.filter((ts) => Number(ts) >= windowStart) : [];
  account.postLog = recentLog;

  if (recentLog.length >= 2) {
    if ((Number(account.balance) || 0) < 1000) {
      return { ok: false, message: 'Ushbu post uchun yetarli balans yo\'q. Har bir qo\'shimcha post uchun 1000 UZS yechiladi.' };
    }
    account.balance = Number(account.balance || 0) - 1000;
  }

  account.postLog.push(now);
  saveData();
  return { ok: true };
}

async function rewardReferralIfEligible(ctx) {
  const account = userData(ctx.from.id);
  if (!account.referredBy || !account.personalId) return;

  const inviter = data.users[String(account.referredBy)];
  if (!inviter) return;

  inviter.referrals ||= [];
  inviter.referralRewarded ||= [];

  if (Array.isArray(inviter.referralRewarded) && inviter.referralRewarded.includes(account.personalId)) return;

  const alreadyStarted = Boolean(data.users?.[String(ctx.from.id)] && data.users[String(ctx.from.id)].profileSeen !== undefined && data.users[String(ctx.from.id)].personalId);
  if (!ctx.session?.justCreated && !alreadyStarted) return;

  const channels = getRequiredChannels();
  let eligible = true;

  if (channels.length) {
    for (const channel of channels) {
      try {
        const member = await ctx.telegram.getChatMember(channel.id, ctx.from.id);
        if (!['creator', 'administrator', 'member'].includes(member.status)) {
          eligible = false;
          break;
        }
      } catch (error) {
        eligible = false;
        break;
      }
    }
  }

  if (!eligible) return;

  inviter.balance = Number(inviter.balance || 0) + 1000;
  if (!inviter.referrals.includes(String(account.personalId))) {
    inviter.referrals.push(String(account.personalId));
  }
  inviter.referralRewarded.push(account.personalId);
  saveData();
}

async function checkFullAdmin(ctx, username) {
  const chat = await ctx.telegram.getChat(username);
  if (chat.type !== 'channel') throw new Error('Bu username kanalga tegishli emas.');

  const botInfo = await ctx.telegram.getMe();
  const member = await ctx.telegram.getChatMember(chat.id, botInfo.id);
  if (member.status !== 'administrator') {
    throw new Error('Bot kanalda administrator emas. Avval botni to\'liq admin qilib qo\'shing.');
  }

  const requiredPermissions = [
    'can_manage_chat', 'can_change_info', 'can_post_messages', 'can_edit_messages',
    'can_delete_messages', 'can_invite_users', 'can_restrict_members',
    'can_promote_members', 'can_manage_video_chats'
  ];
  const missing = requiredPermissions.filter((permission) => member[permission] !== true);
  if (missing.length) throw new Error('Bot to\'liq admin emas. Barcha administrator huquqlarini yoqing.');

  return { id: chat.id, title: chat.title || username, username: chat.username ? `@${chat.username}` : username };
}

async function showChannels(ctx) {
  const channels = userData(ctx.from.id).channels;
  if (!channels.length) {
    return ctx.reply('Sizda hali kanal yo\'q. Kanal username sini yuborish uchun «➕ Kanal qo\'shish» tugmasini bosing.', mainKeyboard(ctx));
  }
  return ctx.reply('Kanalni tanlang:', channelKeyboard(ctx, channels));
}

function reset(ctx) {
  ctx.session = {};
}

bot.use(session());

bot.use(async (ctx, next) => {
  if (ctx.from) {
    const wasExisting = Boolean(data.users?.[String(ctx.from.id)]);
    userData(ctx.from.id);
    saveData();
    if (!wasExisting && ctx.session) {
      ctx.session.justCreated = true;
    }
  }

  const originalReply = ctx.reply.bind(ctx);
  ctx.reply = (message, ...args) => originalReply(localizeReply(ctx, message), ...args);
  const callbackData = ctx.callbackQuery?.data;
  const isStart = ctx.message?.text === '/start';
  const isSettings = ctx.message?.text === '/settings';
  if (isStart || isSettings || callbackData?.startsWith('language:') || callbackData === 'check_subscription' || isAdmin(ctx)) return next();

  if (await requiredSubscription(ctx)) {
    return next();
  }
});

bot.start(async (ctx) => {
  return handleStart(ctx);
});

bot.action(/^language:(uz|en|ru|ar|tr|zh|ko|tg)$/, async (ctx) => {
  await ctx.answerCbQuery();
  userData(ctx.from.id).language = ctx.match[1];
  saveData();
  reset(ctx);
  return ctx.reply(tr(ctx, 'languageSaved'), mainKeyboard(ctx));
});

bot.command('settings', (ctx) => ctx.reply(tr(ctx, 'welcome'), languageKeyboard()));
bot.command('profile', (ctx) => ctx.reply(buildProfileText(ctx), mainKeyboard(ctx)));
bot.command('balance', (ctx) => {
  const account = userData(ctx.from.id);
  return ctx.reply(`Balans: ${Number(account.balance || 0)} UZS`);
});
bot.command('referral', (ctx) => ctx.reply(buildReferralText(ctx), mainKeyboard(ctx)));

bot.command('channels', showChannels);

// --- ESKI MA'LUMOTLARNI YUKLAB OLISH BUYRUG'I --

bot.hears(Object.values(text.createPost), showChannels);
bot.hears(Object.values(text.videoSave), (ctx) => {
  ctx.session = { step: 'media_url' };
  return ctx.reply('Ijtimoiy tarmoqdan rasm/video URL yuboring:', Markup.removeKeyboard());
});
bot.hears(Object.values(text.channels), showChannels);
bot.hears(Object.values(text.addChannel), (ctx) => {
  ctx.session = { step: 'channel' };
  ctx.reply('Kanal username sini yuboring, masalan: @my_channel');
});

bot.hears(Object.values(text.settings), (ctx) => ctx.reply(tr(ctx, 'welcome'), languageKeyboard()));

bot.hears('👤 Profilim', (ctx) => {
  return ctx.reply(buildProfileText(ctx), mainKeyboard(ctx));
});

bot.hears('📣 Referal', (ctx) => {
  return ctx.reply(buildReferralText(ctx), mainKeyboard(ctx));
});

bot.hears(Object.values(text.admin), (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  return ctx.reply('🛠 Admin panel', adminKeyboard(ctx));
});

bot.action('check_subscription', async (ctx) => {
  await ctx.answerCbQuery();
  if (await requiredSubscription(ctx)) {
    return ctx.reply('✅ Obuna tasdiqlandi. Botdan foydalanishingiz mumkin.', mainKeyboard(ctx));
  }
  return ctx.reply('Botdan foydalanish uchun majburiy kanallarga obuna bo\'ling.', mainKeyboard(ctx));
});

bot.action('admin:user_search', async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  ctx.session = { step: 'admin_user_search' };
  return ctx.reply('Userning botdagi personal ID raqamini yuboring:', adminKeyboard(ctx));
});

bot.action(/^admin:balance_(add|subtract):(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  const mode = ctx.match[1] === 'add' ? 'add' : 'subtract';
  const targetId = normalizePersonalId(ctx.match[2]);
  const found = findUserByPersonalId(targetId);
  if (!found) return ctx.reply('Bunday foydalanuvchi topilmadi.', adminKeyboard(ctx));

  ctx.session = { step: 'admin_balance_amount', balanceMode: mode, balanceTarget: found.key, balanceTargetId: targetId };
  return ctx.reply(`Yangi miqdorni kiriting (${mode === 'add' ? 'qoshish' : 'ayirish'} uchun).`, adminKeyboard(ctx));
});

bot.action('admin:stats', async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  return ctx.reply(statsText()[userLanguage(ctx)] || statsText().uz, adminKeyboard(ctx));
});

bot.action('admin:subscription', async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  ctx.session = { step: 'required_subscription_channel' };
  return ctx.reply('Majburiy obuna kanalining public username sini yuboring, masalan: @my_channel');
});

bot.action('admin:required_list', async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  return ctx.reply(formatRequiredChannelList(), adminKeyboard(ctx));
});

bot.action('admin:subscription_off', async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  data.settings.requiredChannels = [];
  data.settings.requiredChannel = undefined;
  saveData();
  return ctx.reply('✅ Majburiy obuna o\'chirildi.', adminKeyboard(ctx));
});

bot.action('admin:required_list', async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  return ctx.reply(formatRequiredChannelList(), adminKeyboard(ctx));
});

bot.action('admin:broadcast', async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  ctx.session = { step: 'broadcast_photo', post: { buttons: [] }, broadcast: true };
  return ctx.reply('Broadcast uchun rasm yuboring yoki «Rasmsiz» tugmasini bosing.', Markup.inlineKeyboard([
    [Markup.button.callback('Rasmsiz', 'broadcast_no_photo')],
    [Markup.button.callback('Bekor qilish', 'cancel')]
  ]));
});

bot.action('broadcast_no_photo', async (ctx) => {
  await ctx.answerCbQuery();
  if (!ctx.session?.broadcast) return ctx.reply('Broadcast boshlanmagan.');
  ctx.session.step = 'broadcast_caption';
  return ctx.reply('Broadcast izohini yuboring:');
});

bot.action('channels', async (ctx) => {
  await ctx.answerCbQuery();
  return showChannels(ctx);
});

bot.action('add_channel', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session = { step: 'channel' };
  return ctx.reply('Kanal username sini yuboring, masalan: @my_channel');
});

bot.action(/^channel:(-?\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const channel = userData(ctx.from.id).channels.find((item) => String(item.id) === ctx.match[1]);
  if (!channel) return ctx.reply('Kanal topilmadi.');
  ctx.session ||= {};
  ctx.session.selectedChannel = channel;
  return ctx.reply(`${channel.title} (${channel.username})`, channelActions(ctx, channel.id));
});



bot.action(/^remove:(-?\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const account = userData(ctx.from.id);
  account.channels = account.channels.filter((item) => String(item.id) !== ctx.match[1]);
  saveData();
  return ctx.reply('Kanal ro\'yxatdan o\'chirildi.', mainKeyboard(ctx));
});

bot.action(/^compose:(-?\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const channel = userData(ctx.from.id).channels.find((item) => String(item.id) === ctx.match[1]);
  if (!channel) return ctx.reply('Kanal topilmadi.');
  ctx.session = { step: 'photo', selectedChannel: channel, post: { buttons: [] } };
  return ctx.reply('Post uchun rasm yuboring yoki «Rasmsiz» tugmasini bosing.', Markup.inlineKeyboard([
    [Markup.button.callback('Rasmsiz', 'no_photo')],
    [Markup.button.callback('Bekor qilish', 'cancel')]
  ]));
});

bot.on('photo', async (ctx) => {
  if (!ctx.session || !['photo', 'broadcast_photo'].includes(ctx.session.step)) return;
  const message = ctx.message;
  ctx.session.post.photo = message.photo.at(-1).file_id;

  if (ctx.session.broadcast) {
    if (message.caption !== undefined) {
      ctx.session.post.caption = message.caption;
      ctx.session.post.captionEntities = message.caption_entities || [];
      ctx.session.step = 'buttons';
      return ctx.reply('Rasm va izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:', composerKeyboard(ctx));
    }
    ctx.session.step = 'broadcast_caption';
    return ctx.reply('Rasm saqlandi. Broadcast izohini yuboring:');
  }

  if (message.caption !== undefined) {
    ctx.session.post.caption = message.caption;
    ctx.session.post.captionEntities = message.caption_entities || [];
    ctx.session.step = 'buttons';
    return ctx.reply('Rasm va izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:', composerKeyboard(ctx));
  }

  ctx.session.step = 'caption';
  return ctx.reply('Endi post izohini yuboring yoki «Izohsiz» tugmasini bosing.', Markup.inlineKeyboard([
    [Markup.button.callback('Izohsiz', 'no_caption')],
    [Markup.button.callback('Bekor qilish', 'cancel')]
  ]));
});

bot.action('no_photo', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.step = 'caption';
  return ctx.reply('Endi post izohini yuboring yoki «Izohsiz» tugmasini bosing.', Markup.inlineKeyboard([
    [Markup.button.callback('Izohsiz', 'no_caption')],
    [Markup.button.callback('Bekor qilish', 'cancel')]
  ]));
});

bot.action('no_caption', async (ctx) => {
  await ctx.answerCbQuery();
  if (!ctx.session.post) return ctx.reply('Avval post yaratishni boshlang.');
  ctx.session.post.caption = '';
  ctx.session.post.captionEntities = [];
  ctx.session.step = 'buttons';
  return ctx.reply('Post tayyor. Havolali tugmalar qo\'shishingiz mumkin:', composerKeyboard(ctx));
});

bot.action('add_button', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.step = 'button_text';
  return ctx.reply('Tugma matnini yuboring:');
});

bot.action(/^button_style:(primary|success|danger)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const sessionState = ctx.session || {};
  if (!sessionState.post || !sessionState.pendingButtonText || !sessionState.pendingButtonUrl) {
    return ctx.reply('Tugma ma\'lumotlari topilmadi. Qaytadan boshlang.');
  }

  sessionState.post.buttons.push([{
    text: sessionState.pendingButtonText,
    url: sessionState.pendingButtonUrl,
    style: ctx.match[1]
  }]);
  sessionState.pendingButtonText = undefined;
  sessionState.pendingButtonUrl = undefined;
  sessionState.step = 'buttons';
  return ctx.reply('Rangli tugma qo\'shildi. Yana tugma qo\'shasizmi yoki postni yuboramizmi?', composerKeyboard(ctx));
});

bot.action('preview', async (ctx) => {
  await ctx.answerCbQuery();
  return sendPreview(ctx);
});

bot.action('publish', async (ctx) => {
  await ctx.answerCbQuery();
  const { selectedChannel, post } = ctx.session;
  if (ctx.session.broadcast) {
    if (!post?.caption && !post?.photo) return ctx.reply('Broadcast mazmuni topilmadi.');
    const sent = await broadcastPost(ctx, { ...post, finalButtons: ctx.session.previewButtons });
    reset(ctx);
    return ctx.reply(`✅ Broadcast ${sent} ta chatga yuborildi.`, mainKeyboard(ctx));
  }
  if (!selectedChannel || !post || (!post.photo && !post.caption)) return ctx.reply('Post ma\'lumotlari topilmadi.');

  const charge = await chargeForPostIfNeeded(ctx);
  if (!charge.ok) {
    reset(ctx);
    return ctx.reply(charge.message, mainKeyboard(ctx));
  }

  const buttons = ctx.session.previewButtons || postButtons(post);
  const replyMarkup = Markup.inlineKeyboard(buttons).reply_markup;
  if (post.photo) {
    await ctx.telegram.sendPhoto(selectedChannel.id, post.photo, {
      caption: post.caption || undefined,
      caption_entities: post.caption ? post.captionEntities : undefined,
      reply_markup: replyMarkup
    });
  } else {
    await ctx.telegram.sendMessage(selectedChannel.id, post.caption || ' ', {
      entities: post.captionEntities || undefined,
      reply_markup: replyMarkup
    });
  }
  data.stats.postsSent += 1;
  saveData();
  reset(ctx);
  return ctx.reply('✅ Post kanalga muvaffaqiyatli yuborildi.', mainKeyboard(ctx));
});

bot.action('cancel', async (ctx) => {
  await ctx.answerCbQuery();
  reset(ctx);
  return ctx.reply('Amal bekor qilindi.', mainKeyboard(ctx));
});

bot.on('text', async (ctx) => {
  const sessionState = ctx.session || {};
  const text = ctx.message.text;
  const trimmedText = text.trim();

  if (sessionState.step === 'media_url') {
    if (!isUrl(trimmedText)) return ctx.reply('Havola http:// yoki https:// bilan boshlanishi kerak. Qayta yuboring:');
    sessionState.step = null;
    return sendMediaFromUrl(ctx, trimmedText);
  }

  if (sessionState.step === 'required_subscription_channel') {
    if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
    try {
      const channel = await checkRequiredSubscriptionChannel(ctx, normalizeChannel(trimmedText));
      data.settings.requiredChannels ||= [];
      if (!data.settings.requiredChannels.some((item) => item.id === channel.id)) {
        data.settings.requiredChannels.push(channel);
      }
      data.settings.requiredChannel = channel;
      saveData();
      reset(ctx);
      return ctx.reply(`✅ ${channel.title} majburiy obuna kanali qilib sozlandi.`, adminKeyboard(ctx));
    } catch (error) {
      return ctx.reply(`❌ ${error.message}`);
    }
  }

  if (sessionState.step === 'channel') {
    try {
      const channel = await checkFullAdmin(ctx, normalizeChannel(trimmedText));
      const account = userData(ctx.from.id);
      if (!account.channels.some((item) => item.id === channel.id)) account.channels.push(channel);
      saveData();
      reset(ctx);
      return ctx.reply(`✅ ${channel.title} kanal ro\'yxatingizga qo\'shildi.`, mainKeyboard(ctx));
    } catch (error) {
      return ctx.reply(`❌ ${error.message}\n\nUsername ni to\'g\'ri yuboring va botga barcha admin huquqlarini bering.`);
    }
  }

  if (sessionState.step === 'caption') {
    sessionState.post.caption = text;
    sessionState.post.captionEntities = ctx.message.entities || [];
    sessionState.step = 'buttons';
    return ctx.reply('Izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:', composerKeyboard(ctx));
  }

  if (sessionState.step === 'broadcast_caption') {
    sessionState.post.caption = text;
    sessionState.post.captionEntities = ctx.message.entities || [];
    sessionState.step = 'buttons';
    return ctx.reply('Izoh saqlandi. Havolali tugmalar qo\'shishingiz mumkin:', composerKeyboard(ctx));
  }

  if (sessionState.step === 'button_text') {
    sessionState.pendingButtonText = text;
    sessionState.step = 'button_url';
    return ctx.reply('Endi tugma havolasini yuboring (https://...):');
  }

  if (sessionState.step === 'button_url') {
    if (!isUrl(trimmedText)) return ctx.reply('Havola http:// yoki https:// bilan boshlanishi kerak. Qayta yuboring:');
    sessionState.pendingButtonUrl = trimmedText;
    sessionState.step = 'button_style';
    return ctx.reply('Tugma rangini tanlang:', buttonStyleKeyboard(ctx));
  }

  if (sessionState.step === 'admin_user_search') {
    if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
    const target = normalizePersonalId(trimmedText);
    const found = findUserByPersonalId(target);
    if (!found) return ctx.reply('Bunday foydalanuvchi topilmadi.', adminKeyboard(ctx));
    const account = found.account;
    const detail = `👤 User ma\'lumotlari\n\n` +
      `Username: ${account.username || '—'}\n` +
      `Nickname: ${account.nickname || '—'}\n` +
      `Bot personal ID: ${account.personalId || '—'}\n` +
      `Telegram ID: ${found.key}\n` +
      `Balans: ${Number(account.balance || 0)} UZS\n` +
      `Taklif qilganlar: ${Array.isArray(account.referrals) ? account.referrals.length : 0}\n` +
      `Taklif qilgan dostlar IDlari: ${Array.isArray(account.referrals) ? account.referrals.join(', ') : '—'}`;
    ctx.session = { step: 'admin_user_search_result', targetKey: found.key, targetPersonalId: account.personalId };
    return ctx.reply(detail, adminBalanceKeyboard(account.personalId));
  }

  if (sessionState.step === 'admin_balance_amount') {
    if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
    const amount = Number(normalizePersonalId(trimmedText));
    if (!Number.isFinite(amount) || amount <= 0) {
      return ctx.reply('Miqdor musbat son bo\'lishi kerak. Qayta kiriting:', adminKeyboard(ctx));
    }

    const target = data.users[sessionState.balanceTarget];
    if (!target) return ctx.reply('Bunday foydalanuvchi topilmadi.', adminKeyboard(ctx));

    const oldBalance = Number(target.balance || 0);
    let newBalance = oldBalance;
    if (sessionState.balanceMode === 'add') {
      newBalance = oldBalance + amount;
    } else {
      newBalance = Math.max(0, oldBalance - amount);
    }

    target.balance = newBalance;
    saveData();

    const sign = sessionState.balanceMode === 'add' ? 'qo\'shildi' : 'ayirildi';
    const direction = sessionState.balanceMode === 'add' ? 'qoshish' : 'ayirish';
    const userMessage = `📣 Admin tomonidan balansingizga ${direction} orqali ${amount} UZS ${sign}.\n\nYangi balans: ${Number(target.balance || 0)} UZS`;

    try {
      await bot.telegram.sendMessage(Number(sessionState.balanceTarget), userMessage);
    } catch (error) {
      console.error('Balance change notification failed:', error.response?.description || error.message);
    }

    reset(ctx);
    return ctx.reply(`✅ Balans ${direction} qilindi. Userga xabar yuborildi. Yangi balans: ${newBalance} UZS`, adminKeyboard(ctx));
  }

  return ctx.reply('Kerakli amalni pastki menyudan tanlang.', mainKeyboard(ctx));
});

bot.catch((error, ctx) => {
  console.error(`Update ${ctx.updateType} failed:`, error);
  if (ctx?.reply) {
    ctx.reply('Texnik xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.').catch(() => {});
  }
});

bot.launch()
  .then(() => console.log('Bot ishga tushdi.'))
  .catch((error) => {
    console.error('Bot launch failed:', error);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));