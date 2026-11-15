/* =====================================================================
   staff · the caregiver's tablet app (view "staff")
   Arrivals, multi-select marks (food · sleep · diaper · photo), allergy
   alerts, parents' inbox with trusted pick-up check, incident reports and
   the end-of-day "summaries fly to every parent's phone" moment.
   All data is fictional (App.data.kids) and marked as an example.
   ===================================================================== */
const A = window.App;
const { $, $$, esc, icon, t } = A;

/* ---------- constants ---------- */
const KIDS = A.data.kids;
const KID_IDX = {}; KIDS.forEach((k, i) => { KID_IDX[k.id] = i; });
const G = { noa: 'f', itai: 'm', daniel: 'm', maya: 'f', yonatan: 'm', tamar: 'f', misha: 'm', lia: 'f', omer: 'm', sofia: 'f', ariel: 'm', shira: 'f', eitan: 'm', alisa: 'f' };
const RU_GEN = { itai: 'Итая', tamar: 'Тамар', sofia: 'Софии', noa: 'Ноа', daniel: 'Даниэля', maya: 'Майи', yonatan: 'Йонатана', misha: 'Миши', lia: 'Лии', omer: 'Омера', ariel: 'Ариэля', shira: 'Ширы', eitan: 'Эйтана', alisa: 'Алисы' };
const SKIN = ['#FFE3D1', '#F6C9A6', '#DFA277', '#B77A52', '#83512F'];
const STEPS = [3, 4, 2, 3, 1, 2, 4, 3, 2, 1, 3, 2, 4, 2];
const T_START = 7 * 60 + 41, T_MAX = 17 * 60 + 55;
const MEALS = ['breakfast', 'lunch', 'snack'];
const MEAL_AT = { breakfast: 8 * 60 + 32, lunch: 12 * 60 + 4, snack: 15 * 60 + 33 };
const MEAL_IC = { breakfast: 'sun', lunch: 'plate', snack: 'apple' };
const AMTS = ['all', 'half', 'little'];
const DIAPERS = [['wet', 'drop'], ['full', 'diaper'], ['dry', 'check']];
const mqDevice = matchMedia('(min-width: 1024px)');
const DEV_W = 1032, DEV_H = 712;

/* ---------- small helpers ---------- */
const pad = n => String(n).padStart(2, '0');
const hm = m => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
const dur = m => Math.floor(m / 60) + ':' + pad(m % 60);
const lang = () => A.i18n.lang;
const kid = id => A.data.kid(id);
const nm = id => A.kidName(id);
const g = id => G[id] || 'm';
const tg = (key, id, vars) => t(key + '.' + g(id), vars);
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
const sic = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true" focusable="false"><use href="#st-i-${name}"/></svg>`;
const reduced = () => A.motion.reduced;
const isDevice = () => mqDevice.matches;
const touring = () => document.documentElement.classList.contains('is-touring');
const restart = (el, cls) => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function pluralRu(n, f) { const a = n % 10, b = n % 100; return f[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 1 : 2]; }
function kidsN(n, lg = lang()) { return lg === 'ru' ? `${n} ${pluralRu(n, ['ребёнок', 'ребёнка', 'детей'])}` : `${n} ילדים`; }
function joinNames(arr, lg = lang()) {
  if (arr.length <= 1) return arr[0] || '';
  const last = arr[arr.length - 1], head = arr.slice(0, -1).join(', ');
  return lg === 'ru' ? `${head} и ${last}` : `${head} ו${last}`;
}
const who = ids => (ids.length <= 3 ? joinNames(ids.map(nm)) : kidsN(ids.length));
const famN = n => (lang() === 'ru' ? `${n} ${pluralRu(n, ['семья', 'семьи', 'семей'])}` : `${n} משפחות`);
const dateStr = (lg, d) => { try { return new Intl.DateTimeFormat(lg === 'ru' ? 'ru-RU' : 'he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(d); } catch (e) { return ''; } };
const lc = txt => (lang() === 'ru' ? txt.toLowerCase() : txt);
const dirOf = lg => (lg === 'ru' ? 'ltr' : 'rtl');
/* Unicode isolation for user-typed text inside a sentence of another direction */
const iso = txt => '\u2068' + txt + '\u2069';
const now = () => performance.now();
function today() { const d = new Date(); if (d.getDay() === 6) d.setDate(d.getDate() + 1); return d; }

/* ---------- i18n ---------- */
const I18N = {
  he: {
    'st.tabletMode': 'מצב טאבלט', 'st.role': 'מטפלת בוגרים', 'st.roleS': 'מטפלת בוגרים', 'st.group': 'קבוצת בוגרים',
    'st.synced': 'מסונכרן', 'st.syncing': 'שומר…', 'st.side': 'חשוב היום ויומן',
    'st.stat.present': 'נוכחים', 'st.stat.sleep': 'ישנים', 'st.stat.meal': 'ארוחה',
    'st.btn.inbox': 'הודעות מההורים', 'st.btn.inboxS': 'הודעות', 'st.btn.photo': 'צילום', 'st.btn.incident': 'דיווח אירוע', 'st.btn.incidentS': 'אירוע', 'st.btn.eod': 'סיום יום',
    'st.mode.label': 'מצב עבודה', 'st.mode.arrive': 'הגעה', 'st.mode.select': 'בחירה', 'st.allPresent': 'כל הנוכחים',
    'st.hint.arrive': 'נגיעה בילד מסמנת הגעה. נגיעה נוספת מבטלת.', 'st.hint.select': 'בוחרים כמה ילדים ומסמנים לכולם יחד.',
    'st.grid': 'הילדים בקבוצה',
    'st.notYet.f': 'עוד לא הגיעה', 'st.notYet.m': 'עוד לא הגיע',
    'st.arrived.f': 'הגיעה ב-{t}', 'st.arrived.m': 'הגיע ב-{t}',
    'st.asleep.f': 'ישנה עכשיו', 'st.asleep.m': 'ישן עכשיו',
    'st.needArrive.f': '{name} עוד לא הגיעה. קודם מסמנים הגעה.', 'st.needArrive.m': '{name} עוד לא הגיע. קודם מסמנים הגעה.',
    'st.allergy': 'אלרגיה ל{a}', 'st.bday': 'מחר יום הולדת',
    'st.si.sleep': 'שינה {d}', 'st.si.diaper': 'החתלות: {n}', 'st.si.photo': 'נשלחה תמונה להורים', 'st.si.pickup': 'סבתא לודה אוספת היום', 'st.si.incident': 'נשלח דיווח אירוע',
    'st.bar.label': 'פעולות לילדים שנבחרו', 'st.bar.n': '{n} נבחרו', 'st.bar.clear': 'ניקוי הבחירה', 'st.bar.back': 'חזרה',
    'st.act.food': 'אוכל', 'st.act.sleep': 'שינה', 'st.act.diaper': 'החתלה', 'st.act.photo': 'צילום',
    'st.meal.breakfast': 'בוקר', 'st.meal.lunch': 'צהריים', 'st.meal.snack': 'מנחה',
    'st.q.meal': 'איזו ארוחה?', 'st.q.amt': '{meal} · כמה אכלו?', 'st.q.sleep': 'שינה · {who}', 'st.q.diaper': 'החתלה · איך היה?',
    'st.amt.all': 'הכל', 'st.amt.half': 'חצי', 'st.amt.little': 'מעט',
    'st.sleep.start': 'נרדמו', 'st.sleep.stop': 'התעוררו',
    'st.sleep.start1.f': 'נרדמה', 'st.sleep.start1.m': 'נרדם', 'st.sleep.stop1.f': 'התעוררה', 'st.sleep.stop1.m': 'התעורר',
    'st.t.wokeOne.f': '{name} התעוררה', 'st.t.wokeOne.m': '{name} התעורר',
    'st.dia.wet': 'רטוב', 'st.dia.full': 'מלא', 'st.dia.dry': 'יבש',
    'st.t.sleepStart': 'שינה נעימה · {who}', 'st.t.sleepStop': 'התעוררו · {who}',
    'st.al.a11y': 'התראת אלרגיה', 'st.al.title': 'שימו לב', 'st.al.sub': 'בודקים שהמנה מתאימה לפני שמגישים.',
    'st.al.ok': 'בדקתי, המנה בטוחה', 'st.al.cancel': 'ביטול', 'st.al.checked': 'אלרגיות נבדקו',
    'st.cam.title': 'צילום', 'st.cam.shoot': 'צילום', 'st.cam.live': 'החצר, עכשיו', 'st.cam.tip': 'מצלמים, ואז מסמנים מי בתמונה',
    'st.cam.who': 'מי בתמונה?', 'st.cam.private': 'יישלח רק להורים שלהם. לא לקבוצות.',
    'st.cam.send': 'שליחה ל-{n}', 'st.cam.sendOne': 'שליחה למשפחה אחת', 'st.cam.need': 'מסמנים לפחות ילד אחד', 'st.cam.retake': 'צילום חוזר',
    'st.cam.sent': 'נשלח רק להורים של {names}',
    'st.in.title': 'הודעות מההורים', 'st.in.sub': 'הודעות ברוסית מתורגמות אוטומטית', 'st.in.back': 'כל ההודעות', 'st.in.done': 'טופל',
    'st.in.trHe': 'תורגם מרוסית', 'st.in.trRu': 'תרגום לרוסית', 'st.in.pickup': 'איסוף היום',
    'st.in.check': 'בדיקה מול רשימת המורשים', 'st.in.checking': 'בודקים ברשימה…', 'st.in.list': 'מורשים לאסוף את דניאל',
    'st.in.match': 'נמצאה ברשימה', 'st.in.approve': 'אישור ושליחת תשובה', 'st.in.sentRu': 'נשלח ברוסית', 'st.in.sentHe': 'נשלח בעברית',
    'st.in.orig': 'במקור: {text}', 'st.in.quick': 'תשובה מהירה', 'st.in.toast': 'התשובה נשלחה ל{who}', 'st.in.handled': 'טופל והתשובה נשלחה',
        'st.inc.title': 'דיווח אירוע', 'st.inc.who': 'מי?', 'st.inc.what': 'מה קרה?', 'st.inc.aid': 'מה עשינו?', 'st.inc.when': 'מתי?',
    'st.inc.note': 'כמה מילים להורים', 'st.inc.notePh': 'לא חובה', 'st.inc.earlier': 'מוקדם יותר', 'st.inc.later': 'מאוחר יותר',
    'st.inc.preview': 'תצוגה מקדימה', 'st.inc.need': 'בוחרים ילד ומה קרה', 'st.inc.needKid': 'בוחרים את הילד', 'st.inc.needWhat': 'בוחרים מה קרה', 'st.inc.to': 'למי זה נשלח',
    'st.inc.toParents': 'ההורים של {name} · {lang}', 'st.inc.toOwner': 'המנהלת · בעברית', 'st.inc.lang.he': 'בעברית', 'st.inc.lang.ru': 'ברוסית',
    'st.inc.edit': 'עריכה', 'st.inc.send': 'שליחה להורים ולמנהלת', 'st.inc.sent': 'הדיווח נשלח',
    'st.inc.capParents': 'ההורים', 'st.inc.capOwner': 'המנהלת', 'st.inc.close': 'סגירה',
    'st.eod.title': 'סיום יום', 'st.eod.writing': 'המערכת כותבת סיכומים', 'st.eod.sub': 'מהסימונים של היום, לכל משפחה בשפה שלה',
    'st.eod.ready': 'הסיכומים מוכנים', 'st.eod.readySub': 'אפשר לפתוח כל שורה ולקרוא לפני השליחה',
    'st.eod.send': 'שלח לכולם', 'st.eod.sending': 'שולחים להורים…', 'st.eod.sentSub': 'כל משפחה מקבלת סיכום לטלפון',
    'st.eod.done': 'כל המשפחות קיבלו סיכום', 'st.eod.doneSub': '{he} בעברית, {ru} ברוסית. כל משפחה בשפה שלה.',
    'st.eod.tap': 'נגיעה בטלפון מציגה את ההודעה', 'st.eod.close': 'סגירה', 'st.eod.inUi': 'בעברית:',
    'st.eod.sentN': 'נשלחו',
    'st.lang.he': 'עב', 'st.lang.ru': 'RU', 'st.lang.heA': 'יישלח בעברית', 'st.lang.ruA': 'יישלח ברוסית', 'st.lang.heL': 'בעברית', 'st.lang.ruL': 'ברוסית',
    'st.rem.title': 'חשוב היום', 'st.rem.bday': 'מחר יום הולדת ל{name}', 'st.rem.bdaySub.m': 'אפשר להכין משהו קטן לכבודו', 'st.rem.bdaySub.f': 'אפשר להכין משהו קטן לכבודה', 'st.rem.allergy': 'אלרגיות בקבוצה',
    'st.log.title': 'יומן היום', 'st.log.empty': 'כל סימון של היום יופיע כאן',
    'st.log.arrive.f': '{name} הגיעה', 'st.log.arrive.m': '{name} הגיע', 'st.log.unarrive': 'ההגעה של {name} בוטלה', 'st.log.more': 'הגיעו עוד {who}',
    'st.log.meal': '{meal}: {amt} · {who}', 'st.log.sleepStart': 'נרדמו: {who}', 'st.log.sleepStop': 'התעוררו: {who}',
    'st.log.diaper': 'החתלה ({type}): {who}', 'st.log.photo': 'תמונה להורים של {who}', 'st.log.pickup': 'סבתא לודה אוספת את דניאל · אושר',
    'st.log.reply': 'נשלחה תשובה ל{who}', 'st.log.incident': 'דיווח אירוע: {name}', 'st.log.eod': 'סיכומי יום נשלחו ל-{n} משפחות'
  },
  ru: {
    'st.tabletMode': 'Режим планшета', 'st.role': 'Воспитательница старшей группы', 'st.roleS': 'воспитательница', 'st.group': 'Старшая группа',
    'st.synced': 'Сохранено', 'st.syncing': 'Сохраняем…', 'st.side': 'Важно сегодня и журнал',
    'st.stat.present': 'Пришли', 'st.stat.sleep': 'Спят', 'st.stat.meal': 'Еда',
    'st.btn.inbox': 'Сообщения от родителей', 'st.btn.inboxS': 'Сообщения', 'st.btn.photo': 'Фото', 'st.btn.incident': 'Отчёт о происшествии', 'st.btn.incidentS': 'Отчёт', 'st.btn.eod': 'Конец дня',
    'st.mode.label': 'Режим работы', 'st.mode.arrive': 'Приход', 'st.mode.select': 'Выбор', 'st.allPresent': 'Все пришедшие',
    'st.hint.arrive': 'Одно касание отмечает приход, второе отменяет.', 'st.hint.select': 'Выберите несколько детей и отметьте всех сразу.',
    'st.grid': 'Дети группы',
    'st.notYet.f': 'ещё не пришла', 'st.notYet.m': 'ещё не пришёл',
    'st.arrived.f': 'пришла в {t}', 'st.arrived.m': 'пришёл в {t}',
    'st.asleep.f': 'сейчас спит', 'st.asleep.m': 'сейчас спит',
    'st.needArrive.f': '{name} ещё не пришла. Сначала отметьте приход.', 'st.needArrive.m': '{name} ещё не пришёл. Сначала отметьте приход.',
    'st.allergy': 'аллергия: {a}', 'st.bday': 'завтра день рождения',
    'st.si.sleep': 'сон {d}', 'st.si.diaper': 'подгузники: {n}', 'st.si.photo': 'фото отправлено родителям', 'st.si.pickup': 'сегодня забирает бабушка Люда', 'st.si.incident': 'отправлен отчёт о происшествии',
    'st.bar.label': 'Действия для выбранных детей', 'st.bar.n': 'Выбрано: {n}', 'st.bar.clear': 'Снять выбор', 'st.bar.back': 'Назад',
    'st.act.food': 'Еда', 'st.act.sleep': 'Сон', 'st.act.diaper': 'Подгузник', 'st.act.photo': 'Фото',
    'st.meal.breakfast': 'Завтрак', 'st.meal.lunch': 'Обед', 'st.meal.snack': 'Полдник',
    'st.q.meal': 'Что едим?', 'st.q.amt': '{meal}: сколько съели?', 'st.q.sleep': 'Сон: {who}', 'st.q.diaper': 'Подгузник: какой?',
    'st.amt.all': 'Всё', 'st.amt.half': 'Половину', 'st.amt.little': 'Немного',
    'st.sleep.start': 'Уснули', 'st.sleep.stop': 'Проснулись',
    'st.sleep.start1.f': 'Уснула', 'st.sleep.start1.m': 'Уснул', 'st.sleep.stop1.f': 'Проснулась', 'st.sleep.stop1.m': 'Проснулся',
    'st.t.wokeOne.f': '{name} проснулась', 'st.t.wokeOne.m': '{name} проснулся',
    'st.dia.wet': 'Мокрый', 'st.dia.full': 'Грязный', 'st.dia.dry': 'Сухой',
    'st.t.sleepStart': 'Сладкого сна · {who}', 'st.t.sleepStop': 'Проснулись · {who}',
    'st.al.a11y': 'Предупреждение об аллергии', 'st.al.title': 'Внимание', 'st.al.sub': 'Проверьте блюдо, прежде чем подавать.',
    'st.al.ok': 'Проверила, можно подавать', 'st.al.cancel': 'Отмена', 'st.al.checked': 'аллергии проверены',
    'st.cam.title': 'Фото', 'st.cam.shoot': 'Снять', 'st.cam.live': 'Двор, сейчас', 'st.cam.tip': 'Снимите, потом отметьте, кто на фото',
    'st.cam.who': 'Кто на фото?', 'st.cam.private': 'Отправится только их родителям, не в\u00a0общий чат.',
    'st.cam.send': 'Отправить: {n}', 'st.cam.sendOne': 'Отправить одной семье', 'st.cam.need': 'Отметьте хотя бы одного ребёнка', 'st.cam.retake': 'Переснять',
    'st.cam.sent': 'Фото ушло только родителям: {names}',
    'st.in.title': 'Сообщения от родителей', 'st.in.sub': 'Сообщения на русском переводятся автоматически', 'st.in.back': 'Все сообщения', 'st.in.done': 'Готово',
    'st.in.trHe': 'Перевод на иврит для команды', 'st.in.trRu': 'Перевод с иврита', 'st.in.pickup': 'Забирают сегодня',
    'st.in.check': 'Проверить по списку доверенных', 'st.in.checking': 'Проверяем список…', 'st.in.list': 'Могут забирать Даниэля',
    'st.in.match': 'Есть в списке', 'st.in.approve': 'Подтвердить и ответить', 'st.in.sentRu': 'Отправлено по-русски', 'st.in.sentHe': 'Отправлено на иврите',
    'st.in.orig': 'Оригинал: {text}', 'st.in.quick': 'Быстрый ответ', 'st.in.toast': 'Ответ отправлен: {who}', 'st.in.handled': 'Готово, ответ отправлен',
        'st.inc.title': 'Отчёт о происшествии', 'st.inc.who': 'Кто?', 'st.inc.what': 'Что случилось?', 'st.inc.aid': 'Что сделали?', 'st.inc.when': 'Когда?',
    'st.inc.note': 'Пара слов родителям', 'st.inc.notePh': 'Необязательно', 'st.inc.earlier': 'Раньше', 'st.inc.later': 'Позже',
    'st.inc.preview': 'Предпросмотр', 'st.inc.need': 'Выберите ребёнка и что случилось', 'st.inc.needKid': 'Выберите ребёнка', 'st.inc.needWhat': 'Выберите, что случилось', 'st.inc.to': 'Кому уйдёт',
    'st.inc.toParents': 'Родители: {name} · {lang}', 'st.inc.toOwner': 'Заведующая · на иврите', 'st.inc.lang.he': 'на\u00a0иврите', 'st.inc.lang.ru': 'по-русски',
    'st.inc.edit': 'Изменить', 'st.inc.send': 'Отправить отчёт', 'st.inc.sent': 'Отчёт отправлен',
    'st.inc.capParents': 'Родители', 'st.inc.capOwner': 'Заведующая', 'st.inc.close': 'Закрыть',
    'st.eod.title': 'Конец дня', 'st.eod.writing': 'Система пишет сводки', 'st.eod.sub': 'По отметкам за день, каждой семье на её языке',
    'st.eod.ready': 'Сводки готовы', 'st.eod.readySub': 'Нажмите на строку, чтобы прочитать перед отправкой',
    'st.eod.send': 'Отправить всем', 'st.eod.sending': 'Отправляем родителям…', 'st.eod.sentSub': 'Каждая семья получает сводку на телефон',
    'st.eod.done': 'Все семьи получили сводку', 'st.eod.doneSub': '{he} на иврите, {ru} по-русски. Каждой семье на её языке.',
    'st.eod.tap': 'Нажмите на телефон, чтобы прочитать', 'st.eod.close': 'Закрыть', 'st.eod.inUi': 'По-русски:',
    'st.eod.sentN': 'отправлено',
    'st.lang.he': 'עב', 'st.lang.ru': 'RU', 'st.lang.heA': 'уйдёт на иврите', 'st.lang.ruA': 'уйдёт по-русски', 'st.lang.heL': 'на иврите', 'st.lang.ruL': 'по-русски',
    'st.rem.title': 'Важно сегодня', 'st.rem.bday': '{name}: завтра день рождения', 'st.rem.bdaySub.m': 'Можно подготовить маленький сюрприз', 'st.rem.bdaySub.f': 'Можно подготовить маленький сюрприз', 'st.rem.allergy': 'Аллергии в группе',
    'st.log.title': 'Журнал дня', 'st.log.empty': 'Здесь появятся все отметки за день',
    'st.log.arrive.f': '{name} пришла', 'st.log.arrive.m': '{name} пришёл', 'st.log.unarrive': 'Приход отменён: {name}', 'st.log.more': 'Пришли ещё: {who}',
    'st.log.meal': '{meal}: {amt} · {who}', 'st.log.sleepStart': 'Уснули: {who}', 'st.log.sleepStop': 'Проснулись: {who}',
    'st.log.diaper': 'Подгузник ({type}): {who}', 'st.log.photo': 'Фото родителям: {who}', 'st.log.pickup': 'Даниэля забирает бабушка Люда · подтверждено',
    'st.log.reply': 'Ответ отправлен: {who}', 'st.log.incident': 'Отчёт о происшествии: {name}', 'st.log.eod': 'Сводки дня отправлены семьям: {n}'
  }
};

/* ---------- end-of-day summary language (always in the family's language) ---------- */
const SUM = {
  he: {
    hi: 'ערב טוב!',
    arrive: { f: '{name} הגיעה ב-{t}.', m: '{name} הגיע ב-{t}.' },
    ate: { f: 'אכלה', m: 'אכל' },
    amt: { all: 'הכל', half: 'חצי מנה', little: 'קצת' },
    at: { breakfast: 'בארוחת הבוקר', lunch: 'בצהריים', snack: 'במנחה' },
    slept: { f: 'ישנה בין {a} ל-{b}.', m: 'ישן בין {a} ל-{b}.' },
    diaper: n => (n === 1 ? 'החלפנו חיתול פעם אחת.' : n === 2 ? 'החלפנו חיתול פעמיים.' : `החלפנו חיתול ${n} פעמים.`),
    photo: n => (n > 1 ? `שלחנו לכם ${n} תמונות מהיום.` : 'שלחנו לכם תמונה מהיום.'),
    incident: 'היום קרה משהו קטן ({what}), ועדכנו אתכם מיד.',
    pickup: 'סבתא לודה אוספת היום, כמו שביקשתם.',
    bye: { f: ['מחכים לה מחר!', 'נתראה מחר!'], m: ['מחכים לו מחר!', 'נתראה מחר!'] },
    bday: { f: 'ומחר חוגגים לה יום הולדת!', m: 'ומחר חוגגים לו יום הולדת!' }
  },
  ru: {
    hi: 'Добрый вечер!',
    arrive: { f: '{name} пришла в {t}.', m: '{name} пришёл в {t}.' },
    ate: { f: 'поела', m: 'поел' },
    amt: { all: 'всё', half: 'половину порции', little: 'немного' },
    at: { breakfast: 'на завтрак', lunch: 'на обед', snack: 'на полдник' },
    slept: { f: 'Спала с {a} до {b}.', m: 'Спал с {a} до {b}.' },
    diaper: n => (n === 1 ? 'Подгузник меняли один раз.' : `Подгузник меняли ${n} ${pluralRu(n, ['раз', 'раза', 'раз'])}.`),
    photo: n => (n > 1 ? `Мы прислали вам ${n} фото за день.` : 'Мы прислали вам фото за день.'),
    incident: 'Было небольшое происшествие ({what}), мы сразу вам написали.',
    pickup: 'Сегодня забирает бабушка Люда, как вы и просили.',
    bye: { f: ['Ждём её завтра!', 'До завтра!'], m: ['Ждём его завтра!', 'До завтра!'] },
    bday: { f: 'А завтра у неё день рождения!', m: 'А завтра у него день рождения!' }
  }
};

/* ---------- incident chips (labels needed in both languages at once) ---------- */
const INC_WHAT = [
  ['fall', { he: 'נפילה קלה', ru: 'Лёгкое падение' }], ['bump', { he: 'מכה', ru: 'Ушиб' }], ['scratch', { he: 'שריטה', ru: 'Царапина' }],
  ['sting', { he: 'עקיצה', ru: 'Укус насекомого' }], ['bite', { he: 'נשיכה', ru: 'Укус' }], ['other', { he: 'אחר', ru: 'Другое' }]
];
const INC_AID = [
  ['cold', { he: 'קירור', ru: 'Приложили холод' }], ['wash', { he: 'שטיפה במים', ru: 'Промыли водой' }], ['plaster', { he: 'פלסטר', ru: 'Пластырь' }],
  ['hug', { he: 'חיבוק והרגעה', ru: 'Обняли, успокоили' }], ['none', { he: 'לא היה צורך', ru: 'Помощь не понадобилась' }]
];
const INC = {
  he: { title: 'עדכון מהגן · {name}', what: 'היום ב-{t} קרה משהו קטן: {what}.', aid: 'מה עשינו: {aids}.', none: 'לא היה צורך בטיפול.', calm: { f: '{name} רגועה וחזרה לשחק.', m: '{name} רגוע וחזר לשחק.' } },
  ru: { title: 'Сообщение из сада · {name}', what: 'Сегодня в {t} было небольшое происшествие: {what}.', aid: 'Что сделали: {aids}.', none: 'Помощь не понадобилась.', calm: { f: '{name} уже спокойна и играет.', m: '{name} уже спокоен и играет.' } }
};
const APP_NAME = { he: 'גן סינדרלה', ru: 'Сад «Синдерелла»' };

/* ---------- parents' inbox (fictional) ---------- */
function makeInbox() {
  const tr = A.data.trusted;
  return [
    {
      id: 'daniel', kid: 'daniel', orig: 'ru', time: '07:38', pickup: true,
      from: { he: 'אמא של דניאל · אולגה', ru: 'Мама Даниэля · Ольга' }, short: { he: 'אמא של דניאל', ru: 'мама Даниэля' },
      look: tr.daniel[0].look,
      text: { ru: 'Сегодня Даниэля заберёт бабушка Люда', he: 'היום סבתא לודה תאסוף את דניאל' },
      reply: { he: 'תודה, אולגה! סבתא לודה ברשימת המורשים, נמסור לה את דניאל.', ru: 'Спасибо, Ольга! Бабушка Люда есть в списке доверенных, передадим ей Даниэля.' },
      read: false, stage: 'new', sent: null
    },
    {
      id: 'maya', kid: 'maya', orig: 'ru', time: '07:26',
      from: { he: 'אבא של מאיה', ru: 'Папа Майи' }, short: { he: 'אבא של מאיה', ru: 'папа Майи' },
      look: { adult: true, skin: 0, hair: 'short', hc: 3, bg: 4, shirt: A.SHIRTS.navy },
      text: { ru: 'Доброе утро! Мы забыли дома куртку Майи. Если станет прохладно, можно дать ей запасную?', he: 'בוקר טוב! שכחנו בבית את המעיל של מאיה. אם יתקרר, אפשר לתת לה מעיל רזרבי?' },
      quick: [
        { he: 'בטח, נדאג שיהיה לה חם', ru: 'Конечно, проследим, чтобы ей было тепло.' },
        { he: 'קיבלנו, נעדכן אתכם', ru: 'Поняли, будем на связи.' }
      ],
      read: false, stage: 'new', sent: null
    },
    {
      id: 'noa', kid: 'noa', orig: 'he', time: '06:58',
      from: { he: 'אבא של נועה · רועי', ru: 'Папа Ноа · Рои' }, short: { he: 'אבא של נועה', ru: 'папа Ноа' },
      look: tr.noa[1].look,
      text: { he: 'בוקר טוב! מחר נועה תגיע ב-9:30, יש לנו תור לרופאה.', ru: 'Доброе утро! Завтра Ноа придёт в 9:30, у нас приём у врача.' },
      quick: [
        { he: 'תודה שעדכנתם, נחכה לה', ru: 'Спасибо, что предупредили, будем её ждать.' },
        { he: 'קיבלנו, רשמנו', ru: 'Приняли, записали.' }
      ],
      read: false, stage: 'new', sent: null
    }
  ];
}

/* =====================================================================
   STATE
   ===================================================================== */
let S = null, root = null;
const E = { cards: {}, face: {}, time: {}, st: {}, moon: {}, nm: {}, al: {} };
const open = new Set();
let tickId = 0, minId = 0, syncT = 0, active = false, entered = false, tourCtx = false;

function newKid() { return { arrived: null, meals: {}, sleep: null, sleeps: [], diapers: [], photos: 0, pickup: null, incident: null }; }
function fresh() {
  S = { clock: T_START, step: 0, mode: 'arrive', sel: new Set(), kids: {}, inbox: makeInbox(), log: [], lastMeal: null, bar: 'root', meal: null, checked: false, sentAt: null };
  KIDS.forEach(k => { S.kids[k.id] = newKid(); });
}
/* first visit: a morning already in motion (reset() gives the empty morning for the tour) */
function seedMorning() {
  [['yonatan', 22], ['lia', 26], ['shira', 29], ['omer', 33], ['alisa', 36], ['ariel', 39]].forEach(([id, m]) => {
    const tm = 7 * 60 + m; S.kids[id].arrived = tm;
    S.log.unshift({ t: tm, ic: 'door', txt: () => tg('st.log.arrive', id, { name: nm(id) }) });
  });
  S.clock = 7 * 60 + 44; S.step = 3;
}
const advance = m => { S.clock = Math.min(T_MAX, S.clock + m); };
const atLeast = m => { if (S.clock < m) S.clock = Math.min(T_MAX, m); };
const present = () => KIDS.filter(k => S.kids[k.id].arrived != null).map(k => k.id);
const sleeping = () => KIDS.filter(k => S.kids[k.id].sleep).map(k => k.id);

/* =====================================================================
   RENDER · grid
   ===================================================================== */
function cardHTML(k, i) {
  const al = (k.allergies || []).map(a => A.L(A.data.allergens[a])).join(', ');
  return `<button type="button" class="st-kid" data-kid="${k.id}" style="--i:${i}">
    ${al ? `<span class="st-kid__al" aria-hidden="true">${icon('alert')}<span>${esc(al)}</span></span>` : ''}
    <span class="st-kid__chk" aria-hidden="true">${icon('check')}</span>
    <span class="st-kid__av"><span class="st-kid__face">${A.avatar(k, { label: '' })}</span><span class="st-kid__ring" aria-hidden="true"></span>
      <span class="st-kid__moon" aria-hidden="true">${icon('moon')}<b class="tnum">0:00</b></span></span>
    <span class="st-kid__name"><span class="st-kid__nm"></span>${k.birthdayTomorrow ? `<span class="st-kid__cake" aria-hidden="true">${icon('cake')}</span>` : ''}</span>
    <span class="st-kid__time tnum"></span>
    <span class="st-kid__st" aria-hidden="true"></span>
  </button>`;
}
function buildGrid() {
  const grid = $('[data-st-grid]', root);
  grid.innerHTML = KIDS.map(cardHTML).join('');
  KIDS.forEach(k => {
    const el = $(`.st-kid[data-kid="${k.id}"]`, grid);
    E.cards[k.id] = el; E.face[k.id] = $('.st-kid__face', el); E.time[k.id] = $('.st-kid__time', el);
    E.st[k.id] = $('.st-kid__st', el); E.moon[k.id] = $('.st-kid__moon b', el); E.nm[k.id] = $('.st-kid__nm', el); E.al[k.id] = $('.st-kid__al span', el);
  });
}
function chipsOf(id) {
  const ks = S.kids[id], out = [];
  const lm = MEALS.slice().reverse().find(m => ks.meals[m]);
  if (lm) out.push(['meal', sic('pie-' + ks.meals[lm].amt), `${t('st.meal.' + lm)}: ${lc(t('st.amt.' + ks.meals[lm].amt))}`]);
  if (ks.sleeps.length) { const s = ks.sleeps[ks.sleeps.length - 1]; out.push(['sleep', icon('moon'), t('st.si.sleep', { d: dur(s.end - s.start) })]); }
  if (ks.diapers.length) out.push(['diaper', icon('diaper') + (ks.diapers.length > 1 ? `<b>${ks.diapers.length}</b>` : ''), t('st.si.diaper', { n: ks.diapers.length })]);
  if (ks.photos) out.push(['photo', icon('camera'), t('st.si.photo')]);
  if (ks.pickup) out.push(['pickup', icon('key'), t('st.si.pickup')]);
  if (ks.incident) out.push(['inc', sic('aid'), t('st.si.incident')]);
  return out;
}
function chipsHTML(list, fresh) {
  const show = list.length > 4 ? list.slice(0, 3) : list;
  return show.map(c => `<i class="st-si st-si--${c[0]}${fresh === c[0] ? ' is-new' : ''}" title="${esc(c[2])}">${c[1]}</i>`).join('')
    + (list.length > 4 ? `<i class="st-si st-si--more" dir="ltr">+${list.length - 3}</i>` : '');
}
function paintKid(id, o = {}) {
  const el = E.cards[id]; if (!el) return;
  const ks = S.kids[id], k = kid(id);
  const isIn = ks.arrived != null, isSleep = !!ks.sleep, isSel = S.sel.has(id), selMode = S.mode === 'select';
  el.classList.toggle('is-in', isIn); el.classList.toggle('is-sleep', isSleep); el.classList.toggle('is-sel', isSel);
  el.setAttribute('aria-pressed', String(selMode ? isSel : isIn));
  if (selMode && !isIn) el.setAttribute('aria-disabled', 'true'); else el.removeAttribute('aria-disabled');
  E.nm[id].textContent = nm(id);
  if (E.al[id]) E.al[id].textContent = (k.allergies || []).map(a => A.L(A.data.allergens[a])).join(', ');
  E.time[id].textContent = isIn ? hm(ks.arrived) : tg('st.notYet', id);
  E.time[id].classList.toggle('is-off', !isIn);
  const chips = chipsOf(id);
  E.st[id].innerHTML = chipsHTML(chips, o.fresh);
  if (isSleep) E.moon[id].textContent = dur(Math.max(0, S.clock - ks.sleep.start));
  const parts = [nm(id), isIn ? tg('st.arrived', id, { t: hm(ks.arrived) }) : tg('st.notYet', id)];
  if (isSleep) parts.push(tg('st.asleep', id) + ' ' + dur(Math.max(0, S.clock - ks.sleep.start)));
  if (k.allergies) parts.push(t('st.allergy', { a: k.allergies.map(a => A.L(A.data.allergens[a])).join(', ') }));
  if (k.birthdayTomorrow) parts.push(t('st.bday'));
  chips.forEach(c => parts.push(c[2]));
  el.setAttribute('aria-label', parts.join('. '));
  if (o.pop) restart(el, 'is-pop');
}
const paintAllKids = (ids, fresh) => KIDS.forEach(k => paintKid(k.id, ids && ids.includes(k.id) ? { fresh } : {}));

/* ---------- header, stats, mode ---------- */
function bump(el, txt) { if (!el) return; if (el.textContent !== txt) { el.textContent = txt; if (!reduced()) restart(el, 'is-bump'); } }
function paintStats() {
  const p = present().length, sl = sleeping().length;
  bump($('[data-st-v="in"]', root), `${p}/${KIDS.length}`);
  bump($('[data-st-v="sleep"]', root), String(sl));
  const mv = $('[data-st-v="meal"]', root), ml = $('[data-st-l="meal"]', root);
  if (S.lastMeal) { const n = KIDS.filter(k => S.kids[k.id].meals[S.lastMeal]).length; bump(mv, `${n}/${Math.max(p, n)}`); ml.textContent = t('st.meal.' + S.lastMeal); }
  else { bump(mv, '—'); ml.textContent = t('st.stat.meal'); }
  const unread = S.inbox.filter(m => !m.read).length, badge = $('[data-st-badge]', root);
  badge.textContent = unread || ''; badge.classList.toggle('is-zero', !unread);
  const ib = $('[data-st="inbox"]', root);
  ib.setAttribute('aria-label', t('st.btn.inbox') + (unread ? ` (${unread})` : ''));
  paintClock();
}
function paintClock() { $$('[data-st-clock]', root).forEach(el => { el.textContent = hm(S.clock); }); }
function paintHead() { $('[data-st-date]', root).textContent = dateStr(lang(), today()); }
function paintMode() {
  $$('[data-st-mode]', root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.stMode === S.mode)));
  $('[data-st-hint]', root).textContent = t(S.mode === 'arrive' ? 'st.hint.arrive' : 'st.hint.select');
  const chip = $('[data-st="all"]', root); chip.hidden = S.mode !== 'select';
  paintAllChip();
}
function paintAllChip() {
  const p = present(), chip = $('[data-st="all"]', root);
  chip.setAttribute('aria-pressed', String(p.length > 0 && p.every(id => S.sel.has(id))));
}
function sync() {
  $$('[data-st-sync]', root).forEach(el => { el.classList.add('is-busy'); el.lastElementChild.textContent = t('st.syncing'); });
  clearTimeout(syncT);
  syncT = setTimeout(() => $$('[data-st-sync]', root).forEach(el => { el.classList.remove('is-busy'); el.lastElementChild.textContent = t('st.synced'); }), 700);
}
function say(text) { const el = $('[data-st-live]', root); if (!el) return; el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30); }

/* ---------- side rail ---------- */
function renderSide() {
  const bday = KIDS.find(k => k.birthdayTomorrow), allergic = KIDS.filter(k => k.allergies && k.allergies.length);
  $('[data-st-rem]', root).innerHTML =
    (bday ? `<li class="st-rem__i"><span class="st-rem__ic st-rem__ic--bday" aria-hidden="true">${icon('cake')}</span><span class="st-rem__t"><b>${esc(t('st.rem.bday', { name: nm(bday.id) }))}</b>${esc(tg('st.rem.bdaySub', bday.id))}</span></li>` : '') +
    `<li class="st-rem__i"><span class="st-rem__ic st-rem__ic--al" aria-hidden="true">${icon('alert')}</span><span class="st-rem__t"><b>${esc(t('st.rem.allergy'))}</b>
      <ul class="st-rem__al">${allergic.map(k => `<li>${A.avatarEl(k, 22, { label: '' })}<span>${esc(nm(k.id))} · ${esc(k.allergies.map(a => A.L(A.data.allergens[a])).join(', '))}</span></li>`).join('')}</ul></span></li>`;
  renderLog();
}
function renderLog(isNew) {
  const ol = $('[data-st-log]', root);
  if (!S.log.length) { ol.innerHTML = `<li class="st-log__empty">${esc(t('st.log.empty'))}</li>`; return; }
  ol.innerHTML = S.log.slice(0, 30).map((e, i) => `<li class="st-log__i${i === 0 && isNew ? ' is-new' : ''}"><time class="tnum">${hm(e.t)}</time><span class="st-log__ic" aria-hidden="true">${e.ic === 'aid' ? sic('aid') : icon(e.ic)}</span><span>${esc(e.txt())}</span></li>`).join('');
}
function log(ic, txt, tm) { S.log.unshift({ t: tm != null ? tm : S.clock, ic, txt }); renderLog(true); }

/* =====================================================================
   ACTIONS
   ===================================================================== */
function burstKid(id, o = {}) {
  A.fx.burstAt(E.face[id], Object.assign({ count: 12, speed: [90, 230], size: [7, 15], life: [450, 850], gravity: 160, colors: ['magenta', 'gold', 'blue', 'pink'] }, o));
}
function toggleArrive(id) {
  const ks = S.kids[id];
  if (ks.arrived == null) {
    ks.arrived = S.clock; advance(STEPS[S.step++ % STEPS.length]);
    paintKid(id, { pop: true }); burstKid(id); A.haptic(10);
    const tm = ks.arrived;
    log('door', () => tg('st.log.arrive', id, { name: nm(id) }), tm);
    say(`${nm(id)}: ${tg('st.arrived', id, { t: hm(tm) })}`);
  } else {
    ks.arrived = null; ks.sleep = null; S.sel.delete(id);
    paintKid(id);
    log('refresh', () => t('st.log.unarrive', { name: nm(id) }));
    say(`${nm(id)}: ${tg('st.notYet', id)}`);
  }
  paintStats(); sync(); ensureTick();
}
function markAllPresent() {
  const ids = KIDS.filter(k => S.kids[k.id].arrived == null).map(k => k.id);
  if (!ids.length) return;
  ids.forEach((id, i) => {
    S.kids[id].arrived = S.clock; advance(i % 3 === 0 ? 2 : 1);
    if (reduced()) paintKid(id); else setTimeout(() => { paintKid(id, { pop: true }); if (i % 3 === 0) burstKid(id, { count: 6 }); }, i * 45);
  });
  log('users', () => t('st.log.more', { who: kidsN(ids.length) }));
  setTimeout(() => { paintStats(); sync(); }, reduced() ? 0 : ids.length * 45);
}
function nudge(id) {
  const el = E.cards[id]; if (!reduced()) restart(el, 'is-nudge');
  setTimeout(() => el.classList.remove('is-nudge'), 500);
  A.ui.toast(tg('st.needArrive', id, { name: nm(id) }), { icon: 'info' });
}
function toggleSel(id) {
  if (S.kids[id].arrived == null) { nudge(id); return; }
  if (S.sel.has(id)) S.sel.delete(id); else { S.sel.add(id); A.haptic(6); }
  if (!S.sel.size) S.bar = 'root';
  paintKid(id); paintAllChip(); renderBar();
}
function selectAllPresent() {
  const p = present();
  if (!p.length) { A.ui.toast(t('st.hint.arrive'), { icon: 'info' }); return; }
  const all = p.every(id => S.sel.has(id));
  S.sel.clear(); if (!all) p.forEach(id => S.sel.add(id));
  if (!S.sel.size) S.bar = 'root';
  paintAllKids(); paintAllChip(); renderBar();
}
function clearSel() { S.sel.clear(); S.bar = 'root'; S.meal = null; S.checked = false; paintAllKids(); paintAllChip(); renderBar(); }
function setMode(m) {
  if (S.mode === m) return;
  S.mode = m; if (m === 'arrive') { S.sel.clear(); S.bar = 'root'; }
  paintMode(); paintAllKids(); renderBar();
}
function finish(ids, freshType) {
  barOffAt = now();
  S.sel.clear(); S.bar = 'root'; S.meal = null; S.checked = false;
  paintAllKids(ids, freshType); paintAllChip(); renderBar(); paintStats(); sync(); ensureTick();
}
function recordMeal(meal, amt) {
  const ids = [...S.sel]; if (!ids.length) return;
  atLeast(MEAL_AT[meal]); const tm = S.clock; advance(1);
  const checked = S.checked;
  ids.forEach(id => { S.kids[id].meals[meal] = { amt, t: tm, checked }; });
  S.lastMeal = meal;
  const w = ids.slice();
  log('plate', () => t('st.log.meal', { meal: t('st.meal.' + meal), amt: lc(t('st.amt.' + amt)), who: who(w) }) + (checked ? ' · ' + t('st.al.checked') : ''), tm);
  A.ui.toast(`${t('st.meal.' + meal)} · ${lc(t('st.amt.' + amt))} · ${who(ids)}`, { icon: 'check-circle', tone: 'ok' });
  say(`${t('st.meal.' + meal)} · ${lc(t('st.amt.' + amt))} · ${who(ids)}`);
  ids.forEach(id => { if (!reduced()) A.fx.burstAt(E.st[id], { count: 5, speed: [50, 140], size: [5, 11], life: [350, 650], gravity: 120, colors: ['magenta', 'pink', 'gold'] }); });
  finish(ids, 'meal');
}
function sleepStart() {
  const ids = [...S.sel].filter(id => !S.kids[id].sleep); if (!ids.length) return;
  atLeast(12 * 60 + 28);
  ids.forEach(id => { S.kids[id].sleep = { start: S.clock }; });
  const w = ids.slice(), tm = S.clock;
  log('moon', () => t('st.log.sleepStart', { who: who(w) }), tm);
  A.ui.toast(t('st.t.sleepStart', { who: who(ids) }), { icon: 'moon' });
  finish(ids);
}
function sleepStop() {
  const ids = [...S.sel].filter(id => S.kids[id].sleep); if (!ids.length) return;
  ids.forEach(id => { const ks = S.kids[id]; ks.sleeps.push({ start: ks.sleep.start, end: Math.max(S.clock, ks.sleep.start + 1) }); ks.sleep = null; });
  const w = ids.slice(), tm = S.clock;
  log('sun', () => t('st.log.sleepStop', { who: who(w) }), tm);
  A.ui.toast(ids.length === 1 ? tg('st.t.wokeOne', ids[0], { name: nm(ids[0]) }) : t('st.t.sleepStop', { who: who(ids) }), { icon: 'sun', tone: 'ok' });
  finish(ids, 'sleep');
}
function recordDiaper(type) {
  const ids = [...S.sel]; if (!ids.length) return;
  const tm = S.clock; advance(1);
  ids.forEach(id => S.kids[id].diapers.push({ type, t: tm }));
  const w = ids.slice();
  log('diaper', () => t('st.log.diaper', { type: lc(t('st.dia.' + type)), who: who(w) }), tm);
  A.ui.toast(`${t('st.act.diaper')} · ${lc(t('st.dia.' + type))} · ${who(ids)}`, { icon: 'check-circle', tone: 'ok' });
  finish(ids, 'diaper');
}

/* ---------- live sleep timers (1 s = 1 demo minute) ---------- */
function ensureTick() {
  const need = active && sleeping().length > 0;
  if (need && !tickId) tickId = setInterval(tick, 1000);
  if (!need && tickId) { clearInterval(tickId); tickId = 0; }
}
function tick() {
  if (!S || !sleeping().length) { ensureTick(); return; }
  advance(1); paintClock();
  sleeping().forEach(id => { E.moon[id].textContent = dur(Math.max(0, S.clock - S.kids[id].sleep.start)); });
}
/* the tablet clock is alive: one demo minute per real minute while the view is open (nap time runs fast, above) */
function minuteClock(on) {
  clearInterval(minId); minId = 0;
  if (on) minId = setInterval(() => { if (S && !tickId) { advance(1); paintClock(); } }, 60000);
}

/* =====================================================================
   ACTION BAR (two taps: action → option)
   ===================================================================== */
function barItems() {
  const sel = [...S.sel];
  switch (S.bar) {
    case 'food': return MEALS.map(m => ({ id: m, ic: icon(MEAL_IC[m]), label: t('st.meal.' + m), tone: 'meal' }));
    case 'amount': return AMTS.map(a => ({ id: a, ic: sic('pie-' + a), label: t('st.amt.' + a), tone: 'amt' }));
    case 'sleep': {
      const one = sel.length === 1 ? sel[0] : null;
      return [
        { id: 'start', ic: icon('moon'), label: one ? tg('st.sleep.start1', one) : t('st.sleep.start'), tone: 'sleep', off: sel.every(id => S.kids[id].sleep) },
        { id: 'stop', ic: icon('sun'), label: one ? tg('st.sleep.stop1', one) : t('st.sleep.stop'), tone: 'wake', off: !sel.some(id => S.kids[id].sleep) }
      ];
    }
    case 'diaper': return DIAPERS.map(([d, ic]) => ({ id: d, ic: icon(ic), label: t('st.dia.' + d), tone: 'diaper' }));
    default: return [
      { id: 'food', ic: icon('plate'), label: t('st.act.food'), tone: 'food' },
      { id: 'sleep', ic: icon('moon'), label: t('st.act.sleep'), tone: 'sleep' },
      { id: 'diaper', ic: icon('diaper'), label: t('st.act.diaper'), tone: 'diaper' },
      { id: 'photo', ic: icon('camera'), label: t('st.act.photo'), tone: 'photo' }
    ];
  }
}
function barTitle() {
  const n = S.sel.size;
  switch (S.bar) {
    case 'food': return t('st.q.meal');
    case 'amount': return t('st.q.amt', { meal: t('st.meal.' + S.meal) });
    case 'sleep': return t('st.q.sleep', { who: who([...S.sel]) });
    case 'diaper': return t('st.q.diaper');
    default: return t('st.bar.n', { n });
  }
}
let barSig = '', barOffAt = 0, actAt = 0;
function renderBar(force) {
  const bar = $('[data-st-bar]', root); if (!bar) return;
  const on = S.mode === 'select' && S.sel.size > 0;
  bar.classList.toggle('is-on', on); bar.inert = !on; bar.setAttribute('aria-hidden', String(!on));
  root.classList.toggle('st-has-bar', on);
  if (!on) { barSig = ''; return; }
  placeBar();
  const x = $('.st-bar__x', bar), isRoot = S.bar === 'root';
  x.innerHTML = isRoot ? icon('close') : icon('back', 'ic--dir');
  x.setAttribute('aria-label', t(isRoot ? 'st.bar.clear' : 'st.bar.back'));
  const sel = [...S.sel];
  $('.st-bar__avs', bar).innerHTML = sel.slice(0, 3).map(id => A.avatarEl(kid(id), 28, { label: '' })).join('') + (sel.length > 3 ? `<span class="st-bar__more" dir="ltr">+${sel.length - 3}</span>` : '');
  $('.st-bar__title', bar).textContent = barTitle();
  const items = barItems();
  const sig = S.bar + '|' + lang() + '|' + items.map(i => i.id + (i.off ? 0 : 1) + i.label).join(',');
  if (sig === barSig && !force) return;
  /* buttons animate in when the step changes, not when the language switches or the view is re-entered */
  const animate = !barSig.startsWith(S.bar + '|') || force === true;
  barSig = sig;
  $('.st-bar__acts', bar).innerHTML = items.map((it, i) => `<button type="button" class="st-act st-act--${it.tone}" data-act="${it.id}" style="--i:${animate ? i : 0};${animate ? '' : 'animation:none'}"${it.off ? ' disabled' : ''}><span class="st-act__ic" aria-hidden="true">${it.ic}</span><span>${esc(it.label)}</span></button>`).join('');
}
function placeBar() {
  const bar = $('[data-st-bar]', root);
  if (isDevice() || !touring()) { bar.style.removeProperty('--st-bar-b'); return; }
  const cap = $('.tour-cap__card'), capWrap = $('.tour-cap');
  if (!cap || !capWrap || capWrap.hidden) { bar.style.removeProperty('--st-bar-b'); return; }
  const r = cap.getBoundingClientRect();
  bar.style.setProperty('--st-bar-b', Math.round(innerHeight - r.top + 10) + 'px');
}
function setStep(s) { S.bar = s; renderBar(); }
async function onAct(a) {
  switch (S.bar) {
    case 'root':
      if (a === 'photo') openCamera([...S.sel]); else setStep(a);
      break;
    case 'food': {
      S.meal = a; S.checked = false;
      const allergic = [...S.sel].filter(id => (kid(id).allergies || []).length);
      if (allergic.length) { const ok = await allergyAlert(allergic); if (!ok) return; S.checked = true; }
      if (S.sel.size) setStep('amount');
      break;
    }
    case 'amount': recordMeal(S.meal, a); break;
    case 'sleep': if (a === 'start') sleepStart(); else sleepStop(); break;
    case 'diaper': recordDiaper(a); break;
  }
}
function onBarX() {
  if (S.bar === 'root') { clearSel(); return; }
  setStep(S.bar === 'amount' ? 'food' : 'root');
}

/* =====================================================================
   SHEETS
   ===================================================================== */
function sheet(o) {
  const s = A.ui.sheet(Object.assign({}, o, { onClose: r => { open.delete(s); o.onClose && o.onClose(r); } }));
  open.add(s);
  /* a quick double tap on the button that opened the sheet must not land on the fresh backdrop and close it again */
  const t0 = now(), bd = $('.sheet-backdrop', s.root);
  if (bd) bd.addEventListener('click', e => { if (now() - t0 < 500) e.stopPropagation(); });
  return s;
}
function closeSheets() { [...open].forEach(s => s.close('staff')); open.clear(); }

/* ---------- allergy alert ---------- */
function alLine(id) {
  const k = kid(id), lg = lang();
  return k.allergies.map(a => {
    const an = A.data.allergens[a];
    return lg === 'ru' ? `У ${RU_GEN[id] || nm(id)} аллергия на ${an.ru}` : `ל${k.he} אלרגיה ל${an.he}`;
  }).join(lg === 'ru' ? '; ' : '; ');
}
function allergyAlert(ids) {
  return new Promise(res => {
    let done = false;
    const body = A.h(`<div class="st-al" role="alert">
      <span class="st-al__ic" aria-hidden="true">${icon('alert')}</span>
      <p class="st-al__t">${esc(t('st.al.title'))}</p>
      <ul class="st-al__lines">${ids.map(id => `<li>${A.avatarEl(kid(id), 40, { label: '' })}<span>${esc(alLine(id))}</span></li>`).join('')}</ul>
      <p class="st-al__sub">${esc(t('st.al.sub'))}</p>
      <div class="st-al__btns">
        <button type="button" class="btn btn--block st-al__ok" data-al="ok">${icon('check')}<span>${esc(t('st.al.ok'))}</span></button>
        <button type="button" class="btn btn--ghost btn--block" data-al="cancel">${esc(t('st.al.cancel'))}</button>
      </div></div>`);
    const s = sheet({ titleKey: 'st.al.a11y', hideTitle: true, content: body, className: 'st-alert', focus: '[data-al="ok"]',
      onClose: () => { ids.forEach(id => E.cards[id].classList.remove('is-alarm')); if (!done) { done = true; res(false); } } });
    ids.forEach(id => E.cards[id].classList.add('is-alarm'));
    A.haptic(40);
    if (!reduced()) setTimeout(() => restart(body, 'is-shake'), 420);
    body.addEventListener('click', e => {
      const b = e.target.closest('[data-al]'); if (!b || done) return;
      done = true; res(b.dataset.al === 'ok'); s.close('done');
    });
  });
}

/* ---------- camera ---------- */
let sceneSeq = 0;
function figure(k, x, y, i) {
  const look = Object.assign({}, k.look, { bg: 'transparent' });
  const skin = SKIN[look.skin] || SKIN[1];
  const head = A.avatar(look, { label: '' }).replace('<svg viewBox="0 0 64 64"', '<svg x="-26" y="-58" width="52" height="52" viewBox="0 0 64 64"');
  const pose = i % 3;
  const arms = pose === 0
    ? `<path d="M-11-4-23-22M11-4 23-22" stroke="${skin}" stroke-width="7" stroke-linecap="round"/>`
    : pose === 1
      ? `<path d="M-11-2-7 12M11-2 7 12" stroke="${skin}" stroke-width="7" stroke-linecap="round"/>`
      : `<path d="M11-4 21-24M-11-2-18 13" stroke="${skin}" stroke-width="7" stroke-linecap="round"/>`;
  const ball = pose === 1 ? `<g class="st-sc-ball"><circle cx="0" cy="16" r="10" fill="#fff"/><path d="M-10 16a10 10 0 0 1 10-10v20a10 10 0 0 1-10-10Z" fill="#E8048C"/><path d="M0 6a10 10 0 0 1 8.7 5L0 16Z" fill="#01AEF2"/><path d="M0 16 8.7 21A10 10 0 0 1 0 26Z" fill="#FFB547"/></g>` : '';
  return `<g class="st-fig st-fig--${i}" transform="translate(${x} ${y}) scale(1.24)">
    <ellipse cx="0" cy="44" rx="22" ry="5" fill="#1B1A4B" opacity=".1"/>
    <g class="st-fig__b">
      <rect x="-10" y="16" width="8" height="25" rx="4" fill="#2D2B6B"/><rect x="2" y="16" width="8" height="25" rx="4" fill="#2D2B6B"/>
      <ellipse cx="-7" cy="41" rx="6.5" ry="3.6" fill="#E8048C"/><ellipse cx="7" cy="41" rx="6.5" ry="3.6" fill="#E8048C"/>
      <path d="M-17 24C-17 3-11-12 0-12S17 3 17 24Z" fill="${look.shirt}"/>
      ${arms}${head}${ball}
    </g></g>`;
}
function sceneSVG(ids) {
  const gid = 'st-sky' + (++sceneSeq);
  const xs = { 1: [200], 2: [150, 252], 3: [108, 196, 282] }[ids.length] || [108, 196, 282];
  const ys = [190, 184, 192];
  const bunting = [];
  for (let i = 0; i < 13; i++) {
    const tt = .06 + i * .073, u = 1 - tt;
    const x = 2 * u * tt * 200 + tt * tt * 400, y = u * u * 16 + 2 * u * tt * 52 + tt * tt * 16;
    bunting.push(`<path d="M${(x - 7).toFixed(1)} ${y.toFixed(1)}h14l-7 13Z" fill="${['#E8048C', '#01AEF2', '#FFD27A', '#F6B0C6'][i % 4]}"/>`);
  }
  return `<svg class="st-scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDE5FC"/><stop offset=".7" stop-color="#EAF7FE"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#${gid})"/>
    <circle cx="62" cy="64" r="36" fill="#FFD27A" opacity=".35"/><circle cx="62" cy="64" r="22" fill="#FFB547"/>
    <g class="st-sc-cloud"><g fill="#D0EDFD" transform="translate(0 4)"><circle cx="160" cy="62" r="16"/><circle cx="182" cy="52" r="21"/><circle cx="206" cy="62" r="15"/><rect x="146" y="60" width="74" height="18" rx="9"/></g><g fill="#fff"><circle cx="160" cy="62" r="16"/><circle cx="182" cy="52" r="21"/><circle cx="206" cy="62" r="15"/><rect x="146" y="60" width="74" height="18" rx="9"/></g></g>
    <g fill="#fff" opacity=".9"><circle cx="292" cy="96" r="11"/><circle cx="308" cy="89" r="14"/><circle cx="324" cy="97" r="10"/><rect x="284" y="95" width="48" height="12" rx="6"/></g>
    <path d="M0 16Q200 88 400 16" fill="none" stroke="#fff" stroke-width="2"/>${bunting.join('')}
    <path d="M0 206Q90 166 200 194T400 186V300H0Z" fill="#C9EBD7"/>
    <g transform="translate(316 112)">
      <rect x="5" y="44" width="72" height="84" rx="12" fill="#E79AB5"/>
      <rect x="0" y="40" width="72" height="84" rx="12" fill="#F6B0C6"/>
      <path d="M-6 46Q36-6 78 46Z" fill="#E8048C"/>
      <path d="M36 8V-12" stroke="#1B1A4B" stroke-width="2.4" stroke-linecap="round"/><path d="M36-12l15 5-15 5Z" fill="#01AEF2"/>
      <circle cx="36" cy="66" r="9" fill="#FFD27A"/><path d="M36 57v18M27 66h18" stroke="#fff" stroke-width="2"/>
      <path d="M24 124V102a12 12 0 0 1 24 0v22Z" fill="#D1037D"/><circle cx="43" cy="112" r="1.8" fill="#FFD27A"/>
    </g>
    <path d="M0 232Q120 212 250 228T400 224V300H0Z" fill="#9AD9B5"/>
    <path d="M30 292Q170 246 340 274" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 11" opacity=".85"/>
    <g fill="#fff"><circle cx="240" cy="262" r="3"/><circle cx="360" cy="252" r="3"/><circle cx="128" cy="280" r="3"/></g>
    <g fill="#E8048C"><circle cx="240" cy="262" r="1.4"/><circle cx="360" cy="252" r="1.4"/><circle cx="128" cy="280" r="1.4"/></g>
    <g transform="translate(10 246)"><rect x="0" y="8" width="70" height="30" rx="9" fill="#A9733A"/><rect x="0" y="2" width="70" height="30" rx="9" fill="#C98E4A"/><rect x="6" y="7" width="58" height="18" rx="6" fill="#FDE8C8"/><path d="M42 3l3 15h11l3-15Z" fill="#01AEF2"/><path d="M41 3h19" stroke="#0270A8" stroke-width="2.4" stroke-linecap="round"/></g>
    ${ids.map((id, i) => figure(kid(id), xs[i], ys[i], i)).join('')}
  </svg>`;
}
function openCamera(pre = []) {
  const p = present();
  const scene = (pre.length ? pre : p.length ? p : ['noa', 'maya', 'itai']).slice(0, 3);
  const tags = new Set(pre.length ? pre : scene);
  const fromBar = pre.length > 0;
  let sent = false;
  const body = A.h('<div class="st-camwrap"></div>');
  const s = sheet({ titleKey: 'st.cam.title', content: body, className: 'st-cam-sheet' });
  const live = () => {
    body.innerHTML = `<div class="st-vf">
      <div class="st-vf__frame">${sceneSVG(scene)}
        <span class="st-vf__corners" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="st-vf__focus" aria-hidden="true"></span>
        <span class="st-vf__live" aria-hidden="true"><i></i>${esc(t('st.cam.live'))}</span>
        <span class="st-vf__flash" aria-hidden="true"></span>
      </div>
      <div class="st-vf__ctrl">
        <span class="st-vf__zoom" dir="ltr" aria-hidden="true">1×</span>
        <button type="button" class="st-shutter" data-cam="shoot" aria-label="${esc(t('st.cam.shoot'))}"><i></i></button>
        <span class="st-vf__tip">${esc(t('st.cam.tip'))}</span>
      </div></div>`;
  };
  const tagView = () => {
    const kidsList = p.length ? p : KIDS.map(k => k.id);
    scene.forEach(id => { if (!kidsList.includes(id)) kidsList.unshift(id); });
    body.innerHTML = `<div class="st-tagstage">
      <div class="st-snapwrap"><div class="st-snap">${sceneSVG(scene)}</div></div>
      <p class="st-q">${esc(t('st.cam.who'))}</p>
      <div class="chips st-tagchips">${kidsList.map(id => `<button type="button" class="chip st-tag" data-tag="${id}" aria-pressed="${tags.has(id)}">${A.avatarEl(kid(id), 32, { label: '' })}<span>${esc(nm(id))}</span></button>`).join('')}</div>
      <p class="st-private">${icon('lock')}<span>${esc(t('st.cam.private'))}</span></p>
      <div class="st-foot"><p class="st-need" aria-live="polite" data-need></p>
        <div class="st-actions st-actions--cam"><button type="button" class="btn btn--ghost btn--icon" data-cam="retake" aria-label="${esc(t('st.cam.retake'))}" title="${esc(t('st.cam.retake'))}">${icon('refresh')}</button>
        <button type="button" class="btn btn--primary" data-cam="send">${icon('send', 'ic--dir')}<span data-sendlbl></span></button></div></div>
    </div>`;
    paintSend();
  };
  const paintSend = () => {
    const lbl = $('[data-sendlbl]', body); if (!lbl) return;
    lbl.textContent = tags.size === 1 ? t('st.cam.sendOne') : t('st.cam.send', { n: famN(tags.size) });
  };
  live();
  body.addEventListener('click', async e => {
    const b = e.target.closest('[data-cam],[data-tag]'); if (!b) return;
    if (b.dataset.tag) {
      const id = b.dataset.tag; if (tags.has(id)) tags.delete(id); else tags.add(id);
      b.setAttribute('aria-pressed', String(tags.has(id))); paintSend(); $('[data-need]', body).textContent = '';
      return;
    }
    const a = b.dataset.cam;
    if (a === 'shoot') {
      const fr = $('.st-vf__frame', body); b.disabled = true; A.haptic(20);
      $('.st-scene', fr).classList.add('is-frozen');
      if (!reduced()) { restart(fr, 'is-flash'); await A.sleep(380); }
      if (!s.closed) tagView();
    } else if (a === 'retake') live();
    else if (a === 'send') {
      if (sent) return;
      if (!tags.size) { $('[data-need]', body).textContent = t('st.cam.need'); return; }
      sent = true; b.disabled = true;
      const ids = [...tags];
      ids.forEach(id => { S.kids[id].photos++; });
      A.fx.burstAt(b, { count: 26 });
      const w = ids.slice();
      log('camera', () => t('st.log.photo', { who: who(w) }));
      A.ui.toast(t('st.cam.sent', { names: joinNames(ids.map(nm)) }), { icon: 'lock', tone: 'ok' });
      if (fromBar) { S.sel.clear(); S.bar = 'root'; barOffAt = now(); }
      paintAllKids(ids, 'photo'); paintAllChip(); renderBar(); sync();
      setTimeout(() => s.close('sent'), 220);
    }
  });
}

/* ---------- parents' inbox ---------- */
function bubbleHTML(text, lg, out, time) {
  return `<div class="bubble${out ? ' bubble--out is-new' : ''}" dir="${lg === 'ru' ? 'ltr' : 'rtl'}" lang="${lg}"><span class="bubble__t">${esc(text)}</span><span class="bubble__meta"><span class="tnum">${esc(time || '')}</span>${out ? icon('checks') : ''}</span></div>`;
}
function origLine(lg, txt) {
  return esc(t('st.in.orig', { text: '\u0000' })).replace('\u0000', `<bdi dir="${lg === 'ru' ? 'ltr' : 'rtl'}" lang="${lg}">${esc(txt[lg])}</bdi>`);
}
function trHTML(m) {
  const ui = lang();
  const lab = key => `<span class="st-tr__l" dir="${dirOf(ui)}" lang="${ui}">${icon('translate')}<span>${esc(t(key))}</span></span>`;
  if (m.orig === 'ru') return `<div class="st-tr" dir="rtl" lang="he">${lab('st.in.trHe')}<p>${esc(m.text.he)}</p></div>`;
  if (ui === 'ru') return `<div class="st-tr" dir="ltr" lang="ru">${lab('st.in.trRu')}<p>${esc(m.text.ru)}</p></div>`;
  return '';
}
function openInbox(focusId) {
  let view = focusId || null;
  const body = A.h('<div class="st-in"></div>');
  const s = sheet({ titleKey: 'st.in.title', content: body, className: 'st-in-sheet' });
  const msg = id => S.inbox.find(m => m.id === id);
  const list = () => `<p class="st-in__sub">${icon('translate')}<span>${esc(t('st.in.sub'))}</span><span class="demo-tag">${esc(t('core.example'))}</span></p>
    <ul class="st-msgs">${S.inbox.map(m => {
      const txt = lang() === 'ru' ? m.text.ru : m.text.he;
      return `<li><button type="button" class="st-msg${m.read ? ' is-read' : ''}" data-in-open="${m.id}">
        ${A.avatarEl(m.look, 46, { label: '' })}
        <span class="st-msg__main">
          <span class="st-msg__top"><span class="st-msg__from">${esc(A.L(m.from))}</span><span class="st-msg__time tnum">${m.time}</span><span class="st-msg__dot" aria-hidden="true"></span></span>
          <span class="st-msg__txt" dir="auto">${esc(txt)}</span>
          <span class="st-msg__tags">${m.orig === 'ru' ? `<span class="st-trtag">${icon('translate')}${esc(t('st.in.trHe'))}</span>` : ''}${m.pickup ? `<span class="tag tag--warn">${icon('key')}${esc(t('st.in.pickup'))}</span>` : ''}${m.stage === 'done' ? `<span class="tag tag--ok">${icon('check')}${esc(t('st.in.done'))}</span>` : ''}</span>
        </span></button></li>`;
    }).join('')}</ul>`;
  const detail = m => {
    const k = kid(m.kid), famLang = m.orig;
    const reply = m.sent ? `${bubbleHTML(m.sent[famLang], famLang, true, m.sentTime)}<p class="st-orig">${esc(t(famLang === 'ru' ? 'st.in.sentRu' : 'st.in.sentHe'))}${famLang !== lang() ? ' · ' + origLine(lang(), m.sent) : ''}</p>` : '';
    let tail = '';
    if (m.pickup) {
      const tr = A.data.trusted.daniel;
      tail = `<div class="st-trust" data-state="${m.stage === 'new' ? 'idle' : 'match'}">
        <p class="st-trust__h">${icon('shield')}<span>${esc(t('st.in.list'))}</span><span class="demo-tag">${esc(t('core.example'))}</span></p>
        <ul class="st-trust__list">${tr.map(p => `<li class="st-trust__p${m.stage !== 'new' && p.id === 'grandma' ? ' is-match' : ''}" data-p="${p.id}">${A.avatarEl(p, 46, { label: '' })}<span class="st-trust__n">${esc(A.L(p))}</span><span class="st-trust__st">${icon('check')}${esc(t('st.in.match'))}</span></li>`).join('')}</ul>
        <span class="st-trust__beam" aria-hidden="true"></span></div>
        <div class="st-trust__act${m.stage !== 'done' ? ' st-foot' : ''}" aria-live="polite">${m.stage === 'new'
          ? `<button type="button" class="btn btn--night btn--block" data-in-check>${icon('shield')}<span>${esc(t('st.in.check'))}</span></button>`
          : m.stage === 'checked'
            ? `<button type="button" class="btn btn--primary btn--block" data-in-approve>${icon('check')}<span>${esc(t('st.in.approve'))}</span></button>`
            : `<span class="st-done">${icon('check-circle')}${esc(t('st.in.handled'))}</span>`}</div>`;
    } else if (m.stage !== 'done') {
      tail = `<p class="st-q">${esc(t('st.in.quick'))}</p><div class="st-quick">${m.quick.map((q, i) => `<button type="button" class="chip" data-in-quick="${i}">${esc(A.L(q))}</button>`).join('')}</div>`;
    } else tail = `<span class="st-done">${icon('check-circle')}${esc(t('st.in.handled'))}</span>`;
    return `<div class="st-thread">
      <button type="button" class="st-back" data-in-back>${icon('back', 'ic--dir')}<span>${esc(t('st.in.back'))}</span></button>
      <div class="st-who">${A.avatarEl(m.look, 48, { label: '' })}<div class="st-who__t"><p class="st-who__n">${esc(A.L(m.from))}</p><p class="st-who__s tnum">${m.time}</p></div><span class="st-kidchip">${A.avatarEl(k, 28, { label: '' })}<span>${esc(nm(m.kid))}</span></span></div>
      <div class="st-chat">${bubbleHTML(m.text[m.orig], m.orig, false, m.time)}${trHTML(m)}${reply}</div>
      ${tail}</div>`;
  };
  const render = () => {
    body.innerHTML = view ? detail(msg(view)) : list();
    if (s.body) s.body.scrollTop = 0;
  };
  render();
  body.addEventListener('click', async e => {
    const o = e.target.closest('[data-in-open]');
    if (o) { view = o.dataset.inOpen; const m = msg(view); m.read = true; paintStats(); render(); const bk = $('[data-in-back]', body); bk && bk.focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-in-back]')) { view = null; render(); return; }
    const m = view && msg(view); if (!m) return;
    if (e.target.closest('[data-in-check]')) {
      const card = $('.st-trust', body), btn = e.target.closest('[data-in-check]');
      btn.disabled = true; $('span', btn).textContent = t('st.in.checking');
      /* the list sits partly under the sticky button on a phone: bring it fully into view before scanning */
      if (s.body && s.body.scrollHeight > s.body.clientHeight + 4) {
        const top = s.body.scrollHeight - s.body.clientHeight;
        if (reduced() || !s.body.scrollTo) s.body.scrollTop = top; else { s.body.scrollTo({ top, behavior: 'smooth' }); await A.sleep(320); if (s.closed) return; }
      }
      const rows = $$('.st-trust__p', card);
      card.style.setProperty('--beam', Math.max(60, card.clientHeight - 30) + 'px');
      if (!reduced()) {
        card.dataset.state = 'scan';
        for (let pass = 0; pass < 2; pass++) for (const r of (pass ? rows.slice().reverse() : rows)) { r.classList.add('is-scan'); await A.sleep(330); r.classList.remove('is-scan'); if (s.closed) return; }
      }
      m.stage = 'checked'; card.dataset.state = 'match';
      const gm = rows.find(r => r.dataset.p === 'grandma'); gm.classList.add('is-match');
      A.fx.burstAt($('.av', gm), { count: 16, colors: ['gold', 'white', 'blue', 'magenta'] });
      $('.st-trust__act', body).innerHTML = `<button type="button" class="btn btn--primary btn--block" data-in-approve>${icon('check')}<span>${esc(t('st.in.approve'))}</span></button>`;
      return;
    }
    if (e.target.closest('[data-in-approve]')) {
      m.stage = 'done'; m.sent = m.reply; m.sentTime = hm(S.clock);
      S.kids.daniel.pickup = 'grandma'; paintKid('daniel', { fresh: 'pickup' });
      log('key', () => t('st.log.pickup'));
      A.ui.toast(t('st.in.toast', { who: A.L(m.short) }), { icon: 'send', tone: 'ok' });
      sync(); render();
      const out = $('.bubble--out', body); if (out) A.fx.burstAt(out, { count: 14 });
      return;
    }
    const q = e.target.closest('[data-in-quick]');
    if (q) {
      m.stage = 'done'; m.sent = m.quick[+q.dataset.inQuick]; m.sentTime = hm(S.clock);
      const sh = A.L(m.short);
      log('chat', () => t('st.log.reply', { who: A.L(m.short) }));
      A.ui.toast(t('st.in.toast', { who: sh }), { icon: 'send', tone: 'ok' });
      sync(); render();
    }
  });
}

/* ---------- incident report ---------- */
function incTexts(st, lg) {
  const k = kid(st.kid), name = k[lg], P = INC[lg];
  const what = INC_WHAT.find(w => w[0] === st.what)[1][lg];
  const aids = INC_AID.filter(a => st.aid.has(a[0]) && a[0] !== 'none').map(a => a[1][lg]);
  const parts = [fill(P.what, { t: hm(st.t), what: lg === 'ru' ? what.toLowerCase() : what })];
  if (aids.length) parts.push(fill(P.aid, { aids: lg === 'ru' ? aids.join(', ').toLowerCase() : aids.join(', ') }));
  else if (st.aid.has('none')) parts.push(P.none);
  if (st.note.trim()) parts.push(iso(st.note.trim().replace(/([^.!?…])$/, '$1.')));
  parts.push(fill(P.calm[g(st.kid)], { name }));
  return { title: fill(P.title, { name }), text: parts.join(' ') };
}
function ownerText(st) {
  const k = kid(st.kid), what = INC_WHAT.find(w => w[0] === st.what)[1].he;
  const aids = INC_AID.filter(a => st.aid.has(a[0]) && a[0] !== 'none').map(a => a[1].he);
  return { title: `דיווח אירוע · ${k.he}`, text: `${what} בשעה ${hm(st.t)}. ${aids.length ? 'טיפול: ' + aids.join(', ') + '.' : 'לא היה צורך בטיפול.'} ההורים קיבלו עדכון ${k.lang === 'ru' ? 'ברוסית' : 'בעברית'}.` };
}
function openIncident() {
  /* an incident is reported after it happened: the time can't go past "now" */
  const tMax = () => Math.max(7 * 60, Math.floor(S.clock / 5) * 5);
  const st = { kid: S.sel.size === 1 ? [...S.sel][0] : null, what: null, aid: new Set(), t: tMax(), note: '' };
  const body = A.h('<div class="st-incwrap"></div>');
  const s = sheet({ titleKey: 'st.inc.title', content: body, className: 'st-inc-sheet' });
  const ordered = () => { const p = present(); return p.concat(KIDS.map(k => k.id).filter(id => !p.includes(id))); };
  const form = () => {
    body.innerHTML = `<form class="st-inc" novalidate>
      <fieldset><legend>${esc(t('st.inc.who'))}</legend><div class="st-kp">${ordered().map(id => `<button type="button" data-ik="${id}" aria-pressed="${st.kid === id}">${A.avatarEl(kid(id), 40, { label: '' })}<span>${esc(nm(id))}</span></button>`).join('')}</div></fieldset>
      <fieldset><legend>${esc(t('st.inc.what'))}</legend><div class="chips">${INC_WHAT.map(([id, l]) => `<button type="button" class="chip" data-iw="${id}" aria-pressed="${st.what === id}">${esc(A.L(l))}</button>`).join('')}</div></fieldset>
      <fieldset><legend>${esc(t('st.inc.aid'))}</legend><div class="chips">${INC_AID.map(([id, l]) => `<button type="button" class="chip" data-ia="${id}" aria-pressed="${st.aid.has(id)}">${esc(A.L(l))}</button>`).join('')}</div></fieldset>
      <div class="field"><span class="label" id="st-inc-when">${esc(t('st.inc.when'))}</span>
        <div class="st-stepper" role="group" aria-labelledby="st-inc-when"><button type="button" data-it="-5" aria-label="${esc(t('st.inc.earlier'))}">${icon('minus')}</button><output class="tnum" data-itime>${hm(st.t)}</output><button type="button" data-it="5" aria-label="${esc(t('st.inc.later'))}">${icon('plus')}</button></div></div>
      <div class="field"><label class="label" for="st-inc-note">${esc(t('st.inc.note'))}</label><textarea class="input" id="st-inc-note" rows="2" placeholder="${esc(t('st.inc.notePh'))}">${esc(st.note)}</textarea></div>
      <div class="st-foot"><p class="st-need" aria-live="polite" data-need></p>
        <button type="submit" class="btn btn--primary btn--block">${icon('eye')}<span>${esc(t('st.inc.preview'))}</span></button></div>
    </form>`;
    const f = $('form', body);
    f.addEventListener('submit', e => {
      e.preventDefault();
      st.note = $('#st-inc-note', body).value || '';
      if (!st.kid || !st.what) {
        $('[data-need]', body).textContent = t(!st.kid && !st.what ? 'st.inc.need' : !st.kid ? 'st.inc.needKid' : 'st.inc.needWhat');
        /* show the caregiver what is missing: scroll to it and nudge it */
        const all = $$('fieldset', f), fs = all[st.kid ? 1 : 0];
        all.forEach(x => x.classList.remove('is-miss'));
        void fs.offsetWidth; fs.classList.add('is-miss');
        if (s.body) {
          const top = s.body.scrollTop + fs.getBoundingClientRect().top - s.body.getBoundingClientRect().top - 6;
          if (s.body.scrollTo) s.body.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' }); else s.body.scrollTop = top;
        }
        return;
      }
      preview();
    });
  };
  const preview = () => {
    const k = kid(st.kid), ui = lang(), pm = incTexts(st, ui);
    const fl = t(k.lang === 'ru' ? 'st.inc.lang.ru' : 'st.inc.lang.he');
    body.innerHTML = `<div class="st-incprev">
      <div class="st-incard"><div class="st-incard__top">${A.avatarEl(k, 44, { label: '' })}<div><p class="st-incard__n">${esc(nm(st.kid))}</p><p class="st-incard__t tnum">${hm(st.t)} · ${esc(A.L(INC_WHAT.find(w => w[0] === st.what)[1]))}</p></div></div>
        <p>${esc(pm.text)}</p></div>
      <p class="st-q">${esc(t('st.inc.to'))}</p>
      <ul class="st-to"><li><span class="icon-bubble icon-bubble--pink" aria-hidden="true">${icon('home-heart')}</span>${esc(t('st.inc.toParents', { name: nm(st.kid), lang: fl }))}</li>
        <li><span class="icon-bubble" aria-hidden="true">${icon('crown')}</span>${esc(t('st.inc.toOwner'))}</li></ul>
      <div class="st-foot"><div class="st-actions"><button type="button" class="btn btn--ghost" data-inc="edit">${icon('edit')}<span>${esc(t('st.inc.edit'))}</span></button>
        <button type="button" class="btn btn--primary" data-inc="send">${icon('send', 'ic--dir')}<span>${esc(t('st.inc.send'))}</span></button></div></div></div>`;
    if (s.body) s.body.scrollTop = 0;
  };
  const sent = () => {
    const k = kid(st.kid), fam = k.lang, pm = incTexts(st, fam), om = ownerText(st);
    S.kids[st.kid].incident = { what: st.what, t: st.t };
    paintKid(st.kid, { fresh: 'inc' });
    const nameNow = st.kid;
    log('aid', () => t('st.log.incident', { name: nm(nameNow) }));
    sync();
    body.innerHTML = `<div class="st-incprev"><p class="st-okline">${icon('check-circle')}<span>${esc(t('st.inc.sent'))}</span></p>
      <div class="st-phones2"><figure data-ph="p"><figcaption>${icon('home-heart')}<span><b>${esc(t('st.inc.capParents'))}</b>${esc(t(fam === 'ru' ? 'st.inc.lang.ru' : 'st.inc.lang.he'))}</span></figcaption></figure>
        <figure data-ph="o"><figcaption>${icon('crown')}<span><b>${esc(t('st.inc.capOwner'))}</b>${esc(t('st.inc.lang.he'))}</span></figcaption></figure></div>
      <div class="st-foot"><button type="button" class="btn btn--night btn--block" data-inc="close">${esc(t('st.inc.close'))}</button></div></div>`;
    if (s.body) s.body.scrollTop = 0;
    const w = Math.max(140, Math.min(220, Math.floor(((s.body ? s.body.clientWidth : 340) - 40 - 14) / 2)));
    const tm = hm(S.clock);
    const mk = (lg, slot, n, delay) => {
      const ph = A.ui.phone({ time: tm, date: dateStr(lg, today()), size: w, max: 1 });
      $(`[data-ph="${slot}"]`, body).prepend(ph);
      setTimeout(() => { if (s.closed) return; const c = ph.notify({ title: n.title, text: n.text, icon: slot === 'o' ? 'bell' : 'sparkle', time: lg === 'ru' ? 'сейчас' : 'עכשיו' }, !reduced()); c.setAttribute('dir', lg === 'ru' ? 'ltr' : 'rtl'); c.setAttribute('lang', lg); }, reduced() ? 0 : delay);
    };
    mk(fam, 'p', { title: pm.title, text: pm.text }, 380);
    mk('he', 'o', om, 820);
  };
  form();
  body.addEventListener('click', e => {
    const b = e.target.closest('[data-ik],[data-iw],[data-ia],[data-it],[data-inc]'); if (!b) return;
    const need = $('[data-need]', body); if (need) need.textContent = '';
    const fsx = b.closest('fieldset'); if (fsx) fsx.classList.remove('is-miss');
    if (b.dataset.ik) { st.kid = b.dataset.ik; $$('[data-ik]', body).forEach(x => x.setAttribute('aria-pressed', String(x === b))); }
    else if (b.dataset.iw) { st.what = b.dataset.iw; $$('[data-iw]', body).forEach(x => x.setAttribute('aria-pressed', String(x === b))); }
    else if (b.dataset.ia) {
      const id = b.dataset.ia;
      if (st.aid.has(id)) st.aid.delete(id); else { st.aid.add(id); if (id === 'none') [...st.aid].forEach(x => x !== 'none' && st.aid.delete(x)); else st.aid.delete('none'); }
      $$('[data-ia]', body).forEach(x => x.setAttribute('aria-pressed', String(st.aid.has(x.dataset.ia))));
    } else if (b.dataset.it) { st.t = A.clamp(st.t + +b.dataset.it, 7 * 60, tMax()); $('[data-itime]', body).textContent = hm(st.t); }
    else if (b.dataset.inc === 'edit') { form(); }
    else if (b.dataset.inc === 'send') sent();
    else if (b.dataset.inc === 'close') s.close('done');
  });
}

/* ---------- end of day ---------- */
function example(id, i) {
  if (id === 'noa') return { arrived: 7 * 60 + 48, meals: { breakfast: 'all', lunch: 'all', snack: 'half' }, sleep: { start: 12 * 60 + 30, end: 14 * 60 + 10 }, diapers: 1, photos: 1 };
  return {
    arrived: 7 * 60 + 31 + (i * 7) % 38,
    meals: { breakfast: ['all', 'all', 'half', 'all', 'little'][i % 5], lunch: ['all', 'half', 'all', 'all', 'half', 'little'][i % 6], snack: ['all', 'half', 'all', 'little'][i % 4] },
    sleep: { start: 12 * 60 + 25 + (i * 4) % 15, end: 13 * 60 + 55 + (i * 11) % 25 },
    diapers: 1 + (i % 3), photos: i % 4 === 1 ? 1 : 0
  };
}
const wakeEnd = ks => Math.max(ks.sleep.start + 20, S.clock);
function marksFor(id) {
  const i = KID_IDX[id], ks = S.kids[id], ex = example(id, i);
  const meals = {}; MEALS.forEach(m => { meals[m] = ks.meals[m] ? ks.meals[m].amt : ex.meals[m]; });
  const last = ks.sleeps.length ? ks.sleeps[ks.sleeps.length - 1] : null;
  const cur = ks.sleep ? { start: ks.sleep.start, end: wakeEnd(ks) } : null;
  return { arrived: ks.arrived != null ? ks.arrived : ex.arrived, meals, sleep: cur || last || ex.sleep, diapers: ks.diapers.length || ex.diapers, photos: ks.photos || ex.photos, pickup: ks.pickup, incident: ks.incident };
}
function wakeAll() {
  const ids = sleeping(); if (!ids.length) return;
  ids.forEach(id => { const ks = S.kids[id]; ks.sleeps.push({ start: ks.sleep.start, end: wakeEnd(ks) }); ks.sleep = null; });
  paintAllKids(); paintStats(); ensureTick();
}
function compose(id, lg) {
  const P = SUM[lg], gg = g(id), k = kid(id), name = k[lg], m = marksFor(id), i = KID_IDX[id];
  const out = [P.hi, fill(P.arrive[gg], { name, t: hm(m.arrived) })];
  const ms = MEALS.filter(x => m.meals[x]);
  if (ms.length) {
    const groups = [];
    ms.forEach(x => { const gr = groups.find(q => q.amt === m.meals[x]); if (gr) gr.meals.push(x); else groups.push({ amt: m.meals[x], meals: [x] }); });
    if (lg === 'ru') {
      const parts = groups.map((q, j) => {
        const where = 'на ' + joinNames(q.meals.map(x => P.at[x].replace(/^на /, '')), 'ru');
        return j === 0 ? `${cap(where)} ${P.ate[gg]} ${P.amt[q.amt]}` : `${where} ${P.amt[q.amt]}`;
      });
      out.push(parts.join(', ') + '.');
    } else {
      const parts = groups.map(q => `${P.amt[q.amt]} ${joinNames(q.meals.map(x => P.at[x]), 'he')}`);
      const multi = groups.some(q => q.meals.length > 1);
      const joined = parts.length > 1 && multi ? parts.slice(0, -1).join(', ') + ', ו' + parts[parts.length - 1] : joinNames(parts, 'he');
      out.push(`${P.ate[gg]} ${joined}.`);
    }
  }
  if (m.sleep) out.push(fill(P.slept[gg], { a: hm(m.sleep.start), b: hm(m.sleep.end) }));
  if (m.diapers) out.push(P.diaper(m.diapers));
  if (m.photos) out.push(P.photo(m.photos));
  if (m.incident) { const w = INC_WHAT.find(x => x[0] === m.incident.what)[1][lg]; out.push(fill(P.incident, { what: lg === 'ru' ? w.toLowerCase() : w })); }
  if (m.pickup) out.push(P.pickup);
  out.push(k.birthdayTomorrow ? P.bday[gg] : P.bye[gg][i % 2]);
  return out.join(' ');
}
function langBadge(lg) { return `<span class="st-lang st-lang--${lg}" title="${esc(t(lg === 'ru' ? 'st.lang.ruA' : 'st.lang.heA'))}">${t('st.lang.' + lg)}</span>`; }
function openEod() {
  closeSheets(); if (S.sel.size) clearSel();
  /* the day is over: whoever still sleeps is woken now, so the summaries and the cards tell the same story */
  wakeAll();
  const items = KIDS.map(k => ({ id: k.id, lg: k.lang, text: { he: compose(k.id, 'he'), ru: compose(k.id, 'ru') } }));
  const ui = lang();
  const row = (it, i) => {
    const other = it.lg !== ui ? `<p class="st-row__tr"><b>${esc(t('st.eod.inUi'))}</b> <span dir="${dirOf(ui)}" lang="${ui}">${esc(it.text[ui])}</span></p>` : '';
    return `<li class="st-row" style="--i:${i}"><button type="button" class="st-row__btn" aria-expanded="false" aria-controls="st-row-${it.id}">
      ${A.avatarEl(kid(it.id), 42, { label: '' })}
      <span class="st-row__main"><span class="st-row__top"><b>${esc(nm(it.id))}</b>${langBadge(it.lg)}</span>
        <span class="st-row__line"><span class="st-row__sk" aria-hidden="true"><i></i><i></i></span><span class="st-row__txt" dir="${dirOf(it.lg)}" lang="${it.lg}">${esc(it.text[it.lg])}</span></span></span>
      ${icon('chevron-down', 'st-row__chev')}</button>
      <div class="st-row__full" id="st-row-${it.id}" hidden><p class="st-row__msg" dir="${dirOf(it.lg)}" lang="${it.lg}">${esc(it.text[it.lg])}</p>${other}</div></li>`;
  };
  const body = A.h(`<div class="st-eod is-writing">
    <div class="st-eod__head"><span class="st-eod__wand" aria-hidden="true">${icon('wand')}</span>
      <div class="st-eod__ht"><p class="st-eod__h" data-eod-h>${esc(t('st.eod.writing'))}</p><p class="st-eod__sub"><span data-eod-sub>${esc(t('st.eod.sub'))}</span> <span class="demo-tag">${esc(t('core.example'))}</span></p></div>
      <span class="st-eod__n tnum" data-eod-n><b>0</b><span>/${items.length}</span></span></div>
    <ul class="st-eod__list" data-eod-list>${items.map(row).join('')}</ul>
    <div class="st-eod__foot" data-eod-foot><button type="button" class="btn btn--primary btn--block" data-eod="send" disabled>${icon('send', 'ic--dir')}<span>${esc(t('st.eod.send'))}</span></button></div>
  </div>`);
  const s = sheet({ titleKey: 'st.eod.title', content: body, size: 'full', className: 'st-eod-sheet' });
  const nEl = $('[data-eod-n]', body), hEl = $('[data-eod-h]', body), subEl = $('[data-eod-sub]', body);
  const setN = (n, suffix) => { nEl.innerHTML = `<b>${n}</b><span>/${items.length}${suffix ? ' ' + esc(suffix) : ''}</span>`; if (!reduced()) restart(nEl, 'is-bump'); };
  (async () => {
    const rows = $$('.st-row', body);
    const tq = touring() || tourCtx;
    const step = reduced() ? 0 : tq ? 55 : 115;
    await A.sleep(reduced() ? 0 : tq ? 250 : 420);
    for (let i = 0; i < rows.length; i++) {
      if (s.closed) return;
      rows[i].classList.add('is-written'); setN(i + 1);
      if (step) await A.sleep(step);
    }
    await A.sleep(reduced() ? 0 : 260);
    if (s.closed) return;
    body.classList.remove('is-writing');
    hEl.textContent = t('st.eod.ready', { n: items.length }); subEl.textContent = t('st.eod.readySub');
    const btn = $('[data-eod="send"]', body); btn.disabled = false;
    A.fx.burstAt($('.st-eod__wand', body), { count: 14, colors: ['gold', 'white', 'pink'] });
  })();
  body.addEventListener('click', async e => {
    const rb = e.target.closest('.st-row__btn');
    if (rb && rb.closest('.st-row').classList.contains('is-written')) {
      const ex = rb.getAttribute('aria-expanded') !== 'true';
      rb.setAttribute('aria-expanded', String(ex)); $('#' + rb.getAttribute('aria-controls'), body).hidden = !ex;
      return;
    }
    const sb = e.target.closest('[data-eod="send"]');
    if (sb && !sb.disabled) { sb.disabled = true; await sendAll(); return; }
    const ph = e.target.closest('.st-mph__btn');
    if (ph && !ph.disabled) { pick(ph.closest('.st-mph').dataset.kid); showReader(); return; }
    if (e.target.closest('[data-eod="close"]')) s.close('done');
  });
  let big = null, featured = null;
  const showReader = () => {
    const rd = $('.st-read', body); if (!rd || !s.body) return;
    const br = s.body.getBoundingClientRect(), r = rd.getBoundingClientRect();
    if (r.top >= br.top && r.bottom <= br.bottom - 70) return;
    const top = s.body.scrollTop + r.top - br.top - 8;
    if (s.body.scrollTo) s.body.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' }); else s.body.scrollTop = top;
  };
  const pick = id => {
    const it = items.find(x => x.id === id); if (!it || !big) return;
    $$('.st-mph', body).forEach(p => p.classList.toggle('is-pick', p.dataset.kid === id));
    $('.phone__date', big).textContent = dateStr(it.lg, today());
    const c = big.notify({ title: APP_NAME[it.lg], text: it.text[it.lg], icon: 'sparkle', time: it.lg === 'ru' ? 'сейчас' : 'עכשיו' }, !reduced());
    c.setAttribute('dir', dirOf(it.lg)); c.setAttribute('lang', it.lg);
    const lu = lang(), tr = $('[data-read-tr]', body);
    $('[data-read-who]', body).innerHTML = `${A.avatarEl(kid(id), 30, { label: '' })}<span>${esc(nm(id))}</span>${langBadge(it.lg)}`;
    tr.hidden = it.lg === lu;
    tr.innerHTML = it.lg !== lu ? `<b>${esc(t('st.eod.inUi'))}</b> <span dir="${dirOf(lu)}" lang="${lu}">${esc(it.text[lu])}</span>` : '';
  };
  async function sendAll() {
    S.sentAt = Math.max(S.clock, 17 * 60); atLeast(S.sentAt);
    const list = $('[data-eod-list]', body), foot = $('[data-eod-foot]', body);
    body.classList.add('is-sending');
    hEl.textContent = t('st.eod.sending'); subEl.textContent = t('st.eod.sentSub');
    nEl.hidden = true;
    if (!reduced() && list.animate) await list.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-14px) scale(.98)' }], { duration: 260, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => { });
    if (s.closed) return;
    list.hidden = true; foot.hidden = true;
    const appT = APP_NAME;
    const stage = A.h(`<div class="st-send">
      <div class="st-send__hub"><span class="st-send__tab" aria-hidden="true"><span>${icon('send', 'ic--dir')}</span></span>
        <p class="st-send__cnt tnum" aria-live="polite"><bdi dir="ltr"><b data-send-n>0</b>/${items.length}</bdi><span>${esc(t('st.eod.sentN'))}</span></p>
        <p class="st-read__hint" hidden data-read-hint>${icon('eye')}<span>${esc(t('st.eod.tap'))}</span></p></div>
      <ul class="st-send__grid">${items.map((it, i) => `<li class="st-mph" data-kid="${it.id}" style="--d:${i}">
        <button type="button" class="st-mph__btn" disabled aria-label="${esc(nm(it.id))} · ${esc(t(it.lg === 'ru' ? 'st.lang.ruL' : 'st.lang.heL'))}">
          <span class="st-mph__body"><span class="st-mph__scr"><span class="st-mph__island"></span><span class="st-mph__clock tnum" aria-hidden="true">${hm(S.sentAt)}</span>
            <span class="st-mph__av">${A.avatarEl(kid(it.id), 40, { label: '' })}</span>
            <span class="st-mph__notif" dir="${dirOf(it.lg)}" lang="${it.lg}" aria-hidden="true"><span class="st-mph__app"><i></i>${esc(appT[it.lg])}</span><span class="st-mph__txt">${esc(it.text[it.lg])}</span></span>
          </span>${langBadge(it.lg)}</span>
          <span class="st-mph__cap"><span class="st-mph__name">${esc(nm(it.id))}</span></span>
        </button></li>`).join('')}</ul>
      <div class="st-read"><p class="st-read__who" data-read-who></p><div class="st-read__ph" data-read-ph></div><p class="st-read__tr" data-read-tr hidden></p></div>
      <div class="st-send__fly" aria-hidden="true"></div>
    </div>`);
    body.insertBefore(stage, foot);
    featured = (items.find(x => x.lg !== lang()) || items[0]).id;
    big = A.ui.phone({ time: hm(S.sentAt), size: matchMedia('(min-width: 760px)').matches ? 160 : 220, max: 1 });
    $('[data-read-ph]', stage).append(big);
    if (s.body) s.body.scrollTop = 0;
    await A.sleep(reduced() ? 0 : (touring() || tourCtx) ? 330 : 480);
    if (s.closed) return;
    let n = 0; const cnt = $('.st-send__cnt', stage), cntN = $('[data-send-n]', stage);
    await fly(stage, () => !s.closed, ph => {
      ph.classList.add('is-on'); n++; cntN.textContent = n; if (!reduced()) restart(cnt, 'is-bump');
      if (ph.dataset.kid === featured) pick(featured);
      if (!reduced()) A.fx.burstAt($('.st-mph__scr', ph), { count: 6, speed: [60, 160], size: [6, 13], life: [350, 700], gravity: 90, colors: ['gold', 'white', 'pink'] });
    });
    if (s.closed) return;
    body.classList.remove('is-sending'); body.classList.add('is-done');
    cnt.insertAdjacentHTML('afterbegin', icon('check-circle'));
    const he = items.filter(x => x.lg === 'he').length, ru = items.length - he;
    hEl.textContent = t('st.eod.done'); subEl.textContent = t('st.eod.doneSub', { he, ru });
    A.fx.burstAt($('.st-send__tab', stage), { count: 40, speed: [160, 460], life: [700, 1300] });
    A.haptic(30);
    $$('.st-mph__btn', stage).forEach(b => { b.disabled = false; });
    $('[data-read-hint]', stage).hidden = false;
    if (!$('.st-mph.is-pick', stage)) pick(featured);
    foot.innerHTML = `<button type="button" class="btn btn--night btn--block" data-eod="close">${icon('check')}<span>${esc(t('st.eod.close'))}</span></button>`;
    foot.hidden = false;
    log('sparkles', () => t('st.log.eod', { n: items.length }), S.sentAt);
    paintClock(); sync();
    A.emit('staff:endday', { count: items.length, he, ru, time: hm(S.sentAt) });
  }
}
function fly(stage, alive, onArrive) {
  return new Promise(resolve => {
    const phones = $$('.st-mph', stage);
    if (reduced()) { phones.forEach(p => onArrive(p)); resolve(); return; }
    const layer = $('.st-send__fly', stage), sr = stage.getBoundingClientRect(), hr = $('.st-send__tab', stage).getBoundingClientRect();
    const sx = hr.left + hr.width / 2 - sr.left, sy = hr.top + hr.height / 2 - sr.top;
    const fl = phones.map((p, i) => {
      const r = $('.st-mph__scr', p).getBoundingClientRect();
      const tx = r.left + r.width / 2 - sr.left, ty = r.top + r.height * .5 - sr.top;
      const env = document.createElement('span'); env.className = 'st-env';
      env.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 30 22"><use href="#st-i-env"/></svg>';
      env.style.opacity = '0'; layer.append(env);
      const cx = (sx + tx) / 2 + (tx - sx) * .2, cy = Math.min(sy, ty) - 40 - Math.abs(tx - sx) * .18;
      return { p, env, tx, ty, cx, cy, delay: i * 72, dur: 620 + (i % 3) * 50, done: false, lt: 0 };
    });
    const ease = k => (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    const T = performance.now(); let left = fl.length;
    const frame = now => {
      /* the sheet was closed (or the role switched) mid-flight: drop the envelopes, no trails over another view */
      if (!alive()) { fl.forEach(f => f.env.remove()); resolve(); return; }
      for (const f of fl) {
        if (f.done) continue;
        const k = (now - T - f.delay) / f.dur;
        if (k < 0) continue;
        if (k >= 1) { f.done = true; f.env.remove(); onArrive(f.p); left--; continue; }
        const e = ease(k), u = 1 - e;
        const x = u * u * sx + 2 * u * e * f.cx + e * e * f.tx, y = u * u * sy + 2 * u * e * f.cy + e * e * f.ty;
        const dx = 2 * u * (f.cx - sx) + 2 * e * (f.tx - f.cx), dy = 2 * u * (f.cy - sy) + 2 * e * (f.ty - f.cy);
        const ang = Math.atan2(dy, dx) * 57.3 * .18;
        const sc = k < .15 ? .45 + k / .15 * .55 : k > .82 ? 1 - (k - .82) / .18 * .55 : 1;
        f.env.style.transform = `translate(${(x - 14).toFixed(1)}px, ${(y - 10).toFixed(1)}px) rotate(${ang.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
        f.env.style.opacity = k > .9 ? String((1 - k) * 10) : '1';
        if (now - f.lt > 55) { f.lt = now; A.fx.trail(sr.left + x, sr.top + y, { size: [5, 11], life: [300, 600], colors: ['magenta', 'gold', 'white', 'pink'] }); }
      }
      if (left > 0) requestAnimationFrame(frame); else resolve();
    };
    requestAnimationFrame(frame);
  });
}

/* =====================================================================
   LAYOUT · tablet scale on desktop
   ===================================================================== */
function fit() {
  if (!root) return;
  if (!isDevice()) { root.style.removeProperty('--st-s'); return; }
  const top = 66, bottom = 68 + 40;
  let availH = innerHeight - top - bottom - 14;
  if (touring()) availH = innerHeight - top - (68 + 18 + 132) - 10;
  const availW = document.documentElement.clientWidth - 56;
  const s = A.clamp(Math.min(availH / DEV_H, availW / DEV_W), .5, 1.12);
  root.style.setProperty('--st-s', s.toFixed(4));
}

/* =====================================================================
   PUBLIC
   ===================================================================== */
function repaintAll() { paintHead(); paintMode(); paintAllKids(); paintStats(); renderSide(); renderBar('quiet'); }
function reset() {
  closeSheets();
  fresh();
  barSig = '';
  repaintAll();
  ensureTick();
}
const cardSel = id => `.st-kid[data-kid="${id}"]`;

A.module('staff', {
  view: 'staff',
  i18n: I18N,
  init(el) {
    root = el;
    fresh();
    seedMorning();
    buildGrid();
    repaintAll();
    root.addEventListener('click', e => {
      const card = e.target.closest('.st-kid');
      if (card) {
        if (S.mode === 'select' && now() - barOffAt < 380) return;
        const id = card.dataset.kid; if (S.mode === 'arrive') toggleArrive(id); else toggleSel(id); return;
      }
      const mb = e.target.closest('[data-st-mode]'); if (mb) { setMode(mb.dataset.stMode); return; }
      const act = e.target.closest('[data-act]');
      if (act) { if (!act.disabled && now() - actAt > 280) { actAt = now(); onAct(act.dataset.act); } return; }
      if (e.target.closest('[data-st-barx]')) { onBarX(); return; }
      const b = e.target.closest('[data-st]'); if (!b) return;
      switch (b.dataset.st) {
        case 'all': selectAllPresent(); break;
        case 'inbox': openInbox(); break;
        case 'photo': openCamera([]); break;
        case 'incident': openIncident(); break;
        case 'eod': openEod(); break;
      }
    });
    A.on('lang', () => { repaintAll(); });
    A.on('tour:start', () => { fit(); });
    A.on('tour:stop', () => { fit(); renderBar(); });
    addEventListener('resize', () => { if (active) { fit(); if (S.sel.size) placeBar(); } }, { passive: true });
    if (mqDevice.addEventListener) mqDevice.addEventListener('change', () => { fit(); renderBar(true); });
    fit();
  },
  onEnter() {
    active = true; fit(); paintHead(); renderBar('quiet'); ensureTick(); minuteClock(true);
    const grid = $('[data-st-grid]', root);
    if (!reduced() && !entered) { grid.classList.add('st-enter'); setTimeout(() => grid.classList.remove('st-enter'), 1200); }
    entered = true;
  },
  onLeave() { active = false; ensureTick(); minuteClock(false); },
  reset,
  /* other modules may peek at the day (e.g. owner dashboard) */
  stats() { return { present: present().length, total: KIDS.length, sleeping: sleeping().length, sent: !!S.sentAt }; },
  tour: {
    async checkin(ctx) {
      reset();
      await ctx.wait(ctx.fast ? 60 : 280);
      if (!isDevice()) await ctx.scrollTo(0, { duration: 400 });
      if (S.mode !== 'arrive') await ctx.tap('[data-st-mode="arrive"]', { after: 200 });
      for (const id of ['daniel', 'itai', 'noa', 'maya']) await ctx.tap(cardSel(id), { after: ctx.fast ? 120 : 300 });
      await ctx.wait(ctx.fast ? 150 : 450);
    },
    async meal(ctx) {
      closeSheets();
      const need = ['noa', 'itai', 'daniel', 'maya'];
      if (S.sel.size) clearSel();
      if (present().length < KIDS.length || need.some(id => S.kids[id].arrived == null)) { markAllPresent(); await ctx.wait(ctx.fast ? 80 : 260); }
      if (!isDevice()) {
        const r = $('.st-tools', root).getBoundingClientRect();
        if (r.top < 64 || r.top > innerHeight * .4) await ctx.scrollTo($('.st-tools', root), { offset: 70, duration: 380 });
      }
      if (S.mode !== 'select') await ctx.tap('[data-st-mode="select"]', { after: 160 });
      for (const id of need) await ctx.tap(cardSel(id), { after: 100 });
      await ctx.tap('.st-bar [data-act="food"]', { after: 200 });
      await ctx.tap('.st-bar [data-act="lunch"]', { after: 100 });
      const ok = await ctx.waitFor('.st-alert [data-al="ok"]', 2500);
      await ctx.wait(ctx.fast ? 200 : 620);
      if (ok) await ctx.tap(ok, { after: 320 });
      await ctx.tap('.st-bar [data-act="all"]', { after: 380 });
    },
    async endDay(ctx) {
      closeSheets(); if (S.sel.size) clearSel();
      if (!isDevice()) { const r = $('[data-st="eod"]', root).getBoundingClientRect(); if (r.top < 64 || r.bottom > innerHeight * .6) await ctx.scrollTo(0, { duration: 380 }); }
      tourCtx = true;
      try { await ctx.tap('[data-st="eod"]', { after: 150 }); } finally { tourCtx = false; }
      const btn = await ctx.waitFor(() => { const b = $('.st-eod [data-eod="send"]'); return b && !b.disabled ? b : null; }, 5000);
      await ctx.wait(ctx.fast ? 80 : 200);
      if (btn) await ctx.tap(btn, { after: 120 });
      await ctx.waitFor('.st-eod.is-done', 6000);
      await ctx.wait(ctx.fast ? 300 : 1150);
      const close = $('.st-eod [data-eod="close"]');
      if (close) await ctx.tap(close, { after: 150 });
      closeSheets();
    }
  }
});
