require('dotenv').config();
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot ishlamoqda...'));
app.listen(process.env.PORT || 3000);
const fs = require('node:fs');
const path = require('node:path');
const { Telegraf, Markup, session } = require('telegraf');

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN is missing. Copy .env.example to .env and add the token.');
}

const bot = new Telegraf(token);
const dataPath = path.join(__dirname, 'data.json');
const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : { users: {} };
const ADMIN_USERNAME = 'habibullayev_28';
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
  languageSaved: { uz: '✅ Til saqlandi.', en: '✅ Language saved.', ru: '✅ Язык сохранён.', ar: '✅ تم حفظ اللغة.', tr: '✅ Dil kaydedildi.', zh: '✅ 语言已保存。', ko: '✅ 언어가 저장되었습니다.', tg: '✅ Забон нигоҳ дошта шуд.' }
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
  tr: { '➕ Kanal qo\'shish': '➕ Kanal ekle', '✍️ Post yaratish': '✍️ Gönderi oluştur', '🗑 Kanalni o\'chirish': '🗑 Kanalı sil', '⬅️ Orqaga': '⬅️ Geri', '🔗 Havolali tugma qo\'shish': '🔗 URL butonu ekle', '✅ Postni yuborish': '✅ Gönderiyi yayınla', '❌ Bekor qilish': '❌ İptal', '🔵 Ko\'k': '🔵 Mavi', '🟢 Yashil': '🟢 Yeşil', '🔴 Qizil': '🔴 Kırmızı', '📊 Statistika': '📊 İstatistik', '📣 Barchaga post yuborish': '📣 Herkese gönder', '📢 Majburiy obunani sozlash': '📢 Zorunlu abonelik', '❌ Majburiy obunani o\'chirish': '❌ Aboneliği kapat', '📢 Kanalga obuna bo\'lish': '📢 Kanala abone ol', '✅ Obunani tekshirish': '✅ Aboneliği kontrol et' },
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
  if (!data.users[key]) data.users[key] = { channels: [], language: null };
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
  const keyboard = [[tr(ctx, 'channels'), tr(ctx, 'addChannel')], [tr(ctx, 'settings')]];
  if (isAdmin(ctx)) keyboard.push([tr(ctx, 'admin')]);
  return Markup.keyboard(keyboard).resize();
}

function adminKeyboard(ctx) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(localizeReply(ctx, '📊 Statistika'), 'admin:stats')],
    [Markup.button.callback(localizeReply(ctx, '📣 Barchaga post yuborish'), 'admin:broadcast')],
    [Markup.button.callback(localizeReply(ctx, '📢 Majburiy obunani sozlash'), 'admin:subscription')],
    [Markup.button.callback(localizeReply(ctx, '❌ Majburiy obunani o\'chirish'), 'admin:subscription_off')]
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
  const channel = data.settings?.requiredChannel;
  if (!channel || isAdmin(ctx)) return true;
  try {
    const member = await ctx.telegram.getChatMember(channel.id, ctx.from.id);
    if (['creator', 'administrator', 'member'].includes(member.status)) return true;
  } catch (error) {
    console.error('Subscription check failed:', error.response?.description || error.message);
  }

  const subscriptionText = { uz: `Botdan foydalanish uchun ${channel.title} kanaliga obuna bo\'ling.`, en: `Subscribe to ${channel.title} to use the bot.`, ru: `Подпишитесь на ${channel.title}, чтобы пользоваться ботом.`, tr: `Botu kullanmak için ${channel.title} kanalına abone olun.`, ar: `اشترك في ${channel.title} لاستخدام البوت.`, zh: `请订阅 ${channel.title} 后使用机器人。`, ko: `${channel.title} 채널을 구독해야 봇을 사용할 수 있습니다.`, tg: `Барои истифодаи бот ба канали ${channel.title} обуна шавед.` };
  await ctx.reply(subscriptionText[userLanguage(ctx)] || subscriptionText.uz, subscriptionKeyboard(ctx, channel));
  return false;
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

async function broadcastPost(ctx, post) {
  const recipients = new Set(Object.keys(data.users || {}));
  for (const account of Object.values(data.users || {})) {
    for (const channel of account.channels || []) recipients.add(String(channel.id));
  }
  if (data.settings.requiredChannel) recipients.add(String(data.settings.requiredChannel.id));

  const buttons = post.finalButtons || postButtons(post);
  const replyMarkup = Markup.inlineKeyboard(buttons).reply_markup;
  let sent = 0;
  for (const chatId of recipients) {
    try {
      if (data.settings.requiredChannel && Number(chatId) > 0) {
        const member = await ctx.telegram.getChatMember(data.settings.requiredChannel.id, Number(chatId));
        if (!['creator', 'administrator', 'member'].includes(member.status)) continue;
      }
      if (post.photo) {
        await ctx.telegram.sendPhoto(chatId, post.photo, {
          caption: post.caption || undefined,
          caption_entities: post.caption ? post.captionEntities : undefined,
          reply_markup: replyMarkup
        });
      } else {
        await ctx.telegram.sendMessage(chatId, post.caption || ' ', { reply_markup: replyMarkup, entities: post.captionEntities || undefined });
      }
      sent += 1;
    } catch (error) {
      console.error(`Broadcast to ${chatId} failed:`, error.response?.description || error.message);
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
    userData(ctx.from.id);
    saveData();
  }
  const originalReply = ctx.reply.bind(ctx);
  ctx.reply = (message, ...args) => originalReply(localizeReply(ctx, message), ...args);
  const callbackData = ctx.callbackQuery?.data;
  const isStart = ctx.message?.text === '/start';
  const isSettings = ctx.message?.text === '/settings';
  if (isStart || isSettings || callbackData?.startsWith('language:') || callbackData === 'check_subscription' || isAdmin(ctx)) return next();
  if (await requiredSubscription(ctx)) return next();
});

bot.start((ctx) => {
  const account = userData(ctx.from.id);
  saveData();
  reset(ctx);
  if (!account.language) return ctx.reply(tr(ctx, 'welcome'), languageKeyboard());
  ctx.reply('Assalomu alaykum! Kanal postlarini boshqarish botiga xush kelibsiz.', mainKeyboard(ctx));
});

bot.action(/^language:(uz|en|ru|ar|tr|zh|ko|tg)$/, async (ctx) => {
  await ctx.answerCbQuery();
  userData(ctx.from.id).language = ctx.match[1];
  saveData();
  reset(ctx);
  return ctx.reply(tr(ctx, 'languageSaved'), mainKeyboard(ctx));
});

bot.command('settings', (ctx) => ctx.reply(tr(ctx, 'welcome'), languageKeyboard()));

bot.command('channels', showChannels);

// --- ESKI MA'LUMOTLARNI YUKLAB OLISH BUYRUG'I ---
bot.command('backup', async (ctx) => {
  if (ctx.from.username !== ADMIN_USERNAME) {
    return ctx.reply("Ruxsat yo'q.");
  }
  try {
    if (fs.existsSync(dataPath)) {
      await ctx.replyWithDocument({ source: dataPath, filename: 'data.json' });
    } else {
      ctx.reply("Hozircha ma'lumotlar bazasi bo'sh.");
    }
  } catch (error) {
    ctx.reply("Xatolik: " + error.message);
  }
});

bot.hears(Object.values(text.channels), showChannels);
bot.hears(Object.values(text.addChannel), (ctx) => {
  ctx.session = { step: 'channel' };
  ctx.reply('Kanal username sini yuboring, masalan: @my_channel');
});

bot.hears(Object.values(text.settings), (ctx) => ctx.reply(tr(ctx, 'welcome'), languageKeyboard()));

bot.hears(Object.values(text.admin), (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  return ctx.reply('🛠 Admin panel', adminKeyboard(ctx));
});

bot.action('check_subscription', async (ctx) => {
  await ctx.answerCbQuery();
  if (await requiredSubscription(ctx)) return;
  return ctx.reply('✅ Obuna tasdiqlandi. Botdan foydalanishingiz mumkin.', mainKeyboard(ctx));
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

bot.action('admin:subscription_off', async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
  data.settings.requiredChannel = undefined;
  saveData();
  return ctx.reply('✅ Majburiy obuna o\'chirildi.', adminKeyboard(ctx));
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
  return ctx.reply('Post uchun rasm yuboring.');
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
  if (!selectedChannel || !post || !post.photo) return ctx.reply('Post ma\'lumotlari topilmadi.');
  const buttons = ctx.session.previewButtons || postButtons(post);
  const replyMarkup = Markup.inlineKeyboard(buttons).reply_markup;
  await ctx.telegram.sendPhoto(selectedChannel.id, post.photo, {
    caption: post.caption || undefined,
    caption_entities: post.caption ? post.captionEntities : undefined,
    reply_markup: replyMarkup
  });
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

  if (sessionState.step === 'required_subscription_channel') {
    if (!isAdmin(ctx)) return ctx.reply('Ruxsat yo\'q.');
    try {
      data.settings.requiredChannel = await checkRequiredSubscriptionChannel(ctx, normalizeChannel(trimmedText));
      saveData();
      reset(ctx);
      return ctx.reply(`✅ ${data.settings.requiredChannel.title} majburiy obuna kanali qilib sozlandi.`, adminKeyboard(ctx));
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

  return ctx.reply('Kerakli amalni pastki menyudan tanlang.', mainKeyboard(ctx));
});

bot.catch((error, ctx) => {
  console.error(`Update ${ctx.updateType} failed:`, error);
  ctx.reply('Texnik xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.').catch(() => {});
});

bot.launch().then(() => console.log('Bot ishga tushdi.'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));