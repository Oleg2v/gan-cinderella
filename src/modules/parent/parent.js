/* =====================================================================
   PARENT · the family's personal area ("הורים")
   Fictional child: נועה, קבוצת בוגרים. Everything here is example data.
   login (phone + one-time code) → header → tabs:
   today · payments · calendar · menu · documents · album
   ===================================================================== */
const $ = App.$, $$ = App.$$, esc = App.esc, icon = App.icon;
const t = (k, v) => App.t(k, v);
const L = o => App.L(o);
const lang = () => App.i18n.lang;
const reduced = () => App.motion.reduced;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let R = null;
const q = s => $(s, R);
const qq = s => $$(s, R);

/* =====================================================================
   DATES
   ===================================================================== */
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const intl = (l, d, o) => { try { return new Intl.DateTimeFormat(l === 'he' ? 'he-IL' : 'ru-RU', o).format(d); } catch (e) { return d.toDateString(); } };
const monthName = (d, l = lang()) => { const m = intl(l, d, { month: 'long' }); return l === 'ru' ? cap(m) : m; };
const monthYear = d => monthName(d) + ' ' + d.getFullYear();
const dayMonth = (d, l = lang()) => intl(l, d, { day: 'numeric', month: 'long' });
const longDate = (d, l = lang(), up = true) => { const s = intl(l, d, { weekday: 'long' }) + ', ' + dayMonth(d, l); return l === 'ru' && up ? cap(s) : s; };
const shortNum = d => `${d.getDate()}.${d.getMonth() + 1}`;
const workDay = d => { let x = new Date(d); while (x.getDay() > 4) x = addDays(x, 1); return x; };
const nextWorkDay = () => { let x = addDays(today0(), 1); while (x.getDay() === 6) x = addDays(x, 1); return x; };
const thisFriday = () => { const d = today0(); return addDays(d, (5 - d.getDay() + 7) % 7); };
const hourNow = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
const isAfterPickup = () => { const h = hourNow(); return h >= 17 || h < 6; };

/* =====================================================================
   DATA (fictional · marked as example in the UI)
   ===================================================================== */
const NOA = () => App.data.kid('noa');
const GROUP = () => App.data.groups.find(g => g.id === 'big');
const TRUSTED = () => App.data.trusted.noa;
const TRUST_SEX = { mom: 'f', dad: 'm', grandma: 'f', aunt: 'f' };
const firstName = p => String(L(p)).split(' · ').pop();
const momName = () => firstName(TRUSTED()[0]);
const RU_DAT = { mom: 'Михаль', dad: 'Рои', grandma: 'Орне', aunt: 'Шани' };
const personName = p => { const s = String(L(p)).replace(' · ', ' '); return lang() === 'ru' ? s.charAt(0).toLowerCase() + s.slice(1) : s; };

const FEED = [
  { time: '07:48', ic: 'door', tone: 'sky', title: { he: 'הגיעה לגן', ru: 'Пришла в сад' }, text: { he: 'נכנסה עם חיוך גדול ונפרדה מאבא בקלות.', ru: 'Зашла с широкой улыбкой и легко попрощалась с папой.' } },
  { time: '08:15', ic: 'plate', tone: 'pink', title: { he: 'ארוחת בוקר', ru: 'Завтрак' }, tag: { he: 'אכלה הכל', ru: 'Съела всё' }, tagTone: 'ok', text: { he: 'ביקשה עוד פרוסה, והצלחת חזרה ריקה.', ru: 'Попросила ещё кусочек, и тарелка вернулась пустой.' } },
  { time: '09:30', ic: 'note', tone: 'lilac', title: { he: 'חוג מוזיקה', ru: 'Музыкальный кружок' }, text: { he: 'ניגנה על הקסילופון ושרה עם כולם.', ru: 'Играла на ксилофоне и пела вместе со всеми.' }, photo: 'music', alt: { he: 'נועה מנגנת על קסילופון', ru: 'Ноа играет на ксилофоне' } },
  { time: '10:30', ic: 'swing', tone: 'mint', title: { he: 'בחצר', ru: 'Во дворе' }, text: { he: 'עפה גבוה בנדנדה ואספה עלים צהובים.', ru: 'Высоко качалась на качелях и собирала жёлтые листья.' }, photo: 'swing', alt: { he: 'נועה על הנדנדה בחצר', ru: 'Ноа на качелях во дворе' } },
  { time: '11:45', ic: 'plate', tone: 'pink', title: { he: 'ארוחת צהריים', ru: 'Обед' }, tag: { he: 'אכלה יפה', ru: 'Хорошо поела' }, tagTone: 'ok', text: { he: 'טעמה הכל, והכי אהבה את האורז.', ru: 'Попробовала всё, а больше всего ей понравился рис.' } },
  { time: '12:30–14:10', ic: 'sleep', tone: 'night', title: { he: 'שינה', ru: 'Сон' }, tag: { he: 'שעה ו-40 דק׳', ru: '1 ч 40 мин' }, tagTone: 'ink', text: { he: 'נרדמה מהר והתעוררה רגועה.', ru: 'Быстро уснула и проснулась в хорошем настроении.' }, photo: 'sleep', alt: { he: 'נועה ישנה מתחת לשמיכת כוכבים', ru: 'Ноа спит под одеялом со звёздами' } },
  { time: '15:15', ic: 'apple', tone: 'sun', title: { he: 'מנחה', ru: 'Полдник' }, tag: { he: 'אכלה חצי', ru: 'Съела половину' }, tagTone: 'pink', text: { he: 'פירות וקרקרים. את התות השאירה לסוף.', ru: 'Фрукты и крекеры. Клубнику оставила напоследок.' } }
];
const FEED_HOME = { time: '16:50', ic: 'walk', tone: 'sky', title: { he: 'הלכה הביתה', ru: 'Ушла домой' }, text: { he: 'נפרדה מכולם בנפנוף גדול.', ru: 'Помахала всем на прощание.' } };

const SUMMARY = {
  he: 'נועה הגיעה ב-07:48 עם חיוך גדול. בארוחת הבוקר אכלה הכל, ובחוג מוזיקה ניגנה על הקסילופון ושרה עם כולם. בצהריים ישנה שעה ו-40 דקות והתעוררה רגועה. במנחה אכלה חצי, ואת התות השאירה לסוף.',
  ru: 'Ноа пришла в 07:48 с широкой улыбкой. За завтраком съела всё, а на музыке играла на ксилофоне и пела вместе со всеми. Днём проспала 1 час 40 минут и проснулась в хорошем настроении. На полдник съела половину, а клубнику оставила напоследок.'
};
const SUM_NOTIF = {
  he: { title: 'גן סינדרלה', text: 'הסיכום של נועה מהיום: אכלה הכל, ניגנה על קסילופון וישנה שעה ו-40 דק׳.', now: 'עכשיו' },
  ru: { title: 'Сад «Синдерелла»', text: 'Ноа: съела весь завтрак, играла на ксилофоне, спала 1 ч 40 мин.', now: 'сейчас' }
};

const REASONS = [
  { id: 'sick', ic: 'bandage', he: 'לא מרגישה טוב', ru: 'Приболела' },
  { id: 'trip', ic: 'sun', he: 'חופשה משפחתית', ru: 'Семейный отпуск' },
  { id: 'doctor', ic: 'calendar', he: 'תור לרופא', ru: 'Идём к врачу' },
  { id: 'other', ic: 'chat', he: 'סיבה אחרת', ru: 'Другая причина' }
];
const MSG_EXAMPLES = [
  { lang: 'he', text: 'נועה ישנה מעט בלילה, אולי תהיה עייפה' },
  { lang: 'ru', text: 'Сегодня Ноа заберёт бабушка Орна', he: 'היום סבתא אורנה תאסוף את נועה' },
  { lang: 'he', text: 'שכחנו בקבוק מים, אפשר לתת לה כוס?' },
  { lang: 'ru', text: 'У Ноа режутся зубки, может капризничать', he: 'בוקעות לנועה שיניים, אולי תהיה קצת בכיינית' }
];

const PAY = { tuition: 3150, subsidy: 1240 };
const PAY_TOTAL = PAY.tuition - PAY.subsidy;

/* real Israeli holidays for the 2026–27 school year (dates are calendar facts, nothing about the kindergarten) */
const HOLIDAYS = [
  ['2026-09-12', 2, { he: 'ראש השנה', ru: 'Рош а-Шана' }],
  ['2026-09-21', 1, { he: 'יום כיפור', ru: 'Йом Кипур' }],
  ['2026-09-26', 1, { he: 'סוכות', ru: 'Суккот' }],
  ['2026-09-27', 5, { he: 'חול המועד סוכות', ru: 'Холь а-моэд Суккот' }, true],
  ['2026-10-03', 1, { he: 'שמחת תורה', ru: 'Симхат Тора' }],
  ['2026-12-05', 8, { he: 'חנוכה', ru: 'Ханука' }],
  ['2027-01-23', 1, { he: 'ט״ו בשבט', ru: 'Ту би-Шват' }],
  ['2027-03-23', 1, { he: 'פורים', ru: 'Пурим' }],
  ['2027-04-22', 1, { he: 'פסח', ru: 'Песах' }],
  ['2027-04-23', 5, { he: 'חול המועד פסח', ru: 'Холь а-моэд Песах' }, true],
  ['2027-04-28', 1, { he: 'שביעי של פסח', ru: 'Седьмой день Песаха' }],
  ['2027-05-12', 1, { he: 'יום העצמאות', ru: 'День независимости' }],
  ['2027-05-25', 1, { he: 'ל״ג בעומר', ru: 'Лаг ба-Омер' }],
  ['2027-06-11', 1, { he: 'שבועות', ru: 'Шавуот' }]
];
const SHABBAT_LIST = [
  { id: 'challah', he: 'חלה קטנה', ru: 'Маленькую халу' },
  { id: 'juice', he: 'מיץ ענבים', ru: 'Виноградный сок' },
  { id: 'fruit', he: 'פירות חתוכים לכל הקבוצה', ru: 'Нарезанные фрукты на всю группу' },
  { id: 'cake', he: 'עוגה או עוגיות ביתיות', ru: 'Домашний пирог или печенье' }
];

/* example week menu (Sun–Thu). Lunch with meat is followed by a parve מנחה. */
const MENU = [
  { b: { he: 'לחם מלא, גבינה לבנה וירקות', ru: 'Цельнозерновой хлеб, творожный сыр и овощи', a: ['gluten', 'milk'] }, l: { he: 'שניצל עוף אפוי, אורז וסלט', ru: 'Запечённый куриный шницель, рис и салат', a: ['gluten', 'egg'] }, s: { he: 'פירות וקרקרים', ru: 'Фрукты и крекеры', a: ['gluten'] } },
  { b: { he: 'חביתה, לחם ומלפפון', ru: 'Омлет, хлеб и огурец', a: ['egg', 'gluten'] }, l: { he: 'קציצות דג, פירה ושעועית ירוקה', ru: 'Рыбные котлетки, пюре и стручковая фасоль', a: ['fish', 'egg'] }, s: { he: 'עוגיות שיבולת שועל ותפוח', ru: 'Овсяное печенье и яблоко', a: ['gluten'] } },
  { b: { he: 'דייסת סולת עם קינמון', ru: 'Манная каша с корицей', a: ['gluten', 'milk'] }, l: { he: 'פתיתים עם עוף וירקות', ru: 'Птитим с курицей и овощами', a: ['gluten'] }, s: { he: 'חומוס, פיתה וירקות', ru: 'Хумус, пита и овощи', a: ['sesame', 'gluten'] } },
  { b: { he: 'פנקייק ביתי וגבינה', ru: 'Домашние панкейки и сыр', a: ['gluten', 'milk', 'egg'] }, l: { he: 'מרק עדשים ופשטידת ירקות', ru: 'Чечевичный суп и овощная запеканка', a: ['egg', 'milk'] }, s: { he: 'פירות העונה', ru: 'Сезонные фрукты', a: [] } },
  { b: { he: 'לחמנייה, טחינה וירקות', ru: 'Булочка, тхина и овощи', a: ['gluten', 'sesame'] }, l: { he: 'עוף בתנור, תפוחי אדמה וסלט', ru: 'Курица из духовки, картофель и салат', a: [] }, s: { he: 'במבה ופירות', ru: 'Бамба и фрукты', a: ['peanuts'] } }
];
const MEALS = [['b', 'sun', 'pa.menu.b'], ['l', 'plate', 'pa.menu.l'], ['s', 'apple', 'pa.menu.s']];

const ALBUM = [
  { m: 8, scene: 'firstday', cap: { he: 'היום הראשון בגן', ru: 'Первый день в саду' } },
  { m: 9, scene: 'sukkah', cap: { he: 'סוכה ראשונה', ru: 'Первая сукка' } },
  { m: 10, scene: 'music', cap: { he: 'מנגנת בחוג מוזיקה', ru: 'Играет на ксилофоне' } },
  { m: 11, scene: 'hanukkah', cap: { he: 'סביבון סוב סוב סוב', ru: 'Волчок на Хануку' } },
  { m: 0, scene: 'rain', cap: { he: 'מגפיים ושלוליות', ru: 'Сапожки и лужи' } },
  { m: 1, scene: 'bunny', cap: { he: 'פוגשים ארנבון בחוג טבע', ru: 'Знакомимся с кроликом' } },
  { m: 2, scene: 'purim', cap: { he: 'פרפר צבעוני בפורים', ru: 'Бабочка на Пурим' } },
  { m: 3, scene: 'spring', cap: { he: 'אביב בחצר', ru: 'Весна во дворе' } },
  { m: 4, scene: 'sport', cap: { he: 'בעיטה בחוג ספורט!', ru: 'Бьём по мячу на спорте!' } },
  { m: 5, scene: 'party', cap: { he: 'מסיבת סוף שנה', ru: 'Праздник в конце года' } }
];
const schoolYear = () => { const d = new Date(); return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1; };

/* =====================================================================
   ART · storybook paper-cut, Noa only (App.avatar-style head)
   ===================================================================== */
const SKIN = '#F6C9A6', HAIRC = '#8A5A2E', INK = '#1B1A4B', MAG = '#E8048C';
let uidN = 0;
const uid = p => `pa-${p}${++uidN}`;
const sp = (x, y, s, c, cls = '') => `<path${cls ? ` class="${cls}"` : ''} d="M${x} ${y - s}Q${x + s * .18} ${y - s * .18} ${x + s} ${y}Q${x + s * .18} ${y + s * .18} ${x} ${y + s}Q${x - s * .18} ${y + s * .18} ${x - s} ${y}Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z" fill="${c}"/>`;
const heartP = (x, y, s, c, cls = '') => `<path${cls ? ` class="${cls}"` : ''} transform="translate(${x} ${y}) scale(${s / 10})" d="M0 9C-13 1-13-10-5.5-10.5-2.6-10.7-.8-8.6 0-6.8c.8-1.8 2.6-3.9 5.5-3.7C13-10 13 1 0 9Z" fill="${c}"/>`;
const CL = '<circle cx="12" cy="14" r="9"/><circle cx="25" cy="9" r="11"/><circle cx="38" cy="14" r="8"/><rect x="3" y="13" width="44" height="10" rx="5"/>';
const cloud = (x, y, s = 1, c = '#fff', sh = 'rgba(1,112,168,.10)') => `<g transform="translate(${x} ${y}) scale(${s})"><g fill="${sh}" transform="translate(2 3)">${CL}</g><g fill="${c}">${CL}</g></g>`;
const skyGrad = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="320" height="200" fill="url(#${id})"/>`;
const hills = (a = '#A4D9BF', b = '#BDE6D2') => `<path d="M0 166C70 150 130 152 172 158S272 170 320 160V200H0Z" fill="${a}"/><path d="M0 176C80 164 150 166 204 172S292 180 320 174V200H0Z" fill="${b}"/>`;
const sunG = (x, y, r = 15) => `<g class="pa-a pa-a-spin" style="transform-origin:${x}px ${y}px">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="${x - 1.6}" y="${y - r - 10}" width="3.2" height="7" rx="1.6" fill="#FFC24D" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g><circle cx="${x}" cy="${y}" r="${r}" fill="#FFD27A"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .32}" fill="#FFF1BF"/>`;
const flower = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M0 0v9" stroke="#5DB58F" stroke-width="1.6"/><circle cx="-2.6" cy="-1" r="2.6" fill="${c}"/><circle cx="2.6" cy="-1" r="2.6" fill="${c}"/><circle cx="0" cy="-3.6" r="2.6" fill="${c}"/><circle cx="0" cy="1.4" r="2.6" fill="${c}"/><circle cx="0" cy="-1" r="1.6" fill="#FFD27A"/></g>`;
const bunting = (y, n = 9, x0 = 30, x1 = 290) => {
  const cs = [MAG, '#01AEF2', '#FFD27A', '#F6B0C6', '#7FC8A9'];
  let s = `<path d="M${x0} ${y}Q160 ${y + 22} ${x1} ${y}" stroke="#C98E4A" stroke-width="1.6" fill="none"/>`;
  for (let i = 0; i < n; i++) {
    const k = (i + .5) / n, x = x0 + (x1 - x0) * k, yy = y + 22 * 2 * k * (1 - k) * .98 + .5;
    s += `<path d="M${x - 8} ${yy}h16l-8 13Z" fill="${cs[i % cs.length]}"/>`;
  }
  return s;
};

function noaHead(x, y, r, o = {}) {
  const eyes = o.sleep
    ? `<path d="M-5.6 1q1.8 1.6 3.6 0M2 1q1.8 1.6 3.6 0" stroke="${INK}" stroke-width="1.15" fill="none" stroke-linecap="round"/>`
    : `<circle cx="-3.7" cy=".7" r="1.35" fill="${INK}"/><circle cx="3.7" cy=".7" r="1.35" fill="${INK}"/><circle cx="-3.25" cy=".2" r=".42" fill="#fff"/><circle cx="4.15" cy=".2" r=".42" fill="#fff"/>`;
  const mouth = o.sleep ? `<path d="M-1.3 4.8q1.3.8 2.6 0" stroke="${INK}" stroke-width="1" fill="none" stroke-linecap="round"/>`
    : o.open ? `<path d="M-2.7 3.6q2.7 4.4 5.4 0Z" fill="${INK}"/><path d="M-1.3 5.6q1.3.7 2.6 0" stroke="#F27FA5" stroke-width="1" fill="none"/>`
      : `<path d="M-2.6 3.9q2.6 2.6 5.2 0" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y})${o.rot ? ` rotate(${o.rot})` : ''} scale(${r / 10})">
    <circle cx="-11.8" cy="-1" r="4.3" fill="${HAIRC}"/><circle cx="11.8" cy="-1" r="4.3" fill="${HAIRC}"/>
    <circle cx="-10" cy="1.2" r="2.4" fill="${SKIN}"/><circle cx="10" cy="1.2" r="2.4" fill="${SKIN}"/>
    <circle r="10" fill="${SKIN}"/>
    <path d="M-9.8-.6C-9.8-7-5.4-11.2 0-11.2S9.8-7 9.8-.6C7-3.4 3.6-4.6 0-4.6S-7-3.4-9.8-.6Z" fill="${HAIRC}"/>
    <circle cx="-9.4" cy="-4" r="1.9" fill="${MAG}"/><circle cx="9.4" cy="-4" r="1.9" fill="${MAG}"/>
    ${eyes}<circle cx="-6.2" cy="3.6" r="1.8" fill="#F27FA5" opacity=".5"/><circle cx="6.2" cy="3.6" r="1.8" fill="#F27FA5" opacity=".5"/>${mouth}${o.extra || ''}</g>`;
}
/* Noa standing (feet at gy). o: s, armL/armR [x,y] hand positions, pose 'stand'|'sit'|'kick', shirt, shoes, behind, front, top, head opts */
function noa(x, gy, o = {}) {
  const sh = o.shirt || MAG, pa = o.pants || '#2D2B6B', shoe = o.shoes || '#fff';
  const A = o.armL || [-10, -12], B = o.armR || [10, -12];
  const arm = (x1, y1, p, cls = '') => `<g${cls ? ` class="${cls}"` : ''}><path d="M${x1} ${y1}L${p[0]} ${p[1]}" stroke="${sh}" stroke-width="5.2" stroke-linecap="round"/><circle cx="${p[0]}" cy="${p[1]}" r="2.8" fill="${SKIN}"/></g>`;
  let legs;
  if (o.pose === 'sit') legs = `<rect x="-6" y="-6" width="4.8" height="13" rx="2.4" fill="${pa}"/><rect x="1.2" y="-6" width="4.8" height="13" rx="2.4" fill="${pa}"/><ellipse cx="-3.6" cy="7.4" rx="3.4" ry="2.3" fill="${shoe}"/><ellipse cx="3.6" cy="7.4" rx="3.4" ry="2.3" fill="${shoe}"/>`;
  else if (o.pose === 'kick') legs = `<rect x="-5.8" y="-12" width="4.8" height="12" rx="2.4" fill="${pa}"/><ellipse cx="-3.6" cy="-.4" rx="3.6" ry="2.2" fill="${shoe}"/><g transform="rotate(-62 3.4 -11)"><rect x="1" y="-12" width="4.8" height="12" rx="2.4" fill="${pa}"/><ellipse cx="3.6" cy="-.4" rx="3.6" ry="2.2" fill="${shoe}"/></g>`;
  else legs = `<rect x="-5.8" y="-12" width="4.8" height="12" rx="2.4" fill="${pa}"/><rect x="1" y="-12" width="4.8" height="12" rx="2.4" fill="${pa}"/><ellipse cx="-3.8" cy="-.4" rx="3.7" ry="2.3" fill="${shoe}"/><ellipse cx="3.8" cy="-.4" rx="3.7" ry="2.3" fill="${shoe}"/>`;
  const body = `<path d="M-10.5-9C-10-21.5-6.4-26.5 0-26.5S10-21.5 10.5-9c0 1.6-1.2 2.6-2.8 2.6H-7.7c-1.6 0-2.8-1-2.8-2.6Z" fill="${sh}"/><path d="M-4-26c1.3 1.8 2.6 2.6 4 2.6S2.7-24.2 4-26" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  return `<g transform="translate(${x} ${gy}) scale(${o.s || 1})">${o.behind || ''}${legs}${body}${o.front || ''}${arm(-7, -22, A, o.armLc)}${arm(7, -22, B, o.armRc)}${noaHead(0, -36, 11, o.head || {})}${o.top || ''}</g>`;
}
const svgScene = (inner, label) => `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} focusable="false">${inner}</svg>`;

const SCENES = {
  music() {
    const cs = [MAG, '#FFB547', '#FFD27A', '#7FC8A9', '#01AEF2', '#9B8CE8'];
    let bars = '';
    cs.forEach((c, i) => { const x = 104 + i * 19, hh = 34 - i * 3.2, y = 163 - hh / 2; bars += `<rect x="${x}" y="${y + 2}" width="15" height="${hh}" rx="4" fill="rgba(27,26,75,.15)"/><rect x="${x}" y="${y}" width="15" height="${hh}" rx="4" fill="${c}"/><circle cx="${x + 7.5}" cy="${y + 4.5}" r="1.5" fill="#fff" opacity=".8"/><circle cx="${x + 7.5}" cy="${y + hh - 4.5}" r="1.5" fill="#fff" opacity=".8"/>`; });
    const note = (x, y, c, d) => `<g class="pa-a pa-a-note" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="5.2" ry="3.9" transform="rotate(-20 ${x} ${y})" fill="${c}"/><path d="M${x + 4.4} ${y - 1}V${y - 21}c3 2 7 3 8 8" stroke="${c}" stroke-width="2.3" fill="none" stroke-linecap="round"/></g>`;
    let dots = ''; for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) dots += `<circle cx="${18 + i * 36 + (j % 2) * 18}" cy="${22 + j * 30}" r="3" fill="#F9D3E3"/>`;
    return `<rect width="320" height="200" fill="#FDECF3"/>${dots}${bunting(26, 9)}
      <rect y="168" width="320" height="32" fill="#F7DDB9"/><path d="M0 168h320" stroke="#E7B47A" stroke-width="3"/>
      ${noa(160, 180, { s: 2.05, armL: [-15, -15], armR: [15, -15], head: { open: true } })}
      <path d="M96 150L224 150L236 178L84 178Z" fill="#E7B47A"/><path d="M98 147h124" stroke="#B9783A" stroke-width="4" stroke-linecap="round"/><path d="M90 176h140" stroke="#B9783A" stroke-width="4" stroke-linecap="round"/>
      ${bars}
      <path d="M129 149l-11 9" stroke="#C98E4A" stroke-width="2.6" stroke-linecap="round"/><circle cx="116" cy="159.5" r="4.6" fill="#fff"/><circle cx="116" cy="159.5" r="2.6" fill="${MAG}"/>
      <path d="M191 149l12 8" stroke="#C98E4A" stroke-width="2.6" stroke-linecap="round"/><circle cx="205" cy="158.5" r="4.6" fill="#fff"/><circle cx="205" cy="158.5" r="2.6" fill="#01AEF2"/>
      ${note(92, 92, MAG, 0)}${note(230, 80, '#01AEF2', -.8)}${note(250, 120, '#9B8CE8', -1.6)}${note(70, 128, '#FFB547', -2.2)}
      ${sp(214, 52, 6, '#FFC24D', 'pa-a pa-a-tw')}${sp(104, 60, 4.5, MAG, 'pa-a pa-a-tw')}`;
  },
  swing(season = 'autumn') {
    const id = uid('sw');
    const autumn = season === 'autumn';
    const canopy = autumn ? ['#FFB547', '#F49BB6', '#FFD27A'] : ['#7FC8A9', '#9AD9B5', '#7FC8A9'];
    const leaf = (x, y, c, d) => `<path class="pa-a pa-a-fall" style="animation-delay:${d}s" d="M${x} ${y}c4-6 10-6 12 0-4 5-9 6-12 0Z" fill="${c}"/>`;
    const blossoms = autumn ? '' : [[34, 70], [52, 58], [62, 80], [22, 88], [46, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#F6B0C6"/><circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join('');
    const bfly = autumn ? '' : `<g class="pa-a pa-a-bob"><path d="M262 108c-8-10-16-2-8 4-8 4 0 12 8 2 8 10 16 2 8-2 8-6 0-14-8-4Z" fill="#9B8CE8"/><path d="M262 104v12" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/></g>`;
    return `${skyGrad(id, '#BFE6FC', '#EEF8FE')}${sunG(268, 46)}${cloud(150, 18, .9)}${cloud(222, 92, .7)}
      ${hills()}
      <rect x="40" y="96" width="9" height="74" rx="4" fill="#B9783A"/>
      <circle cx="30" cy="84" r="22" fill="${canopy[0]}"/><circle cx="58" cy="76" r="20" fill="${canopy[1]}"/><circle cx="44" cy="62" r="20" fill="${canopy[2]}"/>${blossoms}
      ${autumn ? '' : flower(240, 176, '#F6B0C6') + flower(274, 170, '#FFD27A') + flower(70, 182, '#9B8CE8')}
      <path d="M118 36L100 182M202 36L220 182" stroke="#B9783A" stroke-width="7" stroke-linecap="round"/>
      <rect x="104" y="30" width="112" height="9" rx="4.5" fill="#C98E4A"/>
      <g class="pa-a pa-a-swing" style="transform-origin:160px 36px">
        <path d="M146 38V130M174 38V130" stroke="#8A5A2E" stroke-width="2.2"/>
        ${noa(160, 132, { s: 1.55, pose: 'sit', armL: [-9, -25], armR: [9, -25], head: { open: true } })}
        <rect x="134" y="128" width="52" height="7" rx="3.5" fill="${MAG}"/>
      </g>
      ${autumn ? leaf(70, 110, '#FFB547', 0) + leaf(244, 70, '#F49BB6', -1.4) + leaf(196, 100, '#FFD27A', -2.6) + leaf(282, 128, '#FFB547', -3.4) : ''}
      ${bfly}${sp(232, 132, 4.5, '#fff', 'pa-a pa-a-tw')}`;
  },
  spring() { return SCENES.swing('spring'); },
  sleep() {
    const id = uid('nt'), gl = uid('gl');
    const stars = [[28, 30, 3], [70, 18, 2.4], [120, 34, 3.2], [196, 22, 2.6], [292, 48, 3], [150, 70, 2], [40, 84, 2.2]].map(([x, y, s], i) => sp(x, y, s, '#FFD27A', 'pa-a pa-a-tw')).join('');
    const z = (x, y, s, d) => `<path class="pa-a pa-a-z" style="animation-delay:${d}s" d="M${x} ${y}h${s}l-${s} ${s * 1.1}h${s}" stroke="#FFD27A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    let blanketStars = ''; [[136, 140], [166, 132], [196, 136], [226, 142], [150, 158], [184, 154], [214, 160], [242, 156]].forEach(([x, y]) => { blanketStars += sp(x, y, 4.2, '#FFD27A'); });
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3290"/><stop offset="1" stop-color="#181C5E"/></linearGradient><radialGradient id="${gl}"><stop offset="0" stop-color="#FFD27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>
      <rect width="320" height="200" fill="url(#${id})"/>${stars}
      <path d="M226 106V62a28 28 0 0 1 56 0v44Z" fill="#3B4196"/><path d="M232 106V63a22 22 0 0 1 44 0v43Z" fill="#141852"/>
      <path d="M262 60a11 11 0 1 0 6 18 13 13 0 0 1-6-18Z" fill="#FFD27A"/>${sp(244, 74, 2.4, '#fff')}${sp(266, 94, 2, '#fff')}
      <path d="M254 46v60M232 84h44" stroke="#3B4196" stroke-width="3"/>
      <circle cx="56" cy="160" r="40" fill="url(#${gl})"/><path d="M48 168h16l-3-12h-10Z" fill="#F6B0C6"/><path d="M44 158a12 10 0 0 1 24 0Z" fill="#FFD27A"/>
      <rect y="176" width="320" height="24" fill="#20256E"/>
      <rect x="78" y="150" width="210" height="30" rx="14" fill="#E9B8CE"/><rect x="78" y="146" width="210" height="28" rx="14" fill="#F3CFDF"/>
      <ellipse cx="114" cy="140" rx="30" ry="13" fill="#fff"/>
      ${noaHead(116, 128, 15, { sleep: true, rot: -14 })}
      <path d="M128 134C160 118 236 120 268 136c6 3 8 8 8 14v10H124v-14c0-5 1-9 4-12Z" fill="#01AEF2"/><path d="M126 140c40-10 100-10 150 6" stroke="#7FD3F7" stroke-width="3" fill="none" opacity=".7"/>
      ${blanketStars}
      ${z(150, 100, 7, 0)}${z(166, 80, 9, -1)}${z(186, 56, 11, -2)}`;
  },
  firstday() {
    const id = uid('fd');
    let bumps = ''; for (let i = 0; i < 6; i++) bumps += 'a9 9 0 0 1 18 0';
    return `${skyGrad(id, '#C7E8FC', '#FDEFF5')}${cloud(28, 24, .8)}${cloud(120, 12, .6)}${sp(110, 70, 5, '#FFC24D', 'pa-a pa-a-tw')}
      ${hills()}
      <path d="M200 182V66${bumps}V182Z" fill="#F3DCE8"/><path d="M196 182V62${bumps}V182Z" fill="#fff"/>
      <circle cx="212" cy="92" r="7.5" fill="#F3DCE8"/><circle cx="212" cy="92" r="5" fill="#3E3B7E"/><circle cx="292" cy="92" r="7.5" fill="#F3DCE8"/><circle cx="292" cy="92" r="5" fill="#3E3B7E"/>
      <path d="M224 182v-38a28 28 0 0 1 56 0v38Z" fill="#F9BCD0"/><path d="M231 182v-37a21 21 0 0 1 42 0v37Z" fill="#FFE4A3"/><path d="M231 182v-37a21 21 0 0 1 10-17.6V182Z" fill="#A3026A"/>
      ${heartP(252, 106, 7, '#F6B0C6')}<path d="M252 52V32" stroke="#2D2B6B" stroke-width="2" stroke-linecap="round"/><path class="pa-a pa-a-flag" d="M253 32c7-2 10 3 17 1-4 5-10 6-17 8Z" fill="${MAG}"/>
      <path d="M40 194C100 182 170 186 226 184" stroke="#fff" stroke-width="4" stroke-dasharray="0 10" stroke-linecap="round" fill="none"/>
      ${noa(140, 184, { s: 2.05, armL: [-11, -12], armR: [16, -38], armRc: 'pa-a pa-a-wave', head: { open: true },
        behind: `<rect x="-13" y="-27" width="26" height="19" rx="7" fill="#01AEF2"/><rect x="-13" y="-27" width="26" height="6" rx="3" fill="#7FD3F7"/>`,
        front: `<path d="M-6-25.5L-7-12M6-25.5L7-12" stroke="#0270A8" stroke-width="2.4" stroke-linecap="round"/>` })}
      ${sp(186, 128, 4.5, MAG, 'pa-a pa-a-tw')}`;
  },
  sukkah() {
    const id = uid('sk');
    let leaves = ''; for (let i = 0; i < 16; i++) { const x = 18 + i * 19; leaves += `<ellipse cx="${x}" cy="${44 + (i % 2) * 6}" rx="16" ry="8" transform="rotate(${(i % 3 - 1) * 14} ${x} 46)" fill="${['#7FC8A9', '#9AD9B5', '#5DB58F'][i % 3]}"/>`; }
    const hang = (x, len, kind, d) => {
      const y = 56 + len;
      const orn = kind === 'pom' ? `<circle cx="${x}" cy="${y + 7}" r="7" fill="${MAG}"/><path d="M${x - 3} ${y}h6l-1 2h-4Z" fill="#A3026A"/>`
        : kind === 'star' ? sp(x, y + 7, 7, '#FFD27A') : `<circle cx="${x}" cy="${y + 6}" r="6" fill="#FFB547"/><path d="M${x} ${y}v-2" stroke="#5DB58F" stroke-width="2"/>`;
      return `<g class="pa-a pa-a-sway" style="animation-delay:${d}s;transform-origin:${x}px 56px"><path d="M${x} 56V${y}" stroke="#C98E4A" stroke-width="1.2"/>${orn}</g>`;
    };
    let chain = ''; for (let i = 0; i < 11; i++) { const x = 60 + i * 20, y = 74 + Math.sin(i / 10 * Math.PI) * 16; chain += `<ellipse cx="${x}" cy="${y}" rx="7" ry="4.6" fill="none" stroke="${[MAG, '#01AEF2', '#FFD27A', '#7FC8A9'][i % 4]}" stroke-width="3" transform="rotate(${i % 2 ? 60 : -10} ${x} ${y})"/>`; }
    return `${skyGrad(id, '#D6EEFC', '#FFF6EA')}
      <rect x="24" y="56" width="272" height="124" fill="#FDE8C8"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${36 + i * 38}" y="56" width="16" height="124" fill="#FADDB2"/>`).join('')}
      <rect x="18" y="50" width="10" height="134" rx="4" fill="#C98E4A"/><rect x="292" y="50" width="10" height="134" rx="4" fill="#C98E4A"/>
      ${chain}
      <rect y="176" width="320" height="24" fill="#EBCB98"/><path d="M0 176h320" stroke="#D9AE6E" stroke-width="3"/>
      ${noa(160, 186, { s: 2.0, armL: [-15, -33], armR: [15, -33], head: { open: true } })}
      ${leaves}
      ${hang(46, 22, 'pom', 0)}${hang(276, 26, 'pom', -1)}${hang(96, 10, 'star', -.6)}${hang(228, 12, 'orange', -1.6)}${hang(130, 4, 'orange', -2.1)}${hang(196, 6, 'star', -.3)}`;
  },
  hanukkah() {
    const id = uid('hn'), gl = uid('hg');
    const stars = [[30, 24], [80, 46], [264, 20], [300, 64], [214, 40], [140, 18]].map(([x, y]) => sp(x, y, 2.6, '#FFD27A', 'pa-a pa-a-tw')).join('');
    let cand = ''; const cc = ['#01AEF2', '#F6B0C6', '#FFD27A', '#7FC8A9', '#fff', '#9B8CE8', '#F6B0C6', '#01AEF2', '#FFD27A'];
    for (let i = 0; i < 9; i++) { const x = 32 + i * 11, top = i === 4 ? 112 : 120; cand += `<rect x="${x - 2.6}" y="${top}" width="5.2" height="${136 - top}" rx="2" fill="${cc[i]}"/><path class="pa-a pa-a-flame" style="animation-delay:${-i * .17}s" d="M${x} ${top - 11}c4 5 4 9 0 9s-4-4 0-9Z" fill="#FFC24D"/>`; }
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3290"/><stop offset="1" stop-color="#3A2F86"/></linearGradient><radialGradient id="${gl}"><stop offset="0" stop-color="#FFD27A" stop-opacity=".5"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>
      <rect width="320" height="200" fill="url(#${id})"/>${stars}
      <circle cx="76" cy="118" r="58" fill="url(#${gl})"/>
      ${noa(170, 186, { s: 2.0, armL: [-6, -27], armR: [6, -27], head: { open: true } })}
      <rect y="150" width="320" height="50" fill="#F7DDB9"/><rect y="146" width="320" height="8" rx="4" fill="#E7B47A"/>
      <rect x="26" y="136" width="100" height="6" rx="3" fill="#E7B47A"/><rect x="72" y="140" width="8" height="10" fill="#E7B47A"/><rect x="58" y="146" width="36" height="5" rx="2.5" fill="#C98E4A"/>
      ${cand}
      <g class="pa-a pa-a-wobble" style="transform-origin:256px 148px">
        <path d="M242 112h28v26l-14 14-14-14Z" fill="#01AEF2"/><path d="M242 112h28v8h-28Z" fill="#7FD3F7"/><rect x="253" y="100" width="6" height="13" rx="3" fill="#0270A8"/>
        ${sp(256, 128, 5, '#FFD27A')}
      </g>
      <ellipse cx="216" cy="150" rx="16" ry="3.6" fill="rgba(27,26,75,.15)"/><path d="M202 146a14 11 0 0 1 28 0Z" fill="#E7A35C"/><path d="M204 140a12 6 0 0 1 24 0c-3 2-6 1-8 3-3-2-6 0-9-1-3 1-5 0-7-2Z" fill="#F6B0C6"/><circle cx="216" cy="136" r="2" fill="${MAG}"/>`;
  },
  rain() {
    const id = uid('rn');
    let drops = ''; for (let i = 0; i < 26; i++) { const x = (i * 37) % 320 + 6, y = (i * 53) % 150; drops += `<path d="M${x} ${y}l-3 9" stroke="#8FC0E3" stroke-width="2" stroke-linecap="round"/>`; }
    return `${skyGrad(id, '#C9DFF0', '#EDF5FB')}
      <g class="pa-a pa-a-rain">${drops}<g transform="translate(0 -150)">${drops}</g></g>
      ${cloud(10, 6, 1.2, '#B9D2E6', 'rgba(27,26,75,.08)')}${cloud(200, 2, 1.4, '#C7DBEA', 'rgba(27,26,75,.08)')}
      <path d="M0 176C90 168 220 168 320 176V200H0Z" fill="#9AD9B5"/>
      <ellipse cx="160" cy="188" rx="84" ry="10" fill="#7FCBF2"/><ellipse cx="148" cy="186" rx="46" ry="4" fill="#B5E3F9"/>
      <ellipse class="pa-a pa-a-ripple" cx="214" cy="190" rx="10" ry="2.6" fill="none" stroke="#fff" stroke-width="1.4"/>
      ${noa(160, 186, { s: 2.0, shoes: '#FFB547', armL: [-11, -13], armR: [11, -25], head: { open: true },
        top: `<path d="M11-25V-62" stroke="#2D2B6B" stroke-width="1.8"/><path d="M-19-58C-17-78 41-78 41-58c-3.4-2.4-6.8-2.4-10 0-3.4-2.4-6.8-2.4-10 0-3.4-2.4-6.8-2.4-10 0-3.4-2.4-6.8-2.4-10 0-3.4-2.4-6.8-2.4-10 0-3.4-2.4-6.8-2.4-10 0Z" fill="${MAG}"/><path d="M11-75c-5 4-6 11-6 17M11-75c5 4 6 11 6 17" stroke="#F6B0C6" stroke-width="2.4" fill="none"/><circle cx="11" cy="-76" r="1.8" fill="#A3026A"/>` })}
      <path d="M118 182l-6-5M120 178l-3-7M202 182l6-5M200 178l3-7" stroke="#7FCBF2" stroke-width="2" stroke-linecap="round"/>`;
  },
  bunny() {
    const id = uid('bn');
    return `${skyGrad(id, '#CDEBFC', '#F4FBF7')}${cloud(200, 20, .8)}${sunG(46, 42, 13)}
      ${hills('#9AD9B5', '#BDE6D2')}
      ${flower(24, 176, '#F6B0C6')}${flower(290, 170, '#FFD27A')}${flower(270, 184, '#9B8CE8')}
      ${noa(118, 186, { s: 2.0, armL: [-11, -13], armR: [17, -18], head: { open: true } })}
      <g class="pa-a pa-a-hop" style="transform-origin:212px 182px">
        <ellipse cx="214" cy="182" rx="22" ry="3.6" fill="rgba(27,26,75,.10)"/>
        <ellipse cx="214" cy="164" rx="21" ry="17" fill="#ECE8F6"/><ellipse cx="212" cy="162" rx="20" ry="16" fill="#fff"/>
        <circle cx="194" cy="162" r="6" fill="#fff"/>
        <ellipse cx="236" cy="128" rx="4.6" ry="14" transform="rotate(-12 236 128)" fill="#fff"/><ellipse cx="236" cy="129" rx="2.2" ry="10" transform="rotate(-12 236 129)" fill="#F6B0C6"/>
        <ellipse cx="246" cy="130" rx="4.6" ry="14" transform="rotate(14 246 130)" fill="#fff"/><ellipse cx="246" cy="131" rx="2.2" ry="10" transform="rotate(14 246 131)" fill="#F6B0C6"/>
        <circle cx="238" cy="150" r="13" fill="#fff"/><circle cx="242" cy="148" r="1.8" fill="${INK}"/><ellipse cx="250" cy="153" rx="2.2" ry="1.7" fill="#F27FA5"/><circle cx="236" cy="155" r="2.6" fill="#F27FA5" opacity=".4"/>
        <ellipse cx="224" cy="178" rx="7" ry="3.6" fill="#fff"/>
      </g>
      <path d="M260 172l14-5-11 13Z" fill="#FFB547"/><path d="M273 167l6-5M274 168l7-1" stroke="#5DB58F" stroke-width="2" stroke-linecap="round"/>
      ${heartP(176, 102, 7, '#F45BAE', 'pa-a pa-a-bob')}${sp(150, 76, 4, '#FFC24D', 'pa-a pa-a-tw')}`;
  },
  purim() {
    let conf = ''; const cc = [MAG, '#01AEF2', '#FFD27A', '#7FC8A9', '#9B8CE8'];
    for (let i = 0; i < 26; i++) { const x = (i * 47) % 310 + 6, y = (i * 29) % 150 + 6; conf += i % 3 ? `<rect x="${x}" y="${y}" width="6" height="3.4" rx="1.2" fill="${cc[i % 5]}" transform="rotate(${i * 37} ${x} ${y})"/>` : `<circle cx="${x}" cy="${y}" r="2.6" fill="${cc[i % 5]}"/>`; }
    const wing = (sx) => `<g transform="scale(${sx} 1)"><ellipse cx="17" cy="-27" rx="15" ry="11" transform="rotate(-24 17 -27)" fill="#9B8CE8"/><ellipse cx="14" cy="-12" rx="10" ry="7.5" transform="rotate(20 14 -12)" fill="#F6B0C6"/><circle cx="20" cy="-29" r="3" fill="#fff" opacity=".8"/><circle cx="14" cy="-12" r="2.2" fill="#fff" opacity=".8"/></g>`;
    return `<rect width="320" height="200" fill="#FDE7F0"/><g class="pa-a pa-a-drift">${conf}</g>
      <path d="M0 40c40-20 60 20 100 0s60-20 100 0 60 20 120 0" stroke="#01AEF2" stroke-width="3" fill="none" opacity=".45"/>
      <path d="M0 176C80 168 240 168 320 176V200H0Z" fill="#F3CFDF"/>
      ${noa(160, 186, { s: 2.05, armL: [-15, -34], armR: [15, -34], head: { open: true },
        behind: `<g class="pa-a pa-a-flap" style="transform-origin:0 -20px">${wing(1)}${wing(-1)}</g>`,
        top: `<path d="M-4-46c-2-6-6-9-10-10M4-46c2-6 6-9 10-10" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="-14" cy="-56" r="2.6" fill="${MAG}"/><circle cx="14" cy="-56" r="2.6" fill="${MAG}"/>` })}
      ${sp(80, 92, 6, '#FFC24D', 'pa-a pa-a-tw')}${sp(246, 84, 5, MAG, 'pa-a pa-a-tw')}`;
  },
  sport() {
    const id = uid('sp');
    return `${skyGrad(id, '#C7E8FC', '#F0FAFF')}${cloud(30, 20, .8)}${cloud(220, 34, .7)}
      <path d="M0 150C100 140 220 140 320 150V200H0Z" fill="#9AD9B5"/><path d="M0 174C100 166 220 166 320 174" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>
      <path d="M262 182l9-30 9 30Z" fill="#FFB547"/><path d="M265.5 170h11" stroke="#fff" stroke-width="3"/><path d="M290 182l8-26 8 26Z" fill="#FFB547"/><path d="M293 172h10" stroke="#fff" stroke-width="3"/>
      ${noa(128, 186, { s: 2.0, pose: 'kick', armL: [-17, -27], armR: [14, -14], head: { open: true } })}
      <g class="pa-a pa-a-ball" style="transform-origin:204px 160px">
        <path d="M168 158c8-4 14-6 20-6M170 170c6-2 12-2 18-2" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
        <circle cx="204" cy="160" r="14" fill="#fff"/><path d="M204 151l6 4-2 7h-8l-2-7Z" fill="${MAG}"/><circle cx="194" cy="166" r="2.6" fill="#01AEF2"/><circle cx="214" cy="166" r="2.6" fill="#01AEF2"/><circle cx="204" cy="172" r="2.2" fill="#01AEF2"/>
      </g>
      ${sp(240, 108, 5, '#FFC24D', 'pa-a pa-a-tw')}${sp(170, 98, 3.6, MAG, 'pa-a pa-a-tw')}`;
  },
  party() {
    const id = uid('pt');
    const balloon = (x, y, c, hx, hy, d) => `<g class="pa-a pa-a-float" style="animation-delay:${d}s"><path d="M${x} ${y + 21}Q${(x + hx) / 2 + 6} ${(y + hy) / 2 + 10} ${hx} ${hy}" stroke="#4A4873" stroke-width="1.1" fill="none"/><ellipse cx="${x}" cy="${y}" rx="15" ry="19" fill="${c}"/><path d="M${x - 3} ${y + 21}h6l-3-4Z" fill="${c}"/><ellipse cx="${x - 5}" cy="${y - 7}" rx="3.6" ry="5.4" fill="#fff" opacity=".45"/></g>`;
    let conf = ''; for (let i = 0; i < 16; i++) { const x = (i * 61) % 300 + 10, y = (i * 23) % 120 + 40; conf += `<rect x="${x}" y="${y}" width="5" height="3" rx="1" fill="${[MAG, '#01AEF2', '#FFD27A', '#7FC8A9'][i % 4]}" transform="rotate(${i * 41} ${x} ${y})"/>`; }
    return `${skyGrad(id, '#FDEFF5', '#D9F0FD')}${bunting(20, 10)}${conf}
      <path d="M0 176C80 168 240 168 320 176V200H0Z" fill="#F3CFDF"/>
      ${balloon(96, 70, MAG, 128, 140, 0)}${balloon(130, 52, '#01AEF2', 130, 140, -1.1)}${balloon(226, 66, '#FFD27A', 192, 140, -2)}
      ${noa(160, 186, { s: 2.0, armL: [-15, -27], armR: [15, -27], head: { open: true },
        top: `<path d="M-8-45L1-70 9-45Z" fill="#01AEF2"/><path d="M-5.6-51.5l11.5-1.2M-2.8-58.5l7.4-.8" stroke="#FFD27A" stroke-width="2.4"/><circle cx="1" cy="-71" r="3.4" fill="${MAG}"/>` })}
      <rect x="228" y="150" width="46" height="30" rx="6" fill="#fff"/><path d="M228 158c6 4 10 4 15 0s10 4 15 0 10 4 16 0" stroke="#F6B0C6" stroke-width="4" fill="none"/><rect x="249" y="134" width="4" height="16" rx="2" fill="#01AEF2"/><path class="pa-a pa-a-flame" d="M251 122c4 5 4 9 0 9s-4-4 0-9Z" fill="#FFC24D"/>
      ${sp(60, 130, 5, '#FFC24D', 'pa-a pa-a-tw')}${sp(280, 110, 4, MAG, 'pa-a pa-a-tw')}`;
  }
};
const scene = (key, label) => svgScene((SCENES[key] || SCENES.music)(), label);

/* login illustration: castle door ajar, Noa peeking */
function loginArt() {
  let bumps = ''; for (let i = 0; i < 7; i++) bumps += 'a10 10 0 0 1 20 0';
  const tower = (x, w, roof, ty = 118) => `<rect x="${x + 3}" y="${ty + 4}" width="${w}" height="${250 - ty}" fill="#F3DCE8"/><rect x="${x}" y="${ty}" width="${w}" height="${250 - ty}" fill="#fff"/>
    <path d="M${x - 8} ${ty + 4}L${x + w / 2} ${roof}L${x + w + 8} ${ty + 4}Q${x + w / 2} ${ty + 12} ${x - 8} ${ty + 4}Z" fill="#F49BB6"/><path d="M${x - 8} ${ty + 2}L${x + w / 2} ${roof - 2}L${x + w / 2} ${ty + 8}Q${x + w / 4} ${ty + 8} ${x - 8} ${ty + 2}Z" fill="#F6B0C6"/>
    <path d="M${x + w / 2} ${roof}V${roof - 18}" stroke="#2D2B6B" stroke-width="2" stroke-linecap="round"/><path class="pa-a pa-a-flag" d="M${x + w / 2 + 1} ${roof - 18}c7-2 10 3 17 1-4 5-10 6-17 8Z" fill="${MAG}"/>
    <path d="M${x + w / 2 - 7} ${ty + 54}v-8a7 7 0 0 1 14 0v8Z" fill="#3E3B7E"/><path d="M${x + w / 2 - 7} ${ty + 54}v-8a7 7 0 0 1 7-7v15Z" fill="#545097"/>`;
  return `<svg viewBox="0 0 360 250" class="pa-login__svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="pa-lg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE6FC"/><stop offset="1" stop-color="#FDEAF2"/></linearGradient>
      <radialGradient id="pa-lg-glow" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="#FFF6DC"/><stop offset=".55" stop-color="#FFE4A3"/><stop offset="1" stop-color="#FFC979"/></radialGradient>
      <radialGradient id="pa-lg-halo"><stop offset="0" stop-color="#FFE4A3" stop-opacity=".9"/><stop offset="1" stop-color="#FFE4A3" stop-opacity="0"/></radialGradient>
      <clipPath id="pa-lg-arch"><path d="M24 228V140C24 66 94 14 180 14s156 52 156 126v88a14 14 0 0 1-14 14H38a14 14 0 0 1-14-14Z"/></clipPath>
    </defs>
    <path d="M18 230V140C18 62 92 8 180 8s162 54 162 132v90a18 18 0 0 1-18 18H36a18 18 0 0 1-18-18Z" fill="#F6B0C6" opacity=".55" transform="translate(5 6)"/>
    <path d="M18 230V140C18 62 92 8 180 8s162 54 162 132v90a18 18 0 0 1-18 18H36a18 18 0 0 1-18-18Z" fill="#fff"/>
    <g clip-path="url(#pa-lg-arch)">
      <rect width="360" height="250" fill="url(#pa-lg-sky)"/>
      ${sunG(180, 58, 15)}
      ${cloud(46, 64, .85)}${cloud(232, 40, .75)}
      ${sp(124, 40, 5, MAG, 'pa-a pa-a-tw')}${sp(292, 104, 4, '#01AEF2', 'pa-a pa-a-tw')}${sp(52, 122, 3.6, '#FFC24D', 'pa-a pa-a-tw')}
      <path d="M0 214C80 196 150 200 196 206S300 218 360 208V250H0Z" fill="#A4D9BF"/>
      ${tower(72, 42, 86)}${tower(246, 42, 86)}
      <path d="M110 244V124${bumps}V244Z" fill="#F3DCE8" transform="translate(4 4)"/>
      <path d="M110 244V124${bumps}V244Z" fill="#fff"/>
      <path d="M118 112c20 10 40 14 62 14s42-4 62-14" stroke="#C98E4A" stroke-width="1.4" fill="none"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => { const x = 126 + i * 18, y = 116 + Math.sin((i + .5) / 7 * Math.PI) * 9; return `<circle class="pa-a pa-a-tw" style="animation-delay:${-i * .3}s" cx="${x}" cy="${y}" r="3" fill="${['#FFD27A', '#F6B0C6', '#7FD3F7'][i % 3]}"/>`; }).join('')}
      <circle class="pa-lg-halo" cx="180" cy="200" r="58" fill="url(#pa-lg-halo)"/>
      <path d="M140 244v-56a40 40 0 0 1 80 0v56Z" fill="#F9BCD0"/>
      <path d="M148 244v-55a32 32 0 0 1 64 0v55Z" fill="url(#pa-lg-glow)"/>
      <g class="pa-lg-noa">
        <path d="M188 244v-22c0-7 4-12 10-12s10 5 10 12v22Z" fill="${MAG}"/>
        ${noaHead(200, 196, 15, { rot: 12, open: false })}
        <circle cx="210" cy="216" r="4" fill="${SKIN}"/>
      </g>
      <g class="pa-lg-leaf"><path d="M148 244v-55a32 32 0 0 1 32-32v87Z" fill="#A3026A"/><path d="M180 157a32 32 0 0 0-32 32v55h32Z" fill="#B8036E" transform="translate(0 0)"/><path d="M156 196h20M156 214h20M156 232h20" stroke="rgba(27,26,75,.22)" stroke-width="1.6"/><circle cx="174" cy="206" r="2.6" fill="#FFD27A"/></g>
      <path d="M212 244v-55a32 32 0 0 0-2-11l8-4a40 40 0 0 1 2 15v55Z" fill="#F9BCD0"/>
      <circle cx="213" cy="208" r="3.8" fill="${SKIN}" class="pa-lg-hand"/>
      ${heartP(180, 140, 8, MAG)}
      <path d="M0 236C70 226 130 232 180 240S300 246 360 232V250H0Z" fill="#BDE6D2"/>
      <path d="M52 250C90 244 140 246 164 240" stroke="#fff" stroke-width="4" stroke-dasharray="0 11" stroke-linecap="round" fill="none"/>
      <circle cx="124" cy="236" r="13" fill="#7FC8A9"/><circle cx="114" cy="240" r="9" fill="#9AD9B5"/><circle cx="121" cy="230" r="2.4" fill="#F45BAE"/><circle cx="113" cy="237" r="2.2" fill="#FFD27A"/>
      <circle cx="238" cy="236" r="13" fill="#7FC8A9"/><circle cx="248" cy="240" r="9" fill="#9AD9B5"/><circle cx="241" cy="230" r="2.4" fill="#F45BAE"/><circle cx="249" cy="237" r="2.2" fill="#FFD27A"/>
    </g>
  </svg>`;
}

/* header banner art: wide canvas, sliced from the start edge (mirrored in LTR via CSS) */
function headArt() {
  const id = uid('hd');
  const carriage = `<g class="pa-head__wide" transform="translate(330 120)">
      <ellipse cx="40" cy="44" rx="40" ry="5" fill="rgba(27,26,75,.08)"/>
      <path d="M8 26C8 8 22 0 40 0s32 8 32 26c0 10-6 15-14 15H22C14 41 8 36 8 26Z" fill="#F29A1F"/>
      <path d="M8 24C9 7 22 1 34 1c-6 6-8 14-8 24 0 8 2 13 4 16h-8C14 41 8 34 8 24Z" fill="#FFB547"/>
      <path d="M40 1c6 6 8 15 8 24s-2 13-4 16" stroke="#E08A10" stroke-width="2" fill="none"/>
      <path d="M28 22a12 12 0 0 1 24 0v6H28Z" fill="#FFE4A3"/>
      <path d="M40 0c0-6 4-9 9-8" stroke="#5DB58F" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="18" cy="42" r="9" fill="#fff"/><circle cx="18" cy="42" r="9" fill="none" stroke="#C98E4A" stroke-width="3"/><circle cx="18" cy="42" r="2.4" fill="#C98E4A"/>
      <circle cx="64" cy="42" r="9" fill="#fff"/><circle cx="64" cy="42" r="9" fill="none" stroke="#C98E4A" stroke-width="3"/><circle cx="64" cy="42" r="2.4" fill="#C98E4A"/>
      ${sp(84, 6, 5, MAG, 'pa-a pa-a-tw')}</g>`;
  return `<svg class="pa-head__art" viewBox="0 0 1000 200" preserveAspectRatio="xMinYMax slice" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D0EDFD"/><stop offset="1" stop-color="#FDEAF2"/></linearGradient></defs>
    <rect width="1000" height="200" fill="url(#${id})"/>
    ${cloud(150, 26, .7)}${cloud(380, 56, .55)}${cloud(590, 22, .7)}${cloud(800, 46, .5)}
    ${sp(96, 44, 4.2, '#FFC24D', 'pa-a pa-a-tw')}${sp(44, 30, 3.2, MAG, 'pa-a pa-a-tw')}${sp(300, 26, 3.4, '#01AEF2', 'pa-a pa-a-tw')}${sp(500, 96, 4, '#FFC24D', 'pa-a pa-a-tw')}${sp(700, 70, 3.4, MAG, 'pa-a pa-a-tw')}
    <path d="M0 162C160 142 330 148 470 154S760 172 1000 152V200H0Z" fill="#F7DCE8"/>
    <path d="M120 186C200 176 280 170 340 166" stroke="#fff" stroke-width="3.4" stroke-dasharray="0 10" stroke-linecap="round" fill="none" class="pa-head__wide"/>
    ${carriage}
    <g class="pa-head__narrow" transform="translate(16 104)">
      <rect x="6" y="34" width="22" height="64" fill="#F3DCE8"/><rect x="3" y="30" width="22" height="66" fill="#fff"/>
      <path d="M-2 33L14 6l16 27Z" fill="#F49BB6"/><path d="M14 6V-6" stroke="#2D2B6B" stroke-width="1.6"/><path class="pa-a pa-a-flag" d="M15-6c5-1.4 7 2 12 .8-3 3.6-7 4.2-12 5.6Z" fill="${MAG}"/>
      <rect x="28" y="52" width="58" height="46" fill="#fff"/><path d="M28 52a6 6 0 0 1 12 0 6 6 0 0 1 12 0 6 6 0 0 1 12 0 6 6 0 0 1 12 0 6 6 0 0 1 10 0" fill="#fff"/>
      <path d="M48 98V82a9 9 0 0 1 18 0v16Z" fill="#A3026A"/><circle cx="14" cy="50" r="4" fill="#FFD27A"/>
    </g>
    <g class="pa-head__wide" transform="translate(64 66) scale(1.36)">
      <rect x="6" y="34" width="22" height="64" fill="#F3DCE8"/><rect x="3" y="30" width="22" height="66" fill="#fff"/>
      <path d="M-2 33L14 6l16 27Z" fill="#F49BB6"/><path d="M14 6V-6" stroke="#2D2B6B" stroke-width="1.6"/><path class="pa-a pa-a-flag" d="M15-6c5-1.4 7 2 12 .8-3 3.6-7 4.2-12 5.6Z" fill="${MAG}"/>
      <rect x="28" y="52" width="58" height="46" fill="#fff"/><path d="M28 52a6 6 0 0 1 12 0 6 6 0 0 1 12 0 6 6 0 0 1 12 0 6 6 0 0 1 12 0 6 6 0 0 1 10 0" fill="#fff"/>
      <path d="M48 98V82a9 9 0 0 1 18 0v16Z" fill="#A3026A"/><circle cx="14" cy="50" r="4" fill="#FFD27A"/>
    </g>
    <path d="M0 180C180 168 380 172 560 176S840 186 1000 174V200H0Z" fill="#FFFAFC"/>
  </svg>`;
}

/* Shabbat corner art: candles + challah */
const shabbatArt = () => `<svg viewBox="0 0 120 90" aria-hidden="true" focusable="false" class="pa-shab__art">
  <circle cx="40" cy="30" r="22" fill="#FFE4A3" opacity=".7"/>
  <rect x="26" y="34" width="8" height="34" rx="3" fill="#fff"/><rect x="44" y="34" width="8" height="34" rx="3" fill="#fff"/>
  <path class="pa-a pa-a-flame" d="M30 20c5 6 5 11 0 11s-5-5 0-11Z" fill="#FFB547"/><path class="pa-a pa-a-flame" style="animation-delay:-.4s" d="M48 20c5 6 5 11 0 11s-5-5 0-11Z" fill="#FFB547"/>
  <rect x="20" y="66" width="38" height="7" rx="3.5" fill="#FFD27A"/>
  <rect x="58" y="72" width="58" height="8" rx="4" fill="#C98E4A"/>
  <ellipse cx="70" cy="62" rx="11" ry="9" fill="#E7A35C"/><ellipse cx="86" cy="60" rx="11" ry="10" fill="#EDB06A"/><ellipse cx="102" cy="62" rx="10" ry="9" fill="#E7A35C"/>
  <path d="M64 58q6-4 12 0M80 55q6-4 12 0M96 58q5-3 10 0" stroke="#FFE4A3" stroke-width="2" fill="none" stroke-linecap="round"/>
  ${sp(104, 20, 5, MAG)}${sp(86, 34, 3, '#01AEF2')}
</svg>`;

/* =====================================================================
   STATE
   ===================================================================== */
const S = {
  logged: false, tab: 'today', loginSeq: 0, codeSent: false,
  sent: { absent: null, late: null, pickup: null, msg: null },
  notifOn: true,
  paid: false, signed: false, sigData: null, sigStrokes: 0,
  consent: { own: true, group: false, social: false },
  shabbat: new Set(), sumLang: 'he', sumNotified: false,
  calMonth: null, calSel: null,
  menuDay: 0, allergyOn: false, allergen: null,
  album: { cur: 0, built: false, flips: 0 },
  phone: null, io: null, liveIO: null
};
const TABS = ['today', 'pay', 'cal', 'menu', 'docs', 'album'];
const TAB_IC = { today: 'sun', pay: 'card', cal: 'calendar', menu: 'plate', docs: 'doc', album: 'book' };

/* =====================================================================
   SMALL UI HELPERS
   ===================================================================== */
const demoTag = (key = 'core.example') => `<span class="demo-tag">${esc(t(key))}</span>`;
const closeSheets = () => App.ui.sheets.slice().forEach(s => s.close('pa'));
function burst(el, o = {}) { if (!el || reduced()) return; App.fx.burstAt(el, Object.assign({ count: 26 }, o)); }
async function busyBtn(btn, ms = 700, labelKey = 'pa.sending') {
  if (!btn) return sleep(ms);
  const html = btn.innerHTML; btn.disabled = true; btn.classList.add('is-busy');
  btn.innerHTML = `<span class="pa-spin" aria-hidden="true">${icon('sparkle', 'ic--fill')}</span><span>${esc(t(labelKey))}</span>`;
  await sleep(App.tour.running || reduced() ? Math.min(ms, 300) : ms);
  btn.disabled = false; btn.classList.remove('is-busy'); btn.innerHTML = html;
}
function doneView({ title, text, extra = '', closeKey = 'pa.close' }) {
  const node = App.h(`<div class="pa-done stack" style="--gap:14px">
    <div class="pa-done__badge" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" class="pa-done__c"/><path d="M20 33l8.5 8.5L45 24" class="pa-done__k"/></svg>${sp(8, 10, 5, '#FFD27A').replace('<path', '<svg viewBox="0 0 64 64" class="pa-done__sp"><path') + '</svg>'}</div>
    <h3 class="h3 pa-done__t" tabindex="-1">${esc(title)}</h3>
    ${text ? `<p class="muted pa-done__x">${esc(text)}</p>` : ''}
    ${extra}
    <button type="button" class="btn btn--ghost btn--block" data-close>${esc(t(closeKey))}</button>
  </div>`);
  return node;
}
function showDone(sh, opts) {
  const node = doneView(opts);
  sh.setContent(node);
  requestAnimationFrame(() => {
    const b = $('.pa-done__badge', node); burst(b, { count: 34 });
    const tt = $('.pa-done__t', node); try { tt.focus({ preventScroll: true }); } catch (e) { }
  });
  App.haptic(18);
  return node;
}
function fieldErr(el, msg) {
  if (!el) return;
  el.textContent = msg || ''; el.hidden = !msg;
  if (msg && el.animate && !reduced()) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 360 });
}
const fmtPhone = d => (d.length <= 3 ? d : d.length <= 6 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`);

/* =====================================================================
   LOGIN
   ===================================================================== */
function bindLogin() {
  q('[data-pa="loginArt"]').innerHTML = loginArt();
  const form = q('[data-pa="loginForm"]'), phone = q('#pa-phone'), err = q('[data-pa="phoneErr"]');
  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 10);
    phone.value = fmtPhone(d);
    if (!err.hidden && d.length >= 10) fieldErr(err, '');
  });
  q('[data-pa="sample"]').addEventListener('click', () => { phone.value = '050-123-4567'; fieldErr(err, ''); phone.focus(); });
  /* phones: the send button sits under the floating dock (and the iOS keyboard); lift the field up under the top bar */
  phone.addEventListener('focus', () => {
    if (!App.isTouch || App.tour.running) return;
    clearTimeout(phone._tm);
    phone._tm = setTimeout(() => {
      if (document.activeElement !== phone || S.logged) return;
      const btn = q('[data-pa="sendCode"]'); const tgt = btn.hidden ? q('[data-pa="enter"]') : btn;
      if (tgt.getBoundingClientRect().bottom > Math.min(dockTop(), (window.visualViewport ? visualViewport.height : innerHeight)) - 10) {
        App.scrollTo(App.scrollY() + phone.getBoundingClientRect().top - barH() - 44, { duration: 420 });
      }
    }, 340);
  });
  form.addEventListener('submit', e => { e.preventDefault(); if (S.codeSent && otpValue().length === 4) enter(); else sendCode(); });
  q('[data-pa="resend"]').addEventListener('click', () => { clearOtp(); sendCode(true); });
  q('[data-pa="other"]').addEventListener('click', () => { resetLogin(); phone.focus(); });
  q('[data-pa="enter"]').addEventListener('click', enter);
  const boxes = qq('.pa-otp input');
  boxes.forEach((b, i) => {
    b.addEventListener('input', () => {
      const v = b.value.replace(/\D/g, '');
      if (v.length > 1) { fillOtp(v.slice(0, 4)); return; }
      b.value = v; if (v && boxes[i + 1]) boxes[i + 1].focus();
      updateEnter();
    });
    b.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !b.value && boxes[i - 1]) { boxes[i - 1].focus(); boxes[i - 1].value = ''; updateEnter(); e.preventDefault(); }
      if (e.key === 'Enter') { e.preventDefault(); if (otpValue().length === 4) enter(); }
    });
    b.addEventListener('paste', e => { const v = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, ''); if (v) { e.preventDefault(); fillOtp(v.slice(0, 4)); } });
  });
  q('[data-pa="sms"]').addEventListener('click', () => { if (S.codeSent && otpValue().length < 4) autofill(S.loginSeq); });
}
const otpValue = () => qq('.pa-otp input').map(b => b.value).join('');
function fillOtp(v) { qq('.pa-otp input').forEach((b, i) => { b.value = v[i] || ''; }); updateEnter(); }
function clearOtp() { fillOtp(''); }
function updateEnter() {
  const ok = otpValue().length === 4, btn = q('[data-pa="enter"]');
  btn.disabled = !ok; btn.classList.toggle('is-ready', ok);
}
async function sendCode(again = false) {
  const phone = q('#pa-phone'), err = q('[data-pa="phoneErr"]');
  const d = phone.value.replace(/\D/g, '');
  if (!/^05\d{8}$/.test(d)) { fieldErr(err, t('pa.login.err')); phone.focus(); return; }
  fieldErr(err, '');
  const seq = ++S.loginSeq;
  const btn = q('[data-pa="sendCode"]');
  if (!again) await busyBtn(btn, App.tour.running ? 150 : 520, 'pa.login.sending');
  if (seq !== S.loginSeq) return;
  S.codeSent = true;
  const step = q('[data-pa="otpStep"]');
  q('.pa-login').classList.add('has-code');
  btn.hidden = true; step.hidden = false;
  q('[data-pa="sentTo"]').textContent = t('pa.login.sentTo', { phone: fmtPhone(d) });
  if (!reduced() && step.animate) step.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
  updateEnter();
  if (!App.tour.running) {
    const r = q('.pa-otp').getBoundingClientRect();
    if (r.bottom > innerHeight * .62) App.scrollTo(App.scrollY() + r.top - innerHeight * .36, { duration: 520 });
  }
  await sleep(App.tour.running ? 120 : 520);
  if (seq !== S.loginSeq) return;
  showSms(seq);
  await sleep(App.tour.running ? 120 : 480);
  if (seq !== S.loginSeq) return;
  autofill(seq);
}
function showSms(seq) {
  const el = q('[data-pa="sms"]');
  el.hidden = false; el.classList.remove('is-out'); void el.offsetWidth; el.classList.add('is-in');
  clearTimeout(showSms.tm);
  showSms.tm = setTimeout(() => { if (seq === S.loginSeq) hideSms(); }, 5200);
}
function hideSms() {
  const el = q('[data-pa="sms"]'); if (!el || el.hidden) return;
  el.classList.add('is-out'); el.classList.remove('is-in');
  setTimeout(() => { if (el.classList.contains('is-out')) el.hidden = true; }, 420);
}
async function autofill(seq) {
  const code = '4815', boxes = qq('.pa-otp input');
  for (let i = 0; i < 4; i++) {
    if (seq !== S.loginSeq) return;
    boxes[i].value = code[i];
    boxes[i].classList.remove('is-pop'); void boxes[i].offsetWidth; boxes[i].classList.add('is-pop');
    if (!reduced()) { const r = boxes[i].getBoundingClientRect(); App.fx.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 6, speed: [40, 120], size: [5, 11], life: [300, 600], gravity: 60 }); }
    await sleep(reduced() ? 0 : App.tour.running ? 70 : 130);
  }
  updateEnter();
}
async function enter() {
  const btn = q('[data-pa="enter"]');
  if (otpValue().length !== 4 || S.logged || btn.classList.contains('is-busy')) return;
  const seq = ++S.loginSeq;
  btn.classList.add('is-busy'); btn.classList.remove('is-ready');
  hideSms();
  burst(btn, { count: 40, speed: [160, 460] });
  App.haptic(20);
  const login = q('.pa-login');
  if (!reduced()) {
    login.classList.add('is-opening');
    await sleep(App.tour.running ? 240 : 560);
    if (seq !== S.loginSeq) return;
    await login.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97) translateY(-8px)' }], { duration: App.tour.running ? 220 : 320, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => { });
    if (seq !== S.loginSeq) return;
  }
  showApp({ animate: !reduced() });
}
function resetLogin() {
  S.loginSeq++; S.codeSent = false;
  const login = q('.pa-login');
  login.classList.remove('is-opening', 'has-code');
  login.getAnimations && login.getAnimations().forEach(a => a.cancel());
  q('#pa-phone').value = ''; clearOtp(); fieldErr(q('[data-pa="phoneErr"]'), '');
  q('[data-pa="enter"]').classList.remove('is-busy');
  q('[data-pa="otpStep"]').hidden = true; q('[data-pa="sendCode"]').hidden = false;
  const sms = q('[data-pa="sms"]'); sms.hidden = true; sms.classList.remove('is-in', 'is-out');
}
function showApp({ animate }) {
  S.logged = true;
  const login = q('.pa-login'), app = q('[data-pa="app"]');
  login.hidden = true; app.hidden = false;
  renderAll();
  selectTab('today', { animate: false, scroll: false });
  lenisResize();
  if (App.lenis) App.lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0);
  app.classList.remove('is-entering'); void app.offsetWidth;
  if (animate) {
    app.classList.add('is-entering');
    setTimeout(() => { const av = q('.pa-head__av'); if (av && !reduced()) { const r = av.getBoundingClientRect(); App.fx.ring(r.left + r.width / 2, r.top + r.height / 2, r.width * .62, 14); } }, 380);
    setTimeout(() => app.classList.remove('is-entering'), 1600);
  }
  requestAnimationFrame(() => { moveInd(true); sideTop(); try { q('#pa-app-title').focus({ preventScroll: true }); } catch (e) { } });
  observeLive();
}
function logout({ instant = false } = {}) {
  closeMenu();
  S.logged = false;
  q('[data-pa="app"]').hidden = true;
  const login = q('.pa-login'); login.hidden = false;
  resetLogin();
  lenisResize();
  if (!instant && !reduced() && login.animate) login.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
  if (App.lenis) App.lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0);
}

/* =====================================================================
   HEADER + MENU
   ===================================================================== */
function greeting() {
  const h = new Date().getHours();
  const k = h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'day' : h >= 17 && h < 22 ? 'evening' : 'night';
  return t('pa.hi.' + k, { name: momName() });
}
function renderHeader() {
  const av = q('.pa-head__av'); if (!av.dataset.done) { av.insertAdjacentHTML('afterbegin', App.avatarEl(NOA(), 84)); av.dataset.done = '1'; }
  const art = q('.pa-head__artbox'); if (!art.dataset.done) { art.innerHTML = headArt(); art.dataset.done = '1'; }
  q('.pa-head__hello').textContent = greeting();
  q('.pa-head__name').textContent = App.kidName('noa');
  q('.pa-head__group').textContent = t('pa.group', { g: L(GROUP()) });
  const home = isAfterPickup();
  const st = q('.pa-status');
  st.classList.toggle('is-home', home);
  q('.pa-status__t').textContent = home ? t('pa.status.home') : t('pa.status.in');
}
function toggleMenu(force) {
  const btn = q('[data-pa="menuBtn"]'), m = q('#pa-menu');
  const open = force != null ? force : m.hidden;
  m.hidden = !open; btn.setAttribute('aria-expanded', String(open));
  if (open) { const f = $('button', m); f && f.focus({ preventScroll: true }); }
}
function closeMenu() { const m = q('#pa-menu'); if (m && !m.hidden) toggleMenu(false); }

/* =====================================================================
   TABS
   ===================================================================== */
function moveInd(instant) {
  const tl = q('.pa-tabs'), ind = q('.pa-tabs__ind'), btn = q(`.pa-tab[data-tab="${S.tab}"]`);
  if (!tl || !ind || !btn || !btn.offsetWidth) return;
  if (instant) ind.style.transition = 'none';
  ind.style.width = btn.offsetWidth + 'px';
  ind.style.transform = `translateX(${btn.offsetLeft}px)`;
  if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
  tabFades();
}
/* soft fade on the physical side(s) where more tabs are hidden: tells the thumb "this row scrolls" */
function tabFades() {
  const tl = q('.pa-tabs'), pill = q('.pa-tabs-pill'); if (!tl || !pill) return;
  /* measured from the tabs themselves (direction-agnostic; the springy indicator must not count as overflow) */
  const tr = tl.getBoundingClientRect(); let minL = Infinity, maxR = -Infinity;
  qq('.pa-tab').forEach(b => { const r = b.getBoundingClientRect(); minL = Math.min(minL, r.left); maxR = Math.max(maxR, r.right); });
  pill.classList.toggle('is-more-l', minL < tr.left + 1); pill.classList.toggle('is-more-r', maxR > tr.right - 1);
}
function selectTab(id, { animate = true, scroll = true, focus = false } = {}) {
  if (!TABS.includes(id)) id = 'today';
  const prev = S.tab; S.tab = id;
  qq('.pa-tab').forEach(b => { const on = b.dataset.tab === id; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  const btn = q(`.pa-tab[data-tab="${id}"]`);
  moveInd(!animate);
  try { btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: animate && !reduced() ? 'smooth' : 'auto' }); } catch (e) { }
  if (focus) btn.focus({ preventScroll: true });
  const panels = qq('.pa-panel');
  const next = q('#pa-p-' + id);
  panels.forEach(p => { if (p !== next) p.hidden = true; });
  next.hidden = false;
  lenisResize();
  onPanelShown(id);
  if (animate && !reduced() && prev !== id && next.animate) {
    const dir = (TABS.indexOf(id) > TABS.indexOf(prev) ? 1 : -1) * (lang() === 'he' ? -1 : 1);
    next.animate([{ opacity: 0, transform: `translateX(${dir * 26}px)` }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
  if (scroll) {
    const wrap = q('.pa-tabs-wrap'), top = wrap.getBoundingClientRect().top;
    const stickTop = barH();
    if (top <= stickTop + 2) {
      const y = App.scrollY() + q('.pa-panels').getBoundingClientRect().top - stickTop - wrap.offsetHeight - 6;
      if (App.lenis) App.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    }
  }
}
function sideTop() {
  const side = q('.pa-today__side'); if (!side) return;
  if (innerWidth < 1000 || !side.offsetHeight) { side.style.removeProperty('--pa-side-top'); return; }
  const base = barH() + 78, h = side.offsetHeight;
  side.style.setProperty('--pa-side-top', Math.round(Math.min(base, innerHeight - h - 24)) + 'px');
}
const lenisResize = () => { try { App.lenis && App.lenis.resize && App.lenis.resize(); } catch (e) { } };
const barH = () => { const tb = $('.topbar'); return tb ? tb.getBoundingClientRect().height : 60; };
const dockTop = () => { const d = $('.dock__bar'); const r = d && d.getBoundingClientRect(); return r && r.height ? r.top : innerHeight; };
function bindTabs() {
  const tl = q('.pa-tabs');
  tl.addEventListener('click', e => { const b = e.target.closest('.pa-tab'); if (b) selectTab(b.dataset.tab); });
  tl.addEventListener('scroll', () => { if (!tabFades.raf) tabFades.raf = requestAnimationFrame(() => { tabFades.raf = 0; tabFades(); }); }, { passive: true });
  tl.addEventListener('keydown', e => {
    const i = TABS.indexOf(S.tab); let n = null;
    const fwd = lang() === 'he' ? 'ArrowLeft' : 'ArrowRight', back = lang() === 'he' ? 'ArrowRight' : 'ArrowLeft';
    if (e.key === fwd) n = (i + 1) % TABS.length; else if (e.key === back) n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = TABS.length - 1;
    if (n == null) return; e.preventDefault(); selectTab(TABS[n], { focus: true });
  });
  // stuck shadow
  const sentinel = q('.pa-tabs-sentinel');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => q('.pa-tabs-wrap').classList.toggle('is-stuck', !en.isIntersecting && en.boundingClientRect.top < 200), { rootMargin: `-${Math.round(barH()) + 1}px 0px 0px 0px` }).observe(sentinel);
  }
}
function onPanelShown(id) {
  if (id === 'docs') requestAnimationFrame(sizeSig);
  if (id === 'album') requestAnimationFrame(() => { if (!S.album.built) assembleAlbum(); });
  App.reveal(q('#pa-p-' + id));
}

/* =====================================================================
   TODAY · quick actions
   ===================================================================== */
function renderTiles() {
  const abs = q('.pa-tile[data-qa="absent"] .pa-tile__t'); if (abs) abs.textContent = t(absentKey());
  const st = (k, html) => { const el = q(`.pa-tile[data-qa="${k}"] .pa-tile__state`); if (el) el.innerHTML = html; q(`.pa-tile[data-qa="${k}"]`).classList.toggle('is-sent', !!html); };
  const s = S.sent;
  st('absent', s.absent ? `<span class="tag tag--ok">${icon('check')}${esc(t('pa.qa.sentShort'))}</span>` : '');
  st('late', s.late ? `<span class="tag tag--ok">${icon('check')}${esc(t('pa.late.chip', { n: s.late.n }))}</span>` : '');
  st('pickup', s.pickup ? `<span class="pa-tile__who">${App.avatarEl(TRUSTED().find(p => p.id === s.pickup.id), 22, { label: '' })}<span>${esc(L(TRUSTED().find(p => p.id === s.pickup.id)))}</span></span>` : '');
  st('msg', s.msg ? `<span class="tag tag--ok">${icon('check')}${esc(t('pa.qa.sentShort'))}</span>` : '');
}
function sheetShell(titleKey, node, reopen) { return track(App.ui.sheet({ title: t(titleKey), content: node, className: 'pa-sheetroot' }), reopen); }
const track = (sh, reopen) => { if (reopen) S.cur = { sh, reopen }; return sh; };
function chipGroup(items, labelId, cls = '') {
  return `<div class="chips ${cls}" role="group" aria-labelledby="${labelId}">${items.map(it => `<button type="button" class="chip" aria-pressed="false" data-v="${esc(it.id)}">${it.ic ? icon(it.ic) : ''}<span>${esc(L(it))}</span></button>`).join('')}</div>`;
}
function bindChipGroup(root, onPick) {
  $$('.chip', root).forEach(c => c.addEventListener('click', () => { $$('.chip', root).forEach(x => x.setAttribute('aria-pressed', String(x === c))); onPick && onPick(c.dataset.v, c); }));
}

const absentKey = () => (sameDay(nextWorkDay(), addDays(today0(), 1)) ? 'pa.qa.absent' : 'pa.qa.absentSun');
function openAbsent() {
  const d = nextWorkDay();
  let reason = null;
  const node = App.h(`<div class="pa-sheet stack" style="--gap:18px">
    <div class="pa-when"><span class="icon-bubble icon-bubble--pink">${icon('calendar')}</span><div><p class="tiny muted">${esc(t('pa.abs.when'))}</p><p class="pa-when__d">${esc(longDate(d))}</p></div></div>
    <div class="stack" style="--gap:10px"><p class="pa-label" id="pa-abs-l">${esc(t('pa.abs.why'))}</p>${chipGroup(REASONS, 'pa-abs-l')}<p class="pa-err" hidden role="alert"></p></div>
    <div class="field"><label for="pa-abs-note">${esc(t('pa.note'))}</label><textarea id="pa-abs-note" class="input" rows="2" placeholder="${esc(t('pa.note.ph'))}"></textarea></div>
    <button type="button" class="btn btn--primary btn--block" data-send>${icon('send', 'ic--dir')}<span>${esc(t('pa.abs.send'))}</span></button>
  </div>`);
  bindChipGroup(node, v => { reason = v; fieldErr($('.pa-err', node), ''); });
  const sh = sheetShell(absentKey(), node, openAbsent);
  $('[data-send]', node).addEventListener('click', async e => {
    if (!reason) { fieldErr($('.pa-err', node), t('pa.abs.pick')); return; }
    await busyBtn(e.currentTarget);
    if (sh.closed) return;
    S.sent.absent = { reason, date: d }; renderTiles();
    App.emit('parent:absent', { kid: 'noa', date: d, reason });
    showDone(sh, {
      title: t('pa.abs.doneT'), text: t(reason === 'sick' ? 'pa.abs.doneSick' : 'pa.abs.done', { date: longDate(d, lang(), false) }),
      extra: `<button type="button" class="link-btn pa-undo" data-undo>${esc(t('pa.abs.undo'))}</button>`
    });
    $('[data-undo]', sh.body).addEventListener('click', () => { S.sent.absent = null; renderTiles(); sh.close(); App.ui.toast(t('pa.abs.undone'), { icon: 'heart' }); });
  });
}
function openLate() {
  let n = null;
  const opts = [15, 30, 45].map(m => ({ id: String(m), he: `כ-${m} דק׳`, ru: `~${m} мин` }));
  const node = App.h(`<div class="pa-sheet stack" style="--gap:18px">
    <p class="muted">${esc(t('pa.late.lead'))}</p>
    <div class="stack" style="--gap:10px"><p class="pa-label" id="pa-late-l">${esc(t('pa.late.how'))}</p>${chipGroup(opts, 'pa-late-l', 'pa-chips-lg')}<p class="pa-err" hidden role="alert"></p></div>
    <div class="field"><label for="pa-late-note">${esc(t('pa.note'))}</label><textarea id="pa-late-note" class="input" rows="2" placeholder="${esc(t('pa.late.ph'))}"></textarea></div>
    <button type="button" class="btn btn--primary btn--block" data-send>${icon('send', 'ic--dir')}<span>${esc(t('pa.late.send'))}</span></button>
  </div>`);
  bindChipGroup(node, v => { n = +v; fieldErr($('.pa-err', node), ''); });
  const sh = sheetShell('pa.qa.late', node, openLate);
  $('[data-send]', node).addEventListener('click', async e => {
    if (!n) { fieldErr($('.pa-err', node), t('pa.late.pick')); return; }
    await busyBtn(e.currentTarget);
    if (sh.closed) return;
    S.sent.late = { n }; renderTiles();
    App.emit('parent:late', { kid: 'noa', minutes: n });
    showDone(sh, { title: t('pa.late.doneT'), text: t('pa.late.done', { n }) });
  });
}
function openPickup() {
  let who = S.sent.pickup ? S.sent.pickup.id : null;
  const people = TRUSTED();
  const node = App.h(`<div class="pa-sheet stack" style="--gap:16px">
    <p class="muted">${esc(t('pa.pick.lead'))}</p>
    <div class="pa-people" role="radiogroup" aria-label="${esc(t('pa.qa.pickup'))}">${people.map(p => `<button type="button" class="pa-person" role="radio" aria-checked="${p.id === who}" data-id="${p.id}">${App.avatarEl(p, 56, { label: '' })}<span class="pa-person__n">${esc(L(p))}</span><span class="pa-person__ok" aria-hidden="true">${icon('check')}</span></button>`).join('')}</div>
    <p class="pa-err" hidden role="alert"></p>
    <button type="button" class="btn btn--primary btn--block" data-make>${icon('key')}<span>${esc(t('pa.pick.make'))}</span></button>
    <p class="tiny muted pa-center">${icon('shield', 'ic--sm')} ${esc(t('pa.pick.only'))}</p>
  </div>`);
  const radios = $$('.pa-person', node);
  const pick = b => { who = b.dataset.id; radios.forEach(x => { x.setAttribute('aria-checked', String(x === b)); x.tabIndex = x === b ? 0 : -1; }); fieldErr($('.pa-err', node), ''); };
  radios.forEach((b, i) => {
    b.tabIndex = (who ? b.dataset.id === who : i === 0) ? 0 : -1;
    b.addEventListener('click', () => pick(b));
    b.addEventListener('keydown', e => {
      const k = e.key; const step = (k === 'ArrowDown' || k === (lang() === 'he' ? 'ArrowLeft' : 'ArrowRight')) ? 1 : (k === 'ArrowUp' || k === (lang() === 'he' ? 'ArrowRight' : 'ArrowLeft')) ? -1 : 0;
      if (!step) return; e.preventDefault(); const nb = radios[(i + step + radios.length) % radios.length]; pick(nb); nb.focus();
    });
  });
  const sh = sheetShell('pa.qa.pickup', node, openPickup);
  $('[data-make]', node).addEventListener('click', async e => {
    if (!who) { fieldErr($('.pa-err', node), t('pa.pick.pick')); return; }
    await busyBtn(e.currentTarget, 600, 'pa.pick.making');
    if (sh.closed) return;
    const p = people.find(x => x.id === who);
    const code = String(1000 + Math.floor(Math.random() * 9000));
    const until = new Date().getDay() === 5 ? '13:00' : '18:00';
    S.sent.pickup = { id: who, code }; renderTiles();
    App.emit('parent:pickup', { kid: 'noa', person: who, code });
    const sex = TRUST_SEX[who] || 'f';
    const nm = lang() === 'ru' && RU_DAT[who] ? RU_DAT[who] : firstName(p);
    const msgTxt = { he: `היי ${p.he.split(' · ').pop()}, הקוד לאיסוף של נועה היום: ${code}. בתוקף עד ${until}.`, ru: `${String(p.ru).split(' · ').pop()}, привет! Код, чтобы забрать Ноа сегодня: ${code}. Действует до ${until}.` };
    const extra = `<div class="pa-code" aria-label="${esc(t('pa.pick.codeA', { code: code.split('').join(' ') }))}">${App.avatarEl(p, 52, { label: '' })}
        <div class="pa-code__digits" aria-hidden="true" dir="ltr">${code.split('').map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div>
        <p class="pa-code__until">${icon('clock', 'ic--sm')} ${esc(t('pa.pick.until', { time: until }))}</p></div>
      <p class="pa-center muted">${esc(t('pa.pick.staff'))}</p>
      <div class="pa-share"><button type="button" class="btn btn--soft btn--block" data-share>${icon('send', 'ic--dir')}<span>${esc(t('pa.pick.send', { name: nm }))}</span></button></div>`;
    showDone(sh, { title: t(sex === 'm' ? 'pa.pick.doneM' : 'pa.pick.doneF', { name: personName(p) }), text: '', extra });
    $('[data-share]', sh.body).addEventListener('click', async ev => {
      const box = $('.pa-share', sh.body);
      await busyBtn(ev.currentTarget, 500);
      box.innerHTML = `<div class="pa-bubbles"><div class="bubble bubble--out is-new" dir="auto"><span class="bubble__t">${esc(L(msgTxt))}</span><span class="bubble__meta"><span class="tnum">${App.fmt.time(new Date())}</span>${icon('checks')}</span></div></div><p class="tiny muted pa-center">${esc(t('pa.pick.sent', { name: nm }))}</p>`;
    });
  });
}
function translateMsg(text) {
  const ex = MSG_EXAMPLES.find(m => m.text.trim() === text.trim());
  const isRu = /[Ѐ-ӿ]/.test(text);
  if (!isRu) return { lang: 'he', he: text, ok: true };
  if (ex && ex.he) return { lang: 'ru', he: ex.he, ok: true };
  return { lang: 'ru', he: null, ok: false };
}
function openMsg() {
  const node = App.h(`<div class="pa-sheet stack" style="--gap:16px">
    <p class="muted">${esc(t('pa.msg.lead'))}</p>
    <div class="stack" style="--gap:8px"><p class="pa-label" id="pa-msg-ex">${esc(t('pa.msg.examples'))}</p>
      <div class="pa-ex" role="group" aria-labelledby="pa-msg-ex">${MSG_EXAMPLES.map((m, i) => `<button type="button" class="pa-ex__b" data-i="${i}" lang="${m.lang}" dir="${m.lang === 'he' ? 'rtl' : 'ltr'}"><b>${m.lang === 'he' ? 'עב' : 'RU'}</b><span>${esc(m.text)}</span></button>`).join('')}</div></div>
    <div class="field"><label for="pa-msg-t">${esc(t('pa.msg.label'))}</label><textarea id="pa-msg-t" class="input" rows="3" dir="auto" placeholder="${esc(t('pa.msg.ph'))}"></textarea></div>
    <p class="pa-err" hidden role="alert"></p>
    <button type="button" class="btn btn--primary btn--block" data-send>${icon('send', 'ic--dir')}<span>${esc(t('pa.msg.send'))}</span></button>
  </div>`);
  const ta = $('#pa-msg-t', node);
  $$('.pa-ex__b', node).forEach(b => b.addEventListener('click', () => { ta.value = MSG_EXAMPLES[+b.dataset.i].text; fieldErr($('.pa-err', node), ''); ta.focus({ preventScroll: true }); }));
  const sh = sheetShell('pa.qa.msg', node, openMsg);
  $('[data-send]', node).addEventListener('click', async e => {
    const text = ta.value.trim();
    if (!text) { fieldErr($('.pa-err', node), t('pa.msg.empty')); ta.focus(); return; }
    await busyBtn(e.currentTarget);
    if (sh.closed) return;
    const tr = translateMsg(text);
    S.sent.msg = { text, lang: tr.lang }; renderTiles();
    App.emit('parent:message', { kid: 'noa', text, lang: tr.lang, he: tr.he });
    const staffBubble = tr.lang === 'he'
      ? `<div class="bubble is-new" lang="he" dir="rtl"><span class="bubble__t">${esc(text)}</span><span class="bubble__meta"><span class="tnum">${App.fmt.time(new Date())}</span></span></div><p class="pa-tr">${icon('check', 'ic--sm')}<span>${esc(t('pa.msg.asIs'))}</span></p>`
      : tr.ok
        ? `<div class="bubble is-new" lang="he" dir="rtl"><span class="bubble__t">${esc(tr.he)}</span><span class="bubble__meta"><span class="tnum">${App.fmt.time(new Date())}</span></span></div><p class="pa-tr">${icon('translate', 'ic--sm')}<span>${esc(t('pa.msg.translated'))}</span></p><p class="tiny muted">${esc(t('pa.msg.orig'))} <bdi lang="ru">${esc(text)}</bdi></p>`
        : `<div class="bubble is-new" lang="ru" dir="ltr"><span class="bubble__t">${esc(text)}</span><span class="bubble__meta"><span class="tnum">${App.fmt.time(new Date())}</span></span></div><p class="pa-tr">${icon('translate', 'ic--sm')}<span>${esc(t('pa.msg.demoOnly'))}</span></p>`;
    const extra = `<div class="pa-staffview"><p class="pa-staffview__l">${icon('tablet', 'ic--sm')} ${esc(t('pa.msg.staffSees'))}</p><div class="pa-bubbles">${staffBubble}</div><div class="pa-reply" aria-live="polite"><div class="bubble bubble--out pa-typing"><span class="typing"><i></i><i></i><i></i></span></div></div></div>`;
    showDone(sh, { title: t('pa.msg.doneT'), text: '', extra });
    const rep = $('.pa-reply', sh.body);
    await sleep(reduced() ? 300 : 1500);
    if (sh.closed || !rep) return;
    const ru = tr.lang === 'ru';
    rep.innerHTML = `<p class="pa-staffview__l pa-staffview__l--you">${icon('home-heart', 'ic--sm')} ${esc(t('pa.msg.youSee'))}</p><div class="pa-bubbles"><div class="bubble is-new" lang="${ru ? 'ru' : 'he'}" dir="${ru ? 'ltr' : 'rtl'}"><span class="bubble__t">${esc(ru ? 'Спасибо, что написали! Обязательно учтём.' : 'תודה שעדכנתם! נשים לב.')}</span><span class="bubble__meta"><span class="tnum">${App.fmt.time(new Date())}</span></span></div></div>${ru ? `<p class="pa-tr">${icon('translate', 'ic--sm')}<span>${esc(t('pa.msg.replyTr'))}</span></p>` : ''}`;
  });
}

/* =====================================================================
   TODAY · feed + summary
   ===================================================================== */
const TONES = { sky: 'pa-tone-sky', pink: 'pa-tone-pink', mint: 'pa-tone-mint', sun: 'pa-tone-sun', lilac: 'pa-tone-lilac', night: 'pa-tone-night' };
function renderFeed() {
  const list = q('.pa-feed__list'); const was = list.dataset.done === '1';
  const items = FEED.slice(); if (isAfterPickup()) items.push(FEED_HOME);
  const liked = new Set(qq('.pa-like[aria-pressed="true"]').map(b => b.dataset.k));
  list.innerHTML = items.map((it, i) => `<li class="pa-fi ${was ? 'is-in' : ''}" data-reveal style="--d:${Math.min(i, 3) * 90}ms">
      <span class="pa-fi__dot ${TONES[it.tone] || ''}" aria-hidden="true">${icon(it.ic)}</span>
      <div class="pa-fi__card">
        <div class="pa-fi__head"><h4 class="pa-fi__title">${esc(L(it.title))}</h4><span class="pa-fi__time tnum" dir="ltr">${esc(it.time)}</span></div>
        ${it.tag ? `<span class="tag tag--${it.tagTone || 'pink'} pa-fi__tag">${esc(L(it.tag))}</span>` : ''}
        <p class="pa-fi__text">${esc(L(it.text))}</p>
        ${it.photo ? `<figure class="pa-photo arch-frame" data-pa-live>${scene(it.photo, L(it.alt))}<button type="button" class="pa-like" data-k="${it.photo}" aria-pressed="${liked.has(it.photo)}" aria-label="${esc(t('pa.like'))}">${icon('heart', 'ic--fill')}</button><span class="pa-photo__lock">${icon('lock', 'ic--sm')}<span>${esc(t('pa.onlyYou'))}</span></span></figure>` : ''}
      </div></li>`).join('');
  list.dataset.done = '1';
  q('.pa-feed__date').textContent = longDate(new Date());
  App.reveal(list);
  observeLive(list);
}
function bindFeed() {
  q('.pa-feed__list').addEventListener('click', e => {
    const b = e.target.closest('.pa-like'); if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on));
    b.classList.remove('is-pop');
    if (on) { void b.offsetWidth; b.classList.add('is-pop'); burst(b, { count: 14, colors: ['magenta', 'pink', 'white'], speed: [60, 200], gravity: 120 }); App.haptic(10); }
  });
  q('.pa-feed__list').addEventListener('dblclick', e => { const f = e.target.closest('.pa-photo'); if (f) { const b = $('.pa-like', f); if (b.getAttribute('aria-pressed') !== 'true') b.click(); } });
}
function sumWords(l) { return SUMMARY[l].split(' ').map((w, i) => `<span class="pa-w" style="--i:${i}">${esc(w)}</span>`).join(' '); }
function renderSummary() {
  const p = q('.pa-sum__text');
  p.lang = S.sumLang; p.dir = S.sumLang === 'he' ? 'rtl' : 'ltr'; p.innerHTML = sumWords(S.sumLang);
  qq('.pa-sum__lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === S.sumLang)));
  if (!S.phone) {
    S.phone = App.ui.phone({ time: '17:30', size: 232 });
    q('.pa-sum__phone').append(S.phone);
  }
  setPhoneDate(S.sumLang);
  if (S.sumNotified) dropNotif(S.sumLang, false);
}
function setPhoneDate(l) { const d = $('.phone__date', S.phone); if (d) { d.textContent = longDate(new Date(), l); d.lang = l; } }
function dropNotif(l, animate = true) {
  if (!S.phone) return;
  const box = $('.phone__notifs', S.phone); box.innerHTML = '';
  const n = SUM_NOTIF[l];
  const card = S.phone.notify({ title: n.title, text: n.text, time: n.now, icon: 'sparkle' }, animate && !reduced());
  card.lang = l; card.dir = l === 'he' ? 'rtl' : 'ltr';
  S.sumNotified = true;
  if (animate && !reduced()) setTimeout(() => { const r = card.getBoundingClientRect(); if (r.width) App.fx.burst(r.left + r.width * .1, r.top + r.height / 2, { count: 10, speed: [40, 140], size: [6, 14], life: [400, 800], gravity: 40, colors: ['gold', 'white', 'pink'] }); }, 260);
}
async function setSumLang(l, { animate = true } = {}) {
  if (S.sumLang === l) return;
  S.sumLang = l;
  qq('.pa-sum__lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === l)));
  const p = q('.pa-sum__text');
  setPhoneDate(l);
  if (!animate || reduced() || !p.animate) { p.lang = l; p.dir = l === 'he' ? 'rtl' : 'ltr'; p.innerHTML = sumWords(l); dropNotif(l, false); return; }
  const h0 = p.offsetHeight;
  const old = $$('.pa-w', p);
  old.forEach((w, i) => w.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-7px) scale(.96)' }], { duration: 200, delay: Math.min(i * 5, 150), fill: 'forwards', easing: 'ease-in' }));
  const seg = q('.pa-sum__lang'); const r = seg.getBoundingClientRect();
  App.fx.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 14, speed: [60, 200], size: [6, 14], life: [400, 800], gravity: 60 });
  await sleep(200 + Math.min(old.length * 5, 150));
  if (S.sumLang !== l) return;
  p.lang = l; p.dir = l === 'he' ? 'rtl' : 'ltr'; p.innerHTML = sumWords(l);
  p.classList.remove('is-writing'); void p.offsetWidth; p.classList.add('is-writing');
  const h1 = p.offsetHeight;
  if (Math.abs(h1 - h0) > 2) p.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' });
  dropNotif(l, true);
}
function bindSummary() {
  qq('.pa-sum__lang button').forEach(b => b.addEventListener('click', () => setSumLang(b.dataset.l)));
  const box = q('.pa-sum__night');
  if ('IntersectionObserver' in window) {
    S.io = new IntersectionObserver(ens => ens.forEach(en => {
      if (en.isIntersecting && !S.sumNotified && S.logged && !App.tour.running) setTimeout(() => { if (!S.sumNotified) dropNotif(S.sumLang, true); }, 420);
    }), { threshold: .45 });
    S.io.observe(box);
  } else dropNotif(S.sumLang, false);
}

/* =====================================================================
   PAYMENTS
   ===================================================================== */
function receipts() {
  const now = new Date(); const out = [];
  if (S.paid) out.push({ no: 1068, month: new Date(now.getFullYear(), now.getMonth(), 1), paidOn: today0(), isNew: true });
  for (let k = 1; k <= 2; k++) { const m = new Date(now.getFullYear(), now.getMonth() - k, 1); out.push({ no: 1068 - 25 * k, month: m, paidOn: new Date(m.getFullYear(), m.getMonth(), 3) }); }
  return out;
}
function renderPay() {
  const m = new Date(); const box = q('#pa-p-pay');
  const st = S.paid ? `<span class="tag tag--ok">${icon('check')}${esc(t('pa.pay.paid'))}</span>` : `<span class="tag tag--warn">${icon('hourglass')}${esc(t('pa.pay.due'))}</span>`;
  box.innerHTML = `<div class="pa-grid2">
    <section class="card card--lift pa-bill ${S.paid ? 'is-paid' : ''}" aria-labelledby="pa-bill-t">
      <div class="pa-bill__top"><div><p class="eyebrow">${icon('receipt')}<span>${esc(t('pa.pay.month'))}</span></p><h2 class="h3" id="pa-bill-t">${esc(monthYear(m))}</h2></div>${demoTag()}</div>
      <div class="pa-bill__status">${st}</div>
      <dl class="pa-lines">
        <div class="pa-line"><dt>${esc(t('pa.pay.tuition', { g: L(GROUP()) }))}</dt><dd class="tnum">${App.fmt.money(PAY.tuition)}</dd></div>
        <div class="pa-line pa-line--disc"><dt><span class="pa-line__ic">${icon('sparkle', 'ic--fill')}</span>${esc(t('pa.pay.subsidy'))}<small>${esc(t('pa.pay.subsidySub'))}</small></dt><dd class="tnum" dir="ltr">−${App.fmt.money(PAY.subsidy)}</dd></div>
        <div class="pa-line pa-line--total"><dt>${esc(t(S.paid ? 'pa.pay.totalPaid' : 'pa.pay.total'))}</dt><dd class="tnum">${App.fmt.money(PAY_TOTAL)}</dd></div>
      </dl>
      ${S.paid ? `<button type="button" class="btn btn--ghost btn--block" data-rcpt="1068">${icon('receipt')}<span>${esc(t('pa.pay.viewRcpt'))}</span></button>`
        : `<button type="button" class="btn btn--primary btn--block" data-pay data-magnetic=".2">${icon('card')}<span>${esc(t('pa.pay.payBtn', { sum: App.fmt.money(PAY_TOTAL) }))}</span></button>
           <p class="tiny muted pa-center">${icon('lock', 'ic--sm')} ${esc(t('pa.pay.secure'))}</p>`}
    </section>
    <section class="card pa-rcpts" aria-labelledby="pa-rcpt-t">
      <div class="pa-sec-h"><h2 class="h4" id="pa-rcpt-t">${esc(t('pa.pay.receipts'))}</h2>${demoTag()}</div>
      <ul class="rows">${receipts().map(r => `<li><button type="button" class="pa-rrow ${r.isNew && S.rcptFlash ? 'is-new' : ''}" data-rcpt="${r.no}" aria-label="${esc(t('pa.pay.rcptOf', { m: monthYear(r.month) }))}"><span class="icon-bubble ${r.isNew ? 'icon-bubble--magenta' : ''}">${icon('receipt')}</span>
        <span class="rowi__main"><span class="rowi__title">${esc(monthYear(r.month))}</span><span class="rowi__sub">${esc(t('pa.pay.paidOn', { d: dayMonth(r.paidOn) }))}</span></span>
        <span class="pa-rrow__sum tnum">${App.fmt.money(PAY_TOTAL)}</span>${icon('chevron', 'ic--dir ic--sm pa-rrow__chev')}</button></li>`).join('')}</ul>
      <p class="tiny muted">${esc(t('pa.pay.auto'))}</p>
    </section></div>`;
  S.rcptFlash = false;
  App.reveal(box);
  renderMore();
}
function bindPay() {
  q('#pa-p-pay').addEventListener('click', e => {
    if (e.target.closest('[data-pay]')) openPay();
    const r = e.target.closest('[data-rcpt]'); if (r) openReceipt(+r.dataset.rcpt);
  });
}
function openPay() {
  let method = 'saved';
  const node = App.h(`<div class="pa-sheet stack" style="--gap:16px">
    <div class="pa-paysum"><p class="tiny muted">${esc(t('pa.pay.for', { m: monthYear(new Date()) }))}</p><p class="pa-paysum__n tnum">${App.fmt.money(PAY_TOTAL)}</p>${demoTag()}</div>
    <p class="pa-label" id="pa-pm-l">${esc(t('pa.pay.how'))}</p>
    <div class="pa-methods" role="radiogroup" aria-labelledby="pa-pm-l">
      <button type="button" class="pa-method" role="radio" aria-checked="true" data-m="saved"><span class="pa-cardart" aria-hidden="true"><i></i></span><span class="rowi__main"><span class="rowi__title">${esc(t('pa.pay.saved'))}</span><span class="rowi__sub"><bdi dir="ltr">•••• 4242</bdi> · ${esc(t('pa.pay.exp'))} <bdi dir="ltr">08/28</bdi></span></span><span class="pa-radio" aria-hidden="true"></span></button>
      <button type="button" class="pa-method" role="radio" aria-checked="false" data-m="new" tabindex="-1"><span class="icon-bubble">${icon('plus')}</span><span class="rowi__main"><span class="rowi__title">${esc(t('pa.pay.new'))}</span></span><span class="pa-radio" aria-hidden="true"></span></button>
    </div>
    <div class="pa-newcard stack" style="--gap:12px" hidden>
      <div class="field"><label for="pa-cc">${esc(t('pa.pay.ccNum'))}</label><input id="pa-cc" class="input tnum" dir="ltr" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000"></div>
      <div class="pa-cc2"><div class="field"><label for="pa-exp">${esc(t('pa.pay.ccExp'))}</label><input id="pa-exp" class="input tnum" dir="ltr" inputmode="numeric" autocomplete="cc-exp" placeholder="${esc(t('pa.pay.expPh'))}"></div>
        <div class="field"><label for="pa-cvv">CVV</label><input id="pa-cvv" class="input tnum" dir="ltr" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4"></div></div>
      <button type="button" class="link-btn pa-sample" data-sample>${esc(t('pa.pay.sample'))}</button>
    </div>
    <p class="pa-err" hidden role="alert"></p>
    <button type="button" class="btn btn--primary btn--block" data-go>${icon('lock')}<span>${esc(t('pa.pay.payNow', { sum: App.fmt.money(PAY_TOTAL) }))}</span></button>
    <p class="tiny muted pa-center">${esc(t('pa.pay.secure'))}</p>
  </div>`);
  const ms = $$('.pa-method', node), nc = $('.pa-newcard', node);
  const err = () => $('.pa-err', node);
  const setM = b => {
    const was = method; method = b.dataset.m; ms.forEach(x => { x.setAttribute('aria-checked', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
    nc.hidden = method !== 'new'; fieldErr(err(), '');
    if (method === 'new' && was !== 'new') {
      if (!reduced()) nc.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 320 });
      /* bring the card fields into view inside the sheet */
      requestAnimationFrame(() => { const body = node.closest('.sheet__body'); if (!body) return; const br = body.getBoundingClientRect(), r = nc.getBoundingClientRect(); if (r.bottom > br.bottom) body.scrollTo({ top: body.scrollTop + (r.top - br.top) - 70, behavior: reduced() ? 'auto' : 'smooth' }); });
    }
  };
  ms.forEach((b, i) => { b.addEventListener('click', () => setM(b)); b.addEventListener('keydown', e => { if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); const nb = ms[1 - i]; setM(nb); nb.focus(); } }); });
  const cc = $('#pa-cc', node), ex = $('#pa-exp', node), cvv = $('#pa-cvv', node);
  const cardOk = () => cc.value.replace(/\D/g, '').length === 16 && /^(0[1-9]|1[0-2])\/\d\d$/.test(ex.value) && cvv.value.length >= 3;
  [cc, ex, cvv].forEach(i => i.addEventListener('input', () => { if (!err().hidden && cardOk()) fieldErr(err(), ''); }));
  cc.addEventListener('input', () => { const d = cc.value.replace(/\D/g, '').slice(0, 16); cc.value = d.replace(/(\d{4})(?=\d)/g, '$1 '); });
  ex.addEventListener('input', () => { const d = ex.value.replace(/\D/g, '').slice(0, 4); ex.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; });
  cvv.addEventListener('input', () => { cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4); });
  $('[data-sample]', node).addEventListener('click', () => { cc.value = '4242 4242 4242 4242'; ex.value = '08/28'; cvv.value = '123'; fieldErr($('.pa-err', node), ''); });
  const sh = sheetShell('pa.pay.title', node, () => (S.paid ? openReceipt(1068) : openPay()));
  $('[data-go]', node).addEventListener('click', async e => {
    if (method === 'new' && !cardOk()) { fieldErr(err(), t('pa.pay.missing')); return; }
    fieldErr(err(), '');
    const btn = e.currentTarget;
    const prog = App.h(`<div class="pa-proc" role="status"><div class="progress"><i style="--p:0%"></i></div><p class="small muted pa-center">${esc(t('pa.pay.processing'))}</p></div>`);
    btn.replaceWith(prog);
    requestAnimationFrame(() => { $('i', prog).style.setProperty('--p', '100%'); });
    await sleep(reduced() ? 300 : App.tour.running ? 700 : 1400);
    S.paid = true; S.rcptFlash = true; renderPay();
    if (sh.closed) return;
    App.emit('parent:paid', { kid: 'noa', sum: PAY_TOTAL });
    showDone(sh, { title: t('pa.pay.doneT'), text: t('pa.pay.done'), extra: `<button type="button" class="btn btn--primary btn--block" data-open-r>${icon('receipt')}<span>${esc(t('pa.pay.viewRcpt'))}</span></button>` });
    $('[data-open-r]', sh.body).addEventListener('click', () => { sh.close(); setTimeout(() => openReceipt(1068), 300); });
  });
}
function openReceipt(no) {
  const r = receipts().find(x => x.no === no) || receipts()[0];
  const node = App.h(`<div class="pa-sheet stack" style="--gap:16px">
    <article class="pa-rcpt" aria-label="${esc(t('pa.pay.rcptNo', { n: r.no }))}">
      <header class="pa-rcpt__h"><span class="brand__logo" data-logo style="width:52px;height:52px"></span><div><p class="pa-rcpt__brand">${esc(t('core.brand'))}</p><p class="tiny muted">${esc(t('pa.pay.rcptNo', { n: r.no }))}</p></div><div class="pa-rcpt__stamp" aria-hidden="true">${icon('check')}<span>${esc(t('pa.pay.paid'))}</span></div></header>
      <dl class="pa-lines pa-lines--rcpt">
        <div class="pa-line"><dt>${esc(t('pa.pay.date'))}</dt><dd>${esc(dayMonth(r.paidOn))} ${r.paidOn.getFullYear()}</dd></div>
        <div class="pa-line"><dt>${esc(t('pa.pay.forWho'))}</dt><dd>${esc(App.kidName('noa'))} · ${esc(L(GROUP()))}</dd></div>
        <div class="pa-line"><dt>${esc(t('pa.pay.period'))}</dt><dd>${esc(monthYear(r.month))}</dd></div>
        <div class="pa-line"><dt>${esc(t('pa.pay.tuition', { g: L(GROUP()) }))}</dt><dd class="tnum">${App.fmt.money(PAY.tuition)}</dd></div>
        <div class="pa-line pa-line--disc"><dt>${esc(t('pa.pay.subsidy'))}</dt><dd class="tnum" dir="ltr">−${App.fmt.money(PAY.subsidy)}</dd></div>
        <div class="pa-line pa-line--total"><dt>${esc(t('pa.pay.totalPaid'))}</dt><dd class="tnum">${App.fmt.money(PAY_TOTAL)}</dd></div>
        <div class="pa-line"><dt>${esc(t('pa.pay.method'))}</dt><dd><bdi dir="ltr">•••• 4242</bdi></dd></div>
      </dl>
      <p class="pa-rcpt__foot">${demoTag()}</p>
    </article>
    <button type="button" class="btn btn--soft btn--block" data-share>${icon('send', 'ic--dir')}<span>${esc(t('pa.pay.share'))}</span></button>
  </div>`);
  App.ui.fillLogos(node);
  const sh = track(App.ui.sheet({ title: t('pa.pay.rcptOf', { m: monthYear(r.month) }), content: node, className: 'pa-sheetroot' }), () => openReceipt(no));
  $('[data-share]', node).addEventListener('click', async e => { await busyBtn(e.currentTarget, 500); App.ui.toast(t('pa.pay.shared'), { tone: 'ok' }); });
  return sh;
}

/* =====================================================================
   CALENDAR
   ===================================================================== */
function allEvents() {
  const d0 = today0(), out = [];
  HOLIDAYS.forEach(([s, n, name, open]) => { const st = parseYmd(s); for (let i = 0; i < n; i++) out.push({ date: addDays(st, i), type: 'holiday', title: name, sub: open ? { he: 'הגן פתוח', ru: 'сад работает' } : null, first: i === 0, len: n }); });
  out.push({ date: addDays(d0, 1), type: 'bday', title: { he: 'יום הולדת לאיתן', ru: 'День рождения Эйтана' }, kid: 'eitan' });
  out.push({ date: thisFriday(), type: 'event', title: { he: 'קבלת שבת · אתם הורי שבת', ru: 'Встречаем шабат · вы шабатные родители' }, shabbat: true });
  out.push({ date: workDay(addDays(d0, 9)), type: 'event', title: { he: 'יום פיג׳מות בגן', ru: 'Пижамный день в саду' } });
  out.push({ date: workDay(addDays(d0, 12)), type: 'closed', title: { he: 'יום היערכות לצוות', ru: 'Методический день' }, sub: { he: 'הגן סגור', ru: 'сад закрыт' } });
  out.push({ date: workDay(addDays(d0, 15)), type: 'bday', title: { he: 'יום הולדת למאיה', ru: 'День рождения Майи' }, kid: 'maya' });
  const han = HOLIDAYS.find(h => h[0].startsWith('2026-12-05') || h[2].he === 'חנוכה');
  if (han) { const hs = parseYmd(han[0]); const diff = (hs - d0) / 864e5; if (diff > -6 && diff < 60) out.push({ date: workDay(addDays(hs, 2)), type: 'event', title: { he: 'מסיבת חנוכה בגן', ru: 'Праздник Хануки в саду' } }); }
  return out;
}
function eventsOn(d, evs) { return evs.filter(e => sameDay(e.date, d)); }
const TYPE_KEY = { holiday: 'pa.cal.holiday', closed: 'pa.cal.closed', event: 'pa.cal.event', bday: 'pa.cal.bday' };
function renderCal() {
  const box = q('#pa-p-cal'); const evs = allEvents(); const d0 = today0();
  if (!S.calMonth) S.calMonth = new Date(d0.getFullYear(), d0.getMonth(), 1);
  if (!S.calSel) S.calSel = d0;
  const m = S.calMonth, y = m.getFullYear(), mo = m.getMonth();
  const days = new Date(y, mo + 1, 0).getDate(), lead = new Date(y, mo, 1).getDay();
  const wk = [0, 1, 2, 3, 4, 5, 6].map(i => App.fmt.weekday(new Date(2026, 10, 15 + i)));
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<span class="pa-cal__pad" aria-hidden="true"></span>';
  for (let d = 1; d <= days; d++) {
    const dt = new Date(y, mo, d), es = eventsOn(dt, evs), isT = sameDay(dt, d0), isS = sameDay(dt, S.calSel);
    const types = [...new Set(es.map(e => e.type))];
    const lbl = longDate(dt) + (isT ? ' · ' + t('pa.cal.today') : '') + (es.length ? ': ' + es.map(e => L(e.title)).join(', ') : '');
    cells += `<button type="button" class="pa-cal__d ${isT ? 'is-today' : ''} ${dt.getDay() === 6 ? 'is-sat' : ''} ${types.includes('closed') ? 'is-closed' : ''}" data-d="${ymd(dt)}" aria-pressed="${isS}" ${isT ? 'aria-current="date"' : ''} tabindex="${isS ? 0 : -1}" aria-label="${esc(lbl)}"><span class="pa-cal__n tnum">${d}</span><span class="pa-cal__dots" aria-hidden="true">${types.map(tp => `<i class="pa-dot pa-dot--${tp}"></i>`).join('')}</span></button>`;
  }
  const up = evs.filter(e => e.date >= d0 && (e.type !== 'holiday' || e.first)).sort((a, b) => a.date - b.date).slice(0, 5);
  const fri = thisFriday();
  const done = S.shabbat.size, total = SHABBAT_LIST.length;
  const bdays = evs.filter(e => e.type === 'bday' && e.date >= d0).sort((a, b) => a.date - b.date);
  box.innerHTML = `<div class="pa-calgrid">
    <section class="pa-shab ${done === total ? 'is-ready' : ''}" aria-labelledby="pa-shab-t">
      ${shabbatArt()}
      <p class="eyebrow pa-shab__eb">${icon('candle')}<span>${esc(t('pa.shab.eyebrow'))}</span>${demoTag()}</p>
      <h2 class="h3" id="pa-shab-t">${esc(t('pa.shab.title'))}</h2>
      <p class="pa-shab__when">${esc(t('pa.shab.when', { date: longDate(fri) }))}</p>
      <ul class="pa-check">${SHABBAT_LIST.map(it => `<li><label class="pa-check__i"><input type="checkbox" data-sid="${it.id}" ${S.shabbat.has(it.id) ? 'checked' : ''}><span class="pa-check__box" aria-hidden="true">${icon('check')}</span><span>${esc(L(it))}</span></label></li>`).join('')}</ul>
      <div class="pa-shab__foot"><div class="progress" aria-hidden="true"><i style="--p:${done / total * 100}%"></i></div><p class="small pa-shab__count" aria-live="polite">${esc(done === total ? t('pa.shab.ready') : t('pa.shab.count', { n: done, t: total }))}</p></div>
    </section>
    <section class="card pa-cal" aria-labelledby="pa-cal-t">
      <div class="pa-cal__top">
        <button type="button" class="pa-cal__nav" data-nav="-1" aria-label="${esc(t('pa.cal.prev'))}">${icon('chevron', 'pa-back')}</button>
        <h2 class="h4" id="pa-cal-t" aria-live="polite">${esc(monthYear(m))}</h2>
        <button type="button" class="pa-cal__nav" data-nav="1" aria-label="${esc(t('pa.cal.next'))}">${icon('chevron', 'ic--dir')}</button>
      </div>
      <div class="pa-cal__wk" aria-hidden="true">${wk.map(w => `<span>${esc(w)}</span>`).join('')}</div>
      <div class="pa-cal__grid" role="group" aria-labelledby="pa-cal-t">${cells}</div>
      <ul class="pa-legend">${['holiday', 'closed', 'event', 'bday'].map(tp => `<li><i class="pa-dot pa-dot--${tp}"></i>${esc(t(TYPE_KEY[tp]))}</li>`).join('')}</ul>
      <div class="pa-cal__sel" aria-live="polite">${selDayHtml(S.calSel, evs)}</div>
    </section>
    <section class="card pa-up" aria-labelledby="pa-up-t">
      <div class="pa-sec-h"><h2 class="h4" id="pa-up-t">${esc(t('pa.cal.upcoming'))}</h2>${demoTag()}</div>
      <ul class="rows">${up.map(e => evRow(e, d0)).join('')}</ul>
    </section>
    <section class="card pa-bd" aria-labelledby="pa-bd-t">
      <div class="pa-sec-h"><h2 class="h4" id="pa-bd-t">${icon('cake')} ${esc(t('pa.cal.bdays'))}</h2></div>
      <ul class="pa-bd__list">${bdays.map(e => `<li class="pa-bd__i">${App.avatarEl(App.data.kid(e.kid), 54)}<span class="pa-bd__n">${esc(App.kidName(e.kid))}</span><span class="tag ${sameDay(e.date, addDays(d0, 1)) ? 'tag--ink' : 'tag--pink'}">${esc(sameDay(e.date, addDays(d0, 1)) ? t('pa.cal.tomorrow') : shortNum(e.date))}</span></li>`).join('')}</ul>
    </section>
  </div>`;
  App.reveal(box);
}
function evRow(e, d0) {
  const rel = sameDay(e.date, d0) ? t('pa.cal.today') : sameDay(e.date, addDays(d0, 1)) ? t('pa.cal.tomorrow') : '';
  const title = e.type === 'holiday' && e.len > 1 ? `${L(e.title)} · ${t('pa.cal.days', { n: e.len })}` : L(e.title);
  return `<li class="rowi pa-ev"><span class="pa-ev__date pa-ev__date--${e.type}"><b class="tnum">${e.date.getDate()}</b><small>${esc(App.fmt.weekday(e.date))}</small></span>
    <span class="rowi__main"><span class="rowi__title">${esc(title)}</span><span class="rowi__sub">${esc(rel ? rel + ' · ' : '')}${esc(dayMonth(e.date))}${e.sub ? ' · ' + esc(L(e.sub)) : ''}</span></span><i class="pa-dot pa-dot--${e.type}" aria-hidden="true"></i></li>`;
}
function selDayHtml(d, evs) {
  const es = eventsOn(d, evs);
  const base = d.getDay() === 6 ? t('pa.cal.sat') : d.getDay() === 5 ? t('pa.cal.fri') : t('pa.cal.regular');
  return `<p class="pa-cal__selh">${esc(longDate(d))}</p>${es.length ? `<ul class="pa-cal__evs">${es.map(e => `<li><i class="pa-dot pa-dot--${e.type}"></i><span>${esc(L(e.title))}${e.sub ? ` · <span class="muted">${esc(L(e.sub))}</span>` : ''}</span></li>`).join('')}</ul>` : `<p class="small muted">${esc(base)}</p>`}`;
}
function bindCal() {
  const box = q('#pa-p-cal');
  box.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { const m = S.calMonth; S.calMonth = new Date(m.getFullYear(), m.getMonth() + +nav.dataset.nav, 1); S.calSel = sameDay(S.calMonth, new Date(today0().getFullYear(), today0().getMonth(), 1)) ? today0() : new Date(S.calMonth); renderCal(); q(`[data-nav="${nav.dataset.nav}"]`).focus({ preventScroll: true }); return; }
    const d = e.target.closest('.pa-cal__d');
    if (d) selectCalDay(parseYmd(d.dataset.d));
  });
  box.addEventListener('keydown', e => {
    const d = e.target.closest('.pa-cal__d'); if (!d) return;
    const rtl = lang() === 'he';
    const map = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 7, ArrowUp: -7 };
    if (!(e.key in map)) return; e.preventDefault();
    const nd = addDays(parseYmd(d.dataset.d), map[e.key]);
    if (nd.getMonth() !== S.calMonth.getMonth()) { S.calMonth = new Date(nd.getFullYear(), nd.getMonth(), 1); S.calSel = nd; renderCal(); }
    else selectCalDay(nd);
    const b = q(`.pa-cal__d[data-d="${ymd(nd)}"]`); b && b.focus();
  });
  box.addEventListener('change', e => {
    const c = e.target.closest('[data-sid]'); if (!c) return;
    if (c.checked) S.shabbat.add(c.dataset.sid); else S.shabbat.delete(c.dataset.sid);
    const done = S.shabbat.size, total = SHABBAT_LIST.length;
    const card = q('.pa-shab');
    $('.progress i', card).style.setProperty('--p', done / total * 100 + '%');
    $('.pa-shab__count', card).textContent = done === total ? t('pa.shab.ready') : t('pa.shab.count', { n: done, t: total });
    card.classList.toggle('is-ready', done === total);
    renderMore();
    if (c.checked) { const bx = c.parentElement.querySelector('.pa-check__box'); burst(bx, { count: done === total ? 40 : 8, speed: done === total ? [120, 380] : [40, 140], size: [6, 16] }); }
    if (done === total) App.haptic(20);
  });
}
function selectCalDay(d) {
  S.calSel = d;
  qq('.pa-cal__d').forEach(b => { const on = b.dataset.d === ymd(d); b.setAttribute('aria-pressed', String(on)); b.tabIndex = on ? 0 : -1; });
  const sel = q('.pa-cal__sel'); sel.innerHTML = selDayHtml(d, allEvents());
  if (!reduced() && sel.animate) sel.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
}

/* =====================================================================
   MENU
   ===================================================================== */
function weekStart() { const d = today0(); const s = addDays(d, -d.getDay()); return d.getDay() >= 5 ? addDays(s, 7) : s; }
function renderMenu() {
  const box = q('#pa-p-menu'); const ws = weekStart();
  const keys = Object.keys(App.data.allergens);
  box.innerHTML = `<section class="pa-food" aria-labelledby="pa-menu-t">
    <div class="pa-menu__head"><h2 class="h3" id="pa-menu-t">${esc(t('pa.menu.title'))}</h2><span class="demo-tag">${esc(t('pa.menu.example'))}</span></div>
    <p class="small muted pa-menu__fact">${icon('chef', 'ic--sm')}<span>${esc(t('pa.menu.fact'))}</span></p>
    <div class="card pa-allergy">
      <button type="button" class="pa-allergy__sw" role="switch" aria-checked="false" aria-controls="pa-al-body" data-allergy><span class="icon-bubble icon-bubble--pink">${icon('alert')}</span><span class="pa-allergy__t">${esc(t('pa.menu.toggle'))}</span><span class="switch" aria-hidden="true"></span></button>
      <div class="pa-allergy__body" id="pa-al-body" hidden>
        <p class="small"><span class="tag tag--ok">${icon('check')}${esc(t('pa.menu.none'))}</span></p>
        <p class="small muted" id="pa-al-l">${esc(t('pa.menu.try'))}</p>
        <div class="chips pa-al-chips" role="group" aria-labelledby="pa-al-l">${keys.map(k => `<button type="button" class="chip chip--sm" aria-pressed="false" data-al="${k}">${esc(L(App.data.allergens[k]))}</button>`).join('')}</div>
        <p class="small pa-allergy__res" aria-live="polite"></p>
      </div>
    </div>
    <div class="pa-days" role="tablist" aria-label="${esc(t('pa.menu.days'))}">${MENU.map((d, i) => { const dt = addDays(ws, i); return `<button type="button" class="pa-day" role="tab" id="pa-md-${i}" aria-controls="pa-mp-${i}" aria-selected="${i === S.menuDay}" tabindex="${i === S.menuDay ? 0 : -1}" data-day="${i}"><b>${esc(App.fmt.weekday(dt))}</b><small class="tnum">${shortNum(dt)}</small>${sameDay(dt, today0()) ? `<i class="pa-day__today" aria-hidden="true"></i>` : ''}<i class="pa-day__hit tnum" aria-hidden="true"></i></button>`; }).join('')}</div>
    <div class="pa-week">${MENU.map((d, i) => { const dt = addDays(ws, i); return `<div class="pa-dayp ${i === S.menuDay ? 'is-on' : ''}" role="tabpanel" id="pa-mp-${i}" aria-labelledby="pa-md-${i}">
      <p class="pa-dayp__h">${esc(longDate(dt))}${sameDay(dt, today0()) ? ` <span class="tag tag--ink">${esc(t('pa.cal.today'))}</span>` : ''}</p>
      ${MEALS.map(([k, ic, lk]) => { const it = d[k]; return `<article class="pa-meal" data-day="${i}" data-a="${it.a.join(' ')}">
        <span class="pa-meal__ic pa-meal__ic--${k}" aria-hidden="true">${icon(ic)}</span>
        <div class="pa-meal__main"><p class="pa-meal__k">${esc(t(lk))}</p><p class="pa-meal__n">${esc(L(it))}</p>
          <p class="pa-meal__al">${it.a.length ? it.a.map(a => `<span class="pa-al" data-a="${a}">${esc(L(App.data.allergens[a]))}</span>`).join('') : `<span class="pa-al pa-al--none">${esc(t('pa.menu.noAl'))}</span>`}</p>
          <p class="pa-meal__warn" hidden>${icon('alert', 'ic--sm')}<span></span></p></div></article>`; }).join('')}
    </div>`; }).join('')}</div>
  </section>`;
  applyAllergy(false);
}
/* allergen highlight: updated in place (no re-render, so nothing flashes and focus stays on the chip) */
function applyAllergy(animate) {
  const box = q('#pa-p-menu'); const food = box && $('.pa-food', box); if (!food) return 0;
  const al = S.allergyOn ? S.allergen : null;
  $('[data-allergy]', box).setAttribute('aria-checked', String(S.allergyOn));
  const body = $('.pa-allergy__body', box), wasHidden = body.hidden;
  body.hidden = !S.allergyOn;
  if (S.allergyOn && wasHidden && animate && !reduced()) body.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.22,1,.36,1)' });
  $$('[data-al]', box).forEach(c => c.setAttribute('aria-pressed', String(c.dataset.al === al)));
  food.classList.toggle('is-filter', !!al);
  let count = 0; const perDay = MENU.map(() => 0);
  $$('.pa-meal', box).forEach(m => {
    const hit = !!al && m.dataset.a.split(' ').includes(al);
    m.classList.toggle('is-hit', hit);
    $$('.pa-al[data-a]', m).forEach(b => b.classList.toggle('is-hit', !!al && b.dataset.a === al));
    const w = $('.pa-meal__warn', m); w.hidden = !hit;
    $('span', w).textContent = hit ? t('pa.menu.contains', { a: L(App.data.allergens[al]) }) : '';
    if (hit) { count++; perDay[+m.dataset.day]++; }
  });
  $$('.pa-day', box).forEach((b, i) => { b.classList.toggle('has-hit', perDay[i] > 0); $('.pa-day__hit', b).textContent = perDay[i] || ''; });
  $('.pa-allergy__res', box).textContent = al ? t(count === 1 ? 'pa.menu.count1' : 'pa.menu.count', { n: count, a: L(App.data.allergens[al]) }) : '';
  return count;
}
function bindMenu() {
  const box = q('#pa-p-menu');
  box.addEventListener('click', e => {
    if (e.target.closest('[data-allergy]')) { S.allergyOn = !S.allergyOn; if (!S.allergyOn) S.allergen = null; applyAllergy(true); return; }
    const a = e.target.closest('[data-al]');
    if (a) {
      S.allergen = S.allergen === a.dataset.al ? null : a.dataset.al; applyAllergy(true);
      if (!reduced()) {
        qq('.pa-meal.is-hit').filter(h => h.offsetParent).forEach((h, i) => h.animate([{ transform: 'scale(.97)' }, { transform: 'scale(1.015)' }, { transform: 'none' }], { duration: 420, delay: i * 50 }));
        qq('.pa-day.has-hit .pa-day__hit').forEach((h, i) => h.animate([{ transform: 'scale(.4)' }, { transform: 'scale(1.2)' }, { transform: 'none' }], { duration: 420, delay: i * 40, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
      }
      return;
    }
    const d = e.target.closest('.pa-day'); if (d) setMenuDay(+d.dataset.day);
  });
  box.addEventListener('keydown', e => {
    const d = e.target.closest('.pa-day'); if (!d) return;
    const rtl = lang() === 'he'; const i = +d.dataset.day; let n = null;
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) n = Math.min(4, i + 1); else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) n = Math.max(0, i - 1);
    if (n == null) return; e.preventDefault(); setMenuDay(n); q(`.pa-day[data-day="${n}"]`).focus();
  });
}
function setMenuDay(i) {
  const prev = S.menuDay; S.menuDay = i;
  qq('.pa-day').forEach(b => { const on = +b.dataset.day === i; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  qq('.pa-dayp').forEach((p, j) => p.classList.toggle('is-on', j === i));
  const p = q('#pa-mp-' + i);
  if (!reduced() && prev !== i && getComputedStyle(p).display !== 'none' && innerWidth < 1000) { const dir = (i > prev ? 1 : -1) * (lang() === 'he' ? -1 : 1); p.animate([{ opacity: 0, transform: `translateX(${dir * 22}px)` }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' }); }
}

/* =====================================================================
   DOCUMENTS · signature pad
   ===================================================================== */
const sig = { cv: null, ctx: null, w: 0, drawing: false, last: null };
function bindDocs() {
  const cv = q('.pa-sig__cv'); sig.cv = cv; sig.ctx = cv.getContext('2d');
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  cv.addEventListener('pointerdown', e => {
    if (S.signed) return; e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    sig.drawing = true; sig.last = pos(e); sig.mid = sig.last;
    const c = sig.ctx; c.beginPath(); c.arc(sig.last.x, sig.last.y, 1.3, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    q('.pa-sig').classList.add('has-ink');
  });
  cv.addEventListener('pointermove', e => {
    if (!sig.drawing) return;
    const p = pos(e), c = sig.ctx, m = { x: (sig.last.x + p.x) / 2, y: (sig.last.y + p.y) / 2 };
    c.beginPath(); c.moveTo(sig.mid.x, sig.mid.y); c.quadraticCurveTo(sig.last.x, sig.last.y, m.x, m.y); c.stroke();
    sig.last = p; sig.mid = m;
  });
  const end = () => { if (!sig.drawing) return; sig.drawing = false; S.sigStrokes++; fieldErr(q('[data-pa="sigErr"]'), ''); };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('pointerleave', end);
  q('[data-pa="sigClear"]').addEventListener('click', clearSig);
  q('[data-pa="sigDone"]').addEventListener('click', signDoc);
  q('[data-pa="sigTyped"]').addEventListener('click', typedSig);
  qq('[data-consent]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.consent; S.consent[k] = !S.consent[k]; b.setAttribute('aria-checked', String(S.consent[k]));
    App.ui.toast(t('pa.docs.saved'), { tone: 'ok' });
  }));
  addEventListener('resize', () => { if (S.tab === 'docs' && !S.signed) sizeSig(); }, { passive: true });
}
function sizeSig() {
  const cv = sig.cv; if (!cv) return; const r = cv.getBoundingClientRect(); if (!r.width || Math.round(r.width) === sig.w) return;
  sig.w = Math.round(r.width);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  const c = sig.ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 2.8;
  S.sigStrokes = 0; q('.pa-sig').classList.remove('has-ink');
}
function typedSig() {
  if (S.signed) return; sizeSig(); clearSig();
  const c = sig.ctx, w = sig.cv.getBoundingClientRect().width, h = sig.cv.getBoundingClientRect().height;
  c.save(); c.fillStyle = INK; c.font = `italic 600 ${Math.round(h * .34)}px ${getComputedStyle(document.body).getPropertyValue('--font-display') || 'serif'}`;
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(momName(), w / 2, h * .5); c.restore();
  S.sigStrokes = 1; q('.pa-sig').classList.add('has-ink'); fieldErr(q('[data-pa="sigErr"]'), '');
}
function clearSig() {
  const cv = sig.cv; if (!cv) return; sig.ctx.save(); sig.ctx.setTransform(1, 0, 0, 1, 0, 0); sig.ctx.clearRect(0, 0, cv.width, cv.height); sig.ctx.restore();
  S.sigStrokes = 0; q('.pa-sig').classList.remove('has-ink');
}
async function signDoc(e) {
  if (S.signed) return;
  if (!S.sigStrokes) { fieldErr(q('[data-pa="sigErr"]'), t('pa.docs.needSig')); return; }
  await busyBtn(e && e.currentTarget, 600);
  S.sigData = sig.cv.toDataURL('image/png');
  S.signed = true; renderDocs();
  const card = q('.pa-doc--health'); burst($('.pa-doc__status', card) || card, { count: 40 });
  App.ui.toast(t('pa.docs.signedToast'), { tone: 'ok', icon: 'check-circle' });
  App.emit('parent:signed', { kid: 'noa', doc: 'health' });
}
function renderDocs() {
  const card = q('.pa-doc--health');
  card.classList.toggle('is-signed', S.signed);
  const st = $('.pa-doc__status', card);
  st.className = 'tag pa-doc__status ' + (S.signed ? 'tag--ok' : 'tag--warn');
  st.innerHTML = S.signed ? `${icon('check')}<span>${esc(t('pa.docs.signedToday'))}</span>` : `${icon('pen')}<span>${esc(t('pa.docs.waiting'))}</span>`;
  q('.pa-sig').hidden = S.signed;
  const done = q('.pa-doc__signed'); done.hidden = !S.signed;
  if (S.signed && S.sigData) $('img', done).src = S.sigData;
  $('.pa-doc__signedt', done).textContent = t('pa.docs.signedAt', { d: dayMonth(new Date()), t: App.fmt.time(new Date()) });
  const n = S.signed ? 4 : 3;
  q('.pa-docs__prog i').style.setProperty('--p', n / 4 * 100 + '%');
  q('.pa-docs__count').textContent = t('pa.docs.count', { n, t: 4 });
  q('.pa-docs__sum').classList.toggle('is-done', n === 4);
  qq('[data-consent]').forEach(b => b.setAttribute('aria-checked', String(!!S.consent[b.dataset.consent])));
  renderMore();
}

/* =====================================================================
   ALBUM · a book that assembles itself and flips like paper
   ===================================================================== */
function albumPages() {
  const y0 = schoolYear();
  const P = [];
  P.push({ cls: 'pa-pg--cover', html: `<div class="pa-cover"><span class="pa-cover__frame">${App.avatar(NOA())}</span><p class="pa-cover__k">${esc(t('pa.album.coverK'))}</p><h3 class="pa-cover__t">${esc(t('pa.album.title'))}</h3><p class="pa-cover__y tnum" dir="ltr">${y0}–${y0 + 1}</p>${sp(30, 30, 7, '#FFD27A').replace('<path', '<svg class="pa-cover__sp" viewBox="0 0 60 60" aria-hidden="true"><path') + '</svg>'}</div>` });
  P.push({ html: `<div class="pa-intro"><div class="pa-intro__stack" aria-hidden="true"><i></i><i></i><b>${App.avatar(NOA(), { label: '' })}</b></div><p class="pa-intro__t">${esc(t('pa.album.introT'))}</p><p class="pa-intro__x">${esc(t('pa.album.auto'))}</p><p class="pa-intro__n">${esc(t('pa.album.count', { n: ALBUM.length }))}</p></div>` });
  ALBUM.forEach((a, i) => {
    const d = new Date(a.m >= 8 ? y0 : y0 + 1, a.m, 1);
    P.push({ html: `<p class="pa-pg__m">${esc(monthName(d))}</p><figure class="pa-pg__ph"><span class="pa-pg__tape" aria-hidden="true"></span>${scene(a.scene, L(a.cap))}</figure><p class="pa-pg__cap">${esc(L(a.cap))}</p>` });
  });
  P.push({ html: `<div class="pa-endp">${heartP(0, 0, 10, MAG).replace('<path', '<svg viewBox="-12 -12 24 24" class="pa-endp__h" aria-hidden="true"><path') + '</svg>'}<p class="pa-endp__t">${esc(t('pa.album.endT'))}</p><p class="pa-endp__x">${esc(t('pa.album.endX'))}</p></div>` });
  P.push({ cls: 'pa-pg--back', html: `<div class="pa-backc"><span class="brand__logo" data-logo style="width:64px;height:64px"></span><p class="pa-backc__t">${esc(t('core.brand'))}</p><p class="pa-backc__x">${esc(t('pa.album.slogan'))}</p></div>` });
  return P;
}
let BOOK = { n: 0 };
function renderAlbum() {
  const box = q('.pa-album__stage');
  const pages = albumPages(); const n = pages.length / 2; BOOK.n = n;
  const rtl = lang() === 'he';
  const face = (p, side, num) => `<div class="pa-face pa-face--${side} ${p.cls || ''}"><div class="pa-pg">${p.html}${num && !p.cls ? `<span class="pa-pg__no tnum">${num}</span>` : ''}</div></div>`;
  let leaves = '';
  for (let i = 0; i < n; i++) leaves += `<div class="pa-leaf" data-i="${i}">${face(pages[2 * i], 'front', 2 * i)}${face(pages[2 * i + 1], 'back', 2 * i + 1)}</div>`;
  box.innerHTML = `<div class="pa-book ${rtl ? 'is-rtl' : 'is-ltr'}" tabindex="0" role="group" aria-roledescription="${esc(t('pa.album.book'))}" aria-label="${esc(t('pa.album.title'))}" aria-describedby="pa-book-hint" data-sparkle-zone>
      <div class="pa-book__inner">${leaves}</div></div><div class="pa-fly" aria-hidden="true"></div>`;
  App.ui.fillLogos(box);
  if (S.album.cur > n) S.album.cur = 0;
  applyBook(true);
  bindBook();
  observeLive(box);
}
function applyBook(instant) {
  const book = q('.pa-book'); if (!book) return;
  const cur = S.album.cur, n = BOOK.n;
  const leaves = qq('.pa-leaf');
  leaves.forEach((lf, i) => {
    const turned = i < cur;
    if (instant) lf.style.transition = 'none';
    lf.classList.toggle('is-turned', turned);
    if (!lf.classList.contains('is-flipping')) lf.style.zIndex = turned ? i + 1 : n - i;
    const vis = (turned && i === cur - 1) || (!turned && i === cur);
    lf.setAttribute('aria-hidden', String(!vis));
    $$('.pa-face', lf).forEach(f => { f.inert = !vis; f.classList.toggle('pa-live', vis && f.classList.contains(turned ? 'pa-face--back' : 'pa-face--front')); });
    if (instant) { void lf.offsetWidth; lf.style.transition = ''; }
  });
  book.classList.toggle('is-closed-front', cur === 0);
  book.classList.toggle('is-closed-back', cur === n);
  const lbl = cur === 0 ? t('pa.album.cover') : cur === n ? t('pa.album.backCover') : t('pa.album.pages', { a: 2 * cur - 1, b: 2 * cur, t: 2 * n - 2 });
  const st = q('.pa-album__status'); if (st) st.textContent = lbl;
  qq('.pa-album__dots i').forEach((d, i) => d.classList.toggle('is-on', i === cur));
  const prev = q('[data-book="prev"]'), next = q('[data-book="next"]');
  if (prev) prev.disabled = cur === 0; if (next) next.disabled = cur === n;
}
function flip(dir) {
  const n = BOOK.n, cur = S.album.cur;
  const target = cur + dir; if (target < 0 || target > n) return false;
  const idx = dir > 0 ? cur : cur - 1;
  const lf = q(`.pa-leaf[data-i="${idx}"]`); if (!lf) return false;
  S.album.flips++;
  lf.classList.add('is-flipping'); lf.style.zIndex = 100 + S.album.flips;
  S.album.cur = target;
  applyBook(false);
  const doneFn = () => { lf.classList.remove('is-flipping'); applyBook(false); };
  if (reduced()) doneFn(); else { clearTimeout(lf._tm); lf._tm = setTimeout(doneFn, 950); }
  App.haptic(8);
  return true;
}
function bindBook() {
  const book = q('.pa-book'); if (!book) return;
  const rtl = () => lang() === 'he';
  let x0 = null, y0 = 0, moved = false;
  book.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; moved = false; });
  book.addEventListener('pointermove', e => { if (x0 != null && Math.abs(e.clientX - x0) > 10) moved = true; });
  book.addEventListener('pointerup', e => {
    if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) { const next = rtl() ? dx > 0 : dx < 0; flip(next ? 1 : -1); moved = true; }
  });
  book.addEventListener('pointercancel', () => { x0 = null; });
  book.addEventListener('click', e => {
    if (moved) { moved = false; return; }
    const r = book.getBoundingClientRect(); const left = e.clientX < r.left + r.width / 2;
    const cur = S.album.cur, n = BOOK.n;
    if (cur === 0) { flip(1); return; } if (cur === n) { flip(-1); return; }
    const isNext = rtl() ? left : !left; flip(isNext ? 1 : -1);
  });
  book.addEventListener('keydown', e => {
    const rt = rtl();
    if (e.key === (rt ? 'ArrowLeft' : 'ArrowRight') || e.key === 'PageDown') { e.preventDefault(); flip(1); }
    else if (e.key === (rt ? 'ArrowRight' : 'ArrowLeft') || e.key === 'PageUp') { e.preventDefault(); flip(-1); }
    else if (e.key === 'Home') { e.preventDefault(); S.album.cur = 0; applyBook(false); }
    else if (e.key === 'End') { e.preventDefault(); S.album.cur = BOOK.n; applyBook(false); }
  });
}
async function assembleAlbum() {
  S.album.built = true;
  const stage = q('.pa-album__stage'), book = q('.pa-book'), fly = q('.pa-fly');
  const auto = q('.pa-album__auto');
  if (reduced() || !book.animate) { auto.classList.add('is-on'); return; }
  if (!App.tour.running && book.getBoundingClientRect().bottom > Math.min(dockTop(), innerHeight) - 12) {
    book.style.opacity = '0';
    const head = q('.pa-album__head'), wrap = q('.pa-tabs-wrap');
    await App.scrollTo(App.scrollY() + head.getBoundingClientRect().top - barH() - wrap.offsetHeight - 8, { duration: 480 });
    if (S.tab !== 'album' || !S.logged) { book.style.opacity = ''; return; }
  }
  const sr = stage.getBoundingClientRect(); const br = book.getBoundingClientRect();
  if (!sr.width) { book.style.opacity = ''; auto.classList.add('is-on'); return; }
  book.style.opacity = '0';
  const cx = br.left - sr.left + br.width * (lang() === 'he' ? .25 : .75), cy = br.top - sr.top + br.height / 2;
  fly.innerHTML = ALBUM.map((a, i) => `<div class="pa-fly__c" style="--i:${i}">${scene(a.scene)}</div>`).join('');
  const cards = $$('.pa-fly__c', fly);
  const W = sr.width, H = sr.height;
  book.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' }).finished.then(() => { book.style.opacity = ''; book.getAnimations().forEach(a => a.cancel()); }).catch(() => { });
  const anims = cards.map((c, i) => {
    const ang = (i / cards.length) * Math.PI * 2 + .4;
    const sx = W / 2 + Math.cos(ang) * W * .44 - 44, sy = H / 2 + Math.sin(ang) * H * .42 - 32;
    const rot = (i % 2 ? 1 : -1) * (8 + (i * 7) % 14);
    return c.animate([
      { transform: `translate(${sx}px, ${sy}px) rotate(${rot}deg) scale(.4)`, opacity: 0 },
      { transform: `translate(${sx}px, ${sy}px) rotate(${rot}deg) scale(1)`, opacity: 1, offset: .35 },
      { transform: `translate(${cx - 44}px, ${cy - 32}px) rotate(0deg) scale(.3)`, opacity: .2 }
    ], { duration: 1100, delay: 260 + i * 85, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
  });
  anims.forEach((a, i) => a.finished.then(() => { if (i % 3 === 0) { const r = book.getBoundingClientRect(); App.fx.burst(r.left + r.width * (lang() === 'he' ? .25 : .75), r.top + r.height / 2, { count: 5, speed: [40, 140], size: [5, 12], life: [300, 600], gravity: 40 }); } }).catch(() => { }));
  await Promise.all(anims.map(a => a.finished.catch(() => { })));
  fly.innerHTML = '';
  const cover = q('.pa-leaf[data-i="0"]');
  if (cover) cover.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  const r = book.getBoundingClientRect(); App.fx.ring(r.left + r.width * (lang() === 'he' ? .25 : .75), r.top + r.height / 2, r.height * .4, 14);
  auto.classList.add('is-on');
  await sleep(700);
  if (S.tab === 'album' && S.album.cur === 0 && S.logged) flip(1);
}

/* =====================================================================
   LIVE ANIMATION GATE (pause offscreen scene loops)
   ===================================================================== */
function observeLive(root = R) {
  if (!('IntersectionObserver' in window)) { $$('[data-pa-live]', root).forEach(el => el.classList.add('pa-live')); return; }
  if (!S.liveIO) S.liveIO = new IntersectionObserver(ens => ens.forEach(en => en.target.classList.toggle('pa-live', en.isIntersecting)), { rootMargin: '40px' });
  $$('[data-pa-live]', root).forEach(el => { if (!el.dataset.paObs) { el.dataset.paObs = '1'; S.liveIO.observe(el); } });
}

/* =====================================================================
   RENDER ALL + RESET
   ===================================================================== */
function renderAll() {
  renderHeader(); renderTiles(); renderFeed(); renderSummary(); renderPay(); renderCal(); renderMenu(); renderDocs(); renderAlbum(); renderMore();
}
/* shortcuts under the summary: what is waiting in the other tabs */
function renderMore() {
  const box = q('.pa-more__list'); if (!box) return;
  const done = S.shabbat.size, total = SHABBAT_LIST.length;
  const m = monthName(new Date());
  const items = [
    { tab: 'pay', ic: 'card', tone: S.paid ? 'mint' : 'sun', t: t('pa.more.pay', { m: lang() === 'ru' ? m.toLowerCase() : m }), s: S.paid ? t('pa.more.paid') : t('pa.more.due', { sum: App.fmt.money(PAY_TOTAL) }) },
    { tab: 'cal', ic: 'candle', tone: done === total ? 'mint' : 'pink', t: t('pa.shab.title'), s: done === total ? t('pa.shab.ready') : t('pa.shab.count', { n: done, t: total }) },
    { tab: 'docs', ic: 'pen', tone: S.signed ? 'mint' : 'sky', t: t('pa.docs.health'), s: S.signed ? t('pa.docs.signedToday') : t('pa.docs.waiting') },
    { tab: 'album', ic: 'book', tone: 'lilac', t: t('pa.album.title'), s: t('pa.album.auto') }
  ];
  box.innerHTML = items.map(it => `<button type="button" class="pa-more__i" data-goto="${it.tab}"><span class="pa-more__ic pa-tone-${it.tone}" aria-hidden="true">${icon(it.ic)}</span><span class="rowi__main"><span class="rowi__title">${esc(it.t)}</span><span class="rowi__sub">${esc(it.s)}</span></span>${icon('chevron', 'ic--dir ic--sm pa-more__chev')}</button>`).join('');
}
function resetState() {
  S.sent = { absent: null, late: null, pickup: null, msg: null };
  S.paid = false; S.signed = false; S.sigData = null; S.sigStrokes = 0;
  S.consent = { own: true, group: false, social: false };
  S.shabbat = new Set(); S.sumLang = lang(); S.sumNotified = false;
  S.calMonth = null; S.calSel = null;
  const d = new Date().getDay(); S.menuDay = d <= 4 ? d : 0; S.allergyOn = false; S.allergen = null;
  S.album = { cur: 0, built: false, flips: 0 };
  qq('.pa-like').forEach(b => b.setAttribute('aria-pressed', 'false'));
  if (S.phone) $('.phone__notifs', S.phone).innerHTML = '';
  if (sig.cv) clearSig();
}

/* =====================================================================
   COPY · Hebrew + Russian
   ===================================================================== */
const I18N = {
  he: {
    'pa.login.eyebrow': 'אזור ההורים', 'pa.login.title': 'כל היום בגן, אצלכם בטלפון',
    'pa.login.lead': 'מה אכלו, כמה ישנו, תמונות שרק אתם רואים, תשלומים ומסמכים. נכנסים עם קוד חד-פעמי.',
    'pa.login.phone': 'מספר הנייד שלכם', 'pa.login.hint': 'הקוד יגיע אליכם בהודעה', 'pa.login.sample': 'מספר לדוגמה',
    'pa.login.send': 'שליחת קוד', 'pa.login.sending': 'שולחים קוד…', 'pa.login.err': 'צריך מספר נייד מלא, למשל 050-123-4567',
    'pa.login.code': 'הקוד שקיבלתם', 'pa.login.sentTo': 'שלחנו קוד ל-{phone}', 'pa.login.enter': 'כניסה', 'pa.login.resend': 'לא הגיע? לשלוח שוב', 'pa.login.other': 'מספר אחר',
    'pa.login.d1': 'ספרה 1 מתוך 4', 'pa.login.d2': 'ספרה 2 מתוך 4', 'pa.login.d3': 'ספרה 3 מתוך 4', 'pa.login.d4': 'ספרה 4 מתוך 4', 'pa.login.demo': 'בדמו כל מספר נייד עובד, ושום הודעה לא נשלחת באמת.',
    'pa.login.smsApp': 'הודעות', 'pa.login.smsNow': 'עכשיו', 'pa.login.smsText': 'גן סינדרלה: קוד הכניסה שלכם הוא 4815',
    'pa.hi.morning': 'בוקר טוב, {name}', 'pa.hi.day': 'צהריים טובים, {name}', 'pa.hi.evening': 'ערב טוב, {name}', 'pa.hi.night': 'לילה טוב, {name}',
    'pa.group': 'קבוצת {g}', 'pa.status.in': 'בגן מ-07:48', 'pa.status.home': 'היום בגן: \u206607:48–16:50\u2069',
    'pa.trust': 'התמונות של נועה רק אצלכם, לא בקבוצות', 'pa.onlyYou': 'רק אצלכם',
    'pa.menuBtn': 'תפריט חשבון', 'pa.notifs': 'התראות לטלפון', 'pa.notifsOn': 'ההתראות הופעלו', 'pa.notifsOff': 'ההתראות כובו', 'pa.logout': 'התנתקות', 'pa.loggedOut': 'התנתקתם. להתראות!',
    'pa.tabs': 'מדורים באזור ההורים', 'pa.tab.today': 'היום', 'pa.tab.pay': 'תשלומים', 'pa.tab.cal': 'לוח שנה', 'pa.tab.menu': 'תפריט', 'pa.tab.docs': 'מסמכים', 'pa.tab.album': 'אלבום',
    'pa.qa.title': 'פעולות מהירות',
    'pa.qa.absent': 'לא מגיעים מחר', 'pa.qa.absentSun': 'לא מגיעים ביום א׳', 'pa.qa.absentSub': 'עדכון לצוות', 'pa.qa.late': 'מאחרים', 'pa.qa.lateSub': 'כמה דקות?',
    'pa.qa.pickup': 'מי אוסף היום', 'pa.qa.pickupSub': 'קוד איסוף חד-פעמי', 'pa.qa.msg': 'הודעה לצוות', 'pa.qa.msgSub': 'בעברית או ברוסית', 'pa.qa.sentShort': 'נשלח',
    'pa.sending': 'שולחים…', 'pa.close': 'סגירה', 'pa.note': 'רוצים להוסיף משהו? (לא חובה)', 'pa.note.ph': 'למשל: חוזרים ביום רביעי',
    'pa.abs.when': 'מתי לא מגיעים', 'pa.abs.why': 'מה קרה?', 'pa.abs.send': 'שליחה לצוות', 'pa.abs.pick': 'בחרו סיבה, שהצוות יידע',
    'pa.abs.doneT': 'הצוות עודכן', 'pa.abs.done': 'סימנו שנועה לא מגיעה ב{date}. נתגעגע!', 'pa.abs.doneSick': 'רפואה שלמה לנועה! סימנו שהיא לא מגיעה ב{date}.',
    'pa.abs.undo': 'בעצם מגיעים', 'pa.abs.undone': 'מעולה, מחכים לנועה!',
    'pa.late.lead': 'נעדכן את הצוות כדי שאף אחד לא ידאג.', 'pa.late.how': 'בכמה מאחרים?', 'pa.late.ph': 'למשל: תקועים בפקק', 'pa.late.send': 'שליחה לצוות', 'pa.late.pick': 'בחרו בכמה מאחרים',
    'pa.late.doneT': 'הצוות יודע', 'pa.late.done': 'מסרנו שתאחרו בכ-{n} דקות. אין לחץ, נועה בידיים טובות.', 'pa.late.chip': 'כ-{n} דק׳',
    'pa.pick.lead': 'רק מי שברשימת האיסוף שלכם. כל קוד טוב לאיסוף אחד.', 'pa.pick.make': 'יצירת קוד איסוף', 'pa.pick.making': 'יוצרים קוד…',
    'pa.pick.only': 'הצוות רואה את הרשימה ומבקש את הקוד', 'pa.pick.pick': 'בחרו מי אוסף היום', 'pa.pick.codeA': 'קוד איסוף: {code}',
    'pa.pick.until': 'בתוקף היום עד {time}', 'pa.pick.staff': 'הצוות יבקש את הקוד באיסוף.', 'pa.pick.send': 'שליחת הקוד ל{name}', 'pa.pick.sent': 'הקוד נשלח ל{name}',
    'pa.pick.doneM': '{name} אוסף היום', 'pa.pick.doneF': '{name} אוספת היום',
    'pa.msg.lead': 'כתבו בעברית או ברוסית. הצוות יקבל בעברית.', 'pa.msg.examples': 'דוגמאות מוכנות', 'pa.msg.label': 'ההודעה שלכם', 'pa.msg.ph': 'מה תרצו לספר לצוות?',
    'pa.msg.send': 'שליחה לצוות', 'pa.msg.empty': 'כתבו כמה מילים, או בחרו דוגמה', 'pa.msg.asIs': 'נשלח כמו שכתבתם, בעברית', 'pa.msg.translated': 'תורגם לעברית אוטומטית',
    'pa.msg.orig': 'במקור:', 'pa.msg.demoOnly': 'במערכת האמיתית כל הודעה מתורגמת לעברית. בדמו מתורגמות רק הדוגמאות.', 'pa.msg.staffSees': 'כך זה מגיע לצוות',
    'pa.msg.doneT': 'נשלח לצוות', 'pa.msg.youSee': 'הצוות ענה', 'pa.msg.replyTr': 'התשובה תורגמה אוטומטית לרוסית',
    'pa.feed.title': 'היום של נועה', 'pa.like': 'אהבתי',
    'pa.more.title': 'עוד באזור האישי', 'pa.more.pay': 'תשלום ל{m}', 'pa.more.due': 'ממתין לתשלום · {sum}', 'pa.more.paid': 'שולם, הקבלה מוכנה',
    'pa.sum.eyebrow': 'נשלח אליכם ב-17:30', 'pa.sum.title': 'סיכום היום', 'pa.sum.auto': 'נכתב אוטומטית מהסימונים של הצוות', 'pa.sum.lang': 'שפת הסיכום',
    'pa.sum.phone': 'הטלפון שלכם', 'pa.sum.phoneSub': 'ההתראה מגיעה לבד, בשפה שבחרתם',
    'pa.pay.month': 'החשבון החודשי', 'pa.pay.paid': 'שולם', 'pa.pay.due': 'ממתין לתשלום', 'pa.pay.tuition': 'תשלום חודשי · {g}',
    'pa.pay.subsidy': 'הנחת סבסוד', 'pa.pay.subsidySub': 'לפי הזכאות שלכם', 'pa.pay.total': 'לתשלום', 'pa.pay.totalPaid': 'שולם',
    'pa.pay.viewRcpt': 'פתיחת הקבלה', 'pa.pay.payBtn': 'תשלום {sum}', 'pa.pay.secure': 'תשלום מאובטח. בדמו אין חיוב אמיתי.',
    'pa.pay.receipts': 'קבלות', 'pa.pay.rcptOf': 'קבלה · {m}', 'pa.pay.paidOn': 'שולם ב-{d}', 'pa.pay.auto': 'הקבלה נוצרת לבד אחרי כל תשלום.',
    'pa.pay.title': 'תשלום', 'pa.pay.for': 'החשבון של {m}', 'pa.pay.how': 'איך משלמים?', 'pa.pay.saved': 'הכרטיס השמור', 'pa.pay.exp': 'תוקף', 'pa.pay.new': 'כרטיס אחר',
    'pa.pay.ccNum': 'מספר כרטיס', 'pa.pay.ccExp': 'תוקף', 'pa.pay.expPh': 'MM/YY', 'pa.pay.sample': 'למלא כרטיס לדוגמה', 'pa.pay.payNow': 'תשלום {sum}',
    'pa.pay.missing': 'חסרים פרטי כרטיס', 'pa.pay.processing': 'מעבדים את התשלום…', 'pa.pay.doneT': 'שולם, תודה!', 'pa.pay.done': 'הקבלה כבר מחכה לכם ברשימת הקבלות.',
    'pa.pay.rcptNo': 'קבלה מס׳ {n}', 'pa.pay.date': 'תאריך', 'pa.pay.forWho': 'עבור', 'pa.pay.period': 'חודש', 'pa.pay.method': 'אמצעי תשלום',
    'pa.pay.share': 'שליחה בוואטסאפ', 'pa.pay.shared': 'שלחנו לכם את הקבלה',
    'pa.cal.holiday': 'חג', 'pa.cal.closed': 'יום סגור (לדוגמה)', 'pa.cal.event': 'אירוע', 'pa.cal.bday': 'יום הולדת', 'pa.cal.today': 'היום', 'pa.cal.tomorrow': 'מחר',
    'pa.cal.prev': 'החודש הקודם', 'pa.cal.next': 'החודש הבא', 'pa.cal.upcoming': 'מה בקרוב', 'pa.cal.bdays': 'ימי הולדת בקבוצה', 'pa.cal.days': '{n} ימים',
    'pa.cal.sat': 'שבת, הגן סגור.', 'pa.cal.fri': 'יום שישי, הגן פתוח עד 13:00.', 'pa.cal.regular': 'יום רגיל בגן, בלי אירועים מיוחדים.',
    'pa.shab.eyebrow': 'קבלת שבת בגן', 'pa.shab.title': 'השבוע אתם הורי שבת', 'pa.shab.when': 'ב{date}. מה להביא:', 'pa.shab.count': '{n} מתוך {t} מוכנים', 'pa.shab.ready': 'הכל מוכן. שבת שלום!',
    'pa.menu.title': 'תפריט השבוע', 'pa.menu.fact': 'מבשלים כל יום במטבח של הגן, ואת התפריט אישרה דיאטנית.', 'pa.menu.example': 'תפריט לדוגמה',
    'pa.menu.toggle': 'סימון אלרגנים לנועה', 'pa.menu.none': 'אין אלרגיות רשומות', 'pa.menu.try': 'רוצים לראות איך זה עובד? בחרו אלרגן:',
    'pa.menu.count': 'מנות עם {a} השבוע: {n}', 'pa.menu.count1': 'השבוע מנה אחת עם {a}', 'pa.menu.days': 'ימי השבוע', 'pa.menu.b': 'ארוחת בוקר', 'pa.menu.l': 'ארוחת צהריים', 'pa.menu.s': 'מנחה',
    'pa.menu.noAl': 'בלי אלרגנים נפוצים', 'pa.menu.contains': 'מכיל {a}',
    'pa.docs.title': 'מסמכים', 'pa.docs.count': '{n} מתוך {t} מסמכים מוכנים', 'pa.docs.health': 'הצהרת בריאות', 'pa.docs.healthSub': 'לשנת הלימודים הזאת',
    'pa.docs.waiting': 'ממתין לחתימה', 'pa.docs.signedToday': 'נחתם היום',
    'pa.docs.healthText': 'אנחנו מצהירים שנועה בריאה ויכולה להשתתף בכל הפעילויות בגן, ונעדכן את הצוות בכל שינוי בבריאות שלה.',
    'pa.docs.sigLabel': 'החתימה שלכם', 'pa.docs.sigPh': 'חתמו כאן באצבע', 'pa.docs.clear': 'מחיקה', 'pa.docs.sign': 'חתימה ושליחה', 'pa.docs.typed': 'לחתום בהקלדה',
    'pa.docs.needSig': 'צריך לחתום בתוך המסגרת', 'pa.docs.signedToast': 'נחתם ונשלח לגן', 'pa.docs.signedAt': 'נחתם ב-{d} בשעה {t}',
    'pa.docs.photo': 'אישור צילום', 'pa.docs.photoSub': 'מה מותר לעשות עם התמונות של נועה', 'pa.docs.upToDate': 'מעודכן',
    'pa.docs.c.own': 'תמונות של נועה לאזור האישי שלכם', 'pa.docs.c.group': 'תמונות קבוצתיות, רק להורים של הילדים שבתמונה', 'pa.docs.c.social': 'פרסום ברשתות החברתיות של הגן',
    'pa.docs.saved': 'נשמר', 'pa.docs.reg': 'טופס רישום', 'pa.docs.regSub': 'התקבל בתחילת השנה', 'pa.docs.got': 'התקבל',
    'pa.docs.pick': 'רשימת האיסוף', 'pa.docs.pickSub': 'אמא, אבא, סבתא ודודה', 'pa.docs.people': '4 אנשים',
    'pa.album.title': 'האלבום של נועה', 'pa.album.auto': 'מתמלא לבד בתמונות של השנה', 'pa.album.coverK': 'קבוצת בוגרים',
    'pa.album.introT': 'שנה שלמה של רגעים קטנים', 'pa.album.count': '{n} רגעים מספטמבר עד יוני', 'pa.album.endT': 'איזו שנה, נועה!', 'pa.album.endX': 'ממשיכים לאסוף רגעים גם בשנה הבאה',
    'pa.album.slogan': 'גן ילדים מהאגדות', 'pa.album.book': 'ספר', 'pa.album.cover': 'כריכה', 'pa.album.backCover': 'כריכה אחורית', 'pa.album.pages': 'עמודים \u2066{a}–{b}\u2069 מתוך {t}',
    'pa.album.prev': 'הדף הקודם', 'pa.album.next': 'הדף הבא', 'pa.album.hint': 'מדפדפים בהחלקה, בנגיעה בדף או בחצים במקלדת'
  },
  ru: {
    'pa.login.eyebrow': 'Кабинет родителей', 'pa.login.title': 'Весь день ребёнка у вас в телефоне',
    'pa.login.lead': 'Что ели, сколько спали, фото только для вас, оплата и документы. Вход по одноразовому коду.',
    'pa.login.phone': 'Ваш мобильный', 'pa.login.hint': 'Пришлём одноразовый код', 'pa.login.sample': 'Пример номера',
    'pa.login.send': 'Получить код', 'pa.login.sending': 'Отправляем код…', 'pa.login.err': 'Нужен полный мобильный номер, например 050-123-4567',
    'pa.login.code': 'Код из сообщения', 'pa.login.sentTo': 'Отправили код на {phone}', 'pa.login.enter': 'Войти', 'pa.login.resend': 'Не пришло? Повторить', 'pa.login.other': 'Другой номер',
    'pa.login.d1': 'Цифра 1 из 4', 'pa.login.d2': 'Цифра 2 из 4', 'pa.login.d3': 'Цифра 3 из 4', 'pa.login.d4': 'Цифра 4 из 4', 'pa.login.demo': 'В демо подойдёт любой мобильный, сообщения на самом деле не отправляются.',
    'pa.login.smsApp': 'Сообщения', 'pa.login.smsNow': 'сейчас', 'pa.login.smsText': 'Сад «Синдерелла»: ваш код для входа 4815',
    'pa.hi.morning': 'Доброе утро, {name}', 'pa.hi.day': 'Добрый день, {name}', 'pa.hi.evening': 'Добрый вечер, {name}', 'pa.hi.night': 'Доброй ночи, {name}',
    'pa.group': '{g}', 'pa.status.in': 'В саду с 07:48', 'pa.status.home': 'В саду: 07:48–16:50',
    'pa.trust': 'Фото Ноа только у вас, не в общих чатах', 'pa.onlyYou': 'Только у вас',
    'pa.menuBtn': 'Меню аккаунта', 'pa.notifs': 'Уведомления на телефон', 'pa.notifsOn': 'Уведомления включены', 'pa.notifsOff': 'Уведомления выключены', 'pa.logout': 'Выйти', 'pa.loggedOut': 'Вы вышли. До встречи!',
    'pa.tabs': 'Разделы кабинета', 'pa.tab.today': 'Сегодня', 'pa.tab.pay': 'Оплата', 'pa.tab.cal': 'Календарь', 'pa.tab.menu': 'Меню', 'pa.tab.docs': 'Документы', 'pa.tab.album': 'Альбом',
    'pa.qa.title': 'Быстрые действия',
    'pa.qa.absent': 'Завтра не придём', 'pa.qa.absentSun': 'Не придём в воскресенье', 'pa.qa.absentSub': 'Предупредить', 'pa.qa.late': 'Опаздываем', 'pa.qa.lateSub': 'На сколько?',
    'pa.qa.pickup': 'Кто заберёт сегодня', 'pa.qa.pickupSub': 'Одноразовый код', 'pa.qa.msg': 'Написать воспитателям', 'pa.qa.msgSub': 'По-русски или на иврите', 'pa.qa.sentShort': 'Отправлено',
    'pa.sending': 'Отправляем…', 'pa.close': 'Закрыть', 'pa.note': 'Хотите что-то добавить? (необязательно)', 'pa.note.ph': 'Например: вернёмся в среду',
    'pa.abs.when': 'Когда не придём', 'pa.abs.why': 'Что случилось?', 'pa.abs.send': 'Предупредить воспитателей', 'pa.abs.pick': 'Выберите причину, чтобы воспитатели знали',
    'pa.abs.doneT': 'Передали воспитателям', 'pa.abs.done': 'Ноа не будет в саду: {date}. Будем скучать!', 'pa.abs.doneSick': 'Пусть Ноа скорее поправляется! Отметили, что её не будет: {date}.',
    'pa.abs.undo': 'Всё-таки придём', 'pa.abs.undone': 'Отлично, ждём Ноа!',
    'pa.late.lead': 'Предупредим воспитателей, чтобы никто не волновался.', 'pa.late.how': 'На сколько опаздываете?', 'pa.late.ph': 'Например: стоим в пробке', 'pa.late.send': 'Предупредить воспитателей', 'pa.late.pick': 'Выберите, на сколько опаздываете',
    'pa.late.doneT': 'Воспитатели в курсе', 'pa.late.done': 'Передали, что вы задержитесь минут на\u00a0{n}. Не спешите, Ноа в надёжных руках.', 'pa.late.chip': '~{n} мин',
    'pa.pick.lead': 'Только те, кто есть в вашем списке. Каждый код действует один раз.', 'pa.pick.make': 'Создать код', 'pa.pick.making': 'Создаём код…',
    'pa.pick.only': 'Воспитатели видят список и спрашивают код', 'pa.pick.pick': 'Выберите, кто заберёт сегодня', 'pa.pick.codeA': 'Код, чтобы забрать Ноа: {code}',
    'pa.pick.until': 'Действует сегодня до {time}', 'pa.pick.staff': 'Воспитатели спросят код, когда будут отдавать Ноа.', 'pa.pick.send': 'Отправить код {name}', 'pa.pick.sent': 'Код отправлен {name}',
    'pa.pick.doneM': 'Сегодня Ноа забирает {name}', 'pa.pick.doneF': 'Сегодня Ноа забирает {name}',
    'pa.msg.lead': 'Пишите по-русски или на иврите. Воспитатели получат на иврите.', 'pa.msg.examples': 'Готовые примеры', 'pa.msg.label': 'Ваше сообщение', 'pa.msg.ph': 'Что хотите рассказать воспитателям?',
    'pa.msg.send': 'Отправить', 'pa.msg.empty': 'Напишите пару слов или выберите пример', 'pa.msg.asIs': 'Ушло как есть, на иврите', 'pa.msg.translated': 'Переведено на иврит автоматически',
    'pa.msg.orig': 'Оригинал:', 'pa.msg.demoOnly': 'В настоящей системе каждое сообщение переводится на иврит автоматически. В демо переводятся только примеры.', 'pa.msg.staffSees': 'Так его увидят воспитатели',
    'pa.msg.doneT': 'Отправлено воспитателям', 'pa.msg.youSee': 'Воспитатели ответили', 'pa.msg.replyTr': 'Ответ переведён на русский автоматически',
    'pa.feed.title': 'День Ноа', 'pa.like': 'Нравится',
    'pa.more.title': 'Ещё в кабинете', 'pa.more.pay': 'Оплата за {m}', 'pa.more.due': 'Ждёт оплаты · {sum}', 'pa.more.paid': 'Оплачено, квитанция готова',
    'pa.sum.eyebrow': 'Приходит вам в 17:30', 'pa.sum.title': 'Итоги дня', 'pa.sum.auto': 'Написано автоматически по отметкам воспитателей', 'pa.sum.lang': 'Язык сводки',
    'pa.sum.phone': 'Ваш телефон', 'pa.sum.phoneSub': 'Уведомление приходит само, на вашем языке',
    'pa.pay.month': 'Счёт за месяц', 'pa.pay.paid': 'Оплачено', 'pa.pay.due': 'Ждёт оплаты', 'pa.pay.tuition': 'Оплата за месяц · {g}',
    'pa.pay.subsidy': 'Скидка по субсидии', 'pa.pay.subsidySub': 'вам она положена', 'pa.pay.total': 'К оплате', 'pa.pay.totalPaid': 'Оплачено',
    'pa.pay.viewRcpt': 'Открыть квитанцию', 'pa.pay.payBtn': 'Оплатить {sum}', 'pa.pay.secure': 'Безопасная оплата. В демо деньги не списываются.',
    'pa.pay.receipts': 'Квитанции', 'pa.pay.rcptOf': 'Квитанция · {m}', 'pa.pay.paidOn': 'Оплачено {d}', 'pa.pay.auto': 'Квитанция появляется сама после каждой оплаты.',
    'pa.pay.title': 'Оплата', 'pa.pay.for': 'Счёт · {m}', 'pa.pay.how': 'Чем платим?', 'pa.pay.saved': 'Сохранённая карта', 'pa.pay.exp': 'до', 'pa.pay.new': 'Другая карта',
    'pa.pay.ccNum': 'Номер карты', 'pa.pay.ccExp': 'Срок действия', 'pa.pay.expPh': 'ММ/ГГ', 'pa.pay.sample': 'Заполнить тестовой картой', 'pa.pay.payNow': 'Оплатить {sum}',
    'pa.pay.missing': 'Заполните данные карты', 'pa.pay.processing': 'Проводим оплату…', 'pa.pay.doneT': 'Оплачено, спасибо!', 'pa.pay.done': 'Квитанция уже ждёт вас в разделе «Оплата».',
    'pa.pay.rcptNo': 'Квитанция №\u00a0{n}', 'pa.pay.date': 'Дата', 'pa.pay.forWho': 'За кого', 'pa.pay.period': 'Месяц', 'pa.pay.method': 'Способ оплаты',
    'pa.pay.share': 'Отправить себе в WhatsApp', 'pa.pay.shared': 'Отправили вам квитанцию',
    'pa.cal.holiday': 'Праздник', 'pa.cal.closed': 'Выходной (пример)', 'pa.cal.event': 'Событие', 'pa.cal.bday': 'День рождения', 'pa.cal.today': 'Сегодня', 'pa.cal.tomorrow': 'Завтра',
    'pa.cal.prev': 'Предыдущий месяц', 'pa.cal.next': 'Следующий месяц', 'pa.cal.upcoming': 'Что впереди', 'pa.cal.bdays': 'Дни рождения в группе', 'pa.cal.days': '{n} дн.',
    'pa.cal.sat': 'Шабат, сад закрыт.', 'pa.cal.fri': 'Пятница, сад работает до 13:00.', 'pa.cal.regular': 'Обычный день в саду, без особых событий.',
    'pa.shab.eyebrow': 'Встречаем шабат', 'pa.shab.title': 'На этой неделе вы\u00a0— шабатные родители', 'pa.shab.when': '{date}. Что принести:', 'pa.shab.count': 'Готово {n} из {t}', 'pa.shab.ready': 'Всё готово. Шабат шалом!',
    'pa.menu.title': 'Меню недели', 'pa.menu.fact': 'Готовим каждый день на своей кухне. Меню утвердил диетолог.', 'pa.menu.example': 'пример меню',
    'pa.menu.toggle': 'Аллергены для Ноа', 'pa.menu.none': 'Аллергий не указано', 'pa.menu.try': 'Хотите посмотреть, как это работает? Выберите аллерген:',
    'pa.menu.count': 'На этой неделе блюд с аллергеном «{a}»: {n}', 'pa.menu.count1': 'На этой неделе {a} есть в одном блюде', 'pa.menu.days': 'Дни недели', 'pa.menu.b': 'Завтрак', 'pa.menu.l': 'Обед', 'pa.menu.s': 'Полдник',
    'pa.menu.noAl': 'Без основных аллергенов', 'pa.menu.contains': 'Содержит: {a}',
    'pa.docs.title': 'Документы', 'pa.docs.count': 'Готово документов: {n} из {t}', 'pa.docs.health': 'Декларация о здоровье', 'pa.docs.healthSub': 'На этот учебный год',
    'pa.docs.waiting': 'Ждёт подписи', 'pa.docs.signedToday': 'Подписано сегодня',
    'pa.docs.healthText': 'Подтверждаем, что Ноа здорова и может участвовать во всех занятиях в саду. Если что-то изменится, сразу сообщим воспитателям.',
    'pa.docs.sigLabel': 'Ваша подпись', 'pa.docs.sigPh': 'Распишитесь здесь пальцем', 'pa.docs.clear': 'Стереть', 'pa.docs.sign': 'Подписать и отправить', 'pa.docs.typed': 'Ввести имя вместо подписи',
    'pa.docs.needSig': 'Распишитесь, пожалуйста, в рамке', 'pa.docs.signedToast': 'Подписано и отправлено в сад', 'pa.docs.signedAt': 'Подписано {d} в {t}',
    'pa.docs.photo': 'Согласие на фото', 'pa.docs.photoSub': 'Что можно делать с фотографиями Ноа', 'pa.docs.upToDate': 'Актуально',
    'pa.docs.c.own': 'Фото Ноа в вашем личном кабинете', 'pa.docs.c.group': 'Групповые фото, только родителям детей на снимке', 'pa.docs.c.social': 'Публикация в соцсетях сада',
    'pa.docs.saved': 'Сохранили', 'pa.docs.reg': 'Анкета при записи', 'pa.docs.regSub': 'Получена в начале года', 'pa.docs.got': 'Получено',
    'pa.docs.pick': 'Кто забирает', 'pa.docs.pickSub': 'Мама, папа, бабушка и тётя', 'pa.docs.people': '4 человека',
    'pa.album.title': 'Альбом Ноа', 'pa.album.auto': 'Собирается сам из фото за год', 'pa.album.coverK': 'Старшая группа',
    'pa.album.introT': 'Целый год маленьких моментов', 'pa.album.count': '{n} моментов, с сентября по июнь', 'pa.album.endT': 'Какой был год, Ноа!', 'pa.album.endX': 'В следующем году соберём новые моменты',
    'pa.album.slogan': 'Детский сад из сказки', 'pa.album.book': 'книга', 'pa.album.cover': 'Обложка', 'pa.album.backCover': 'Задняя обложка', 'pa.album.pages': 'Страницы {a}–{b} из {t}',
    'pa.album.prev': 'Предыдущая страница', 'pa.album.next': 'Следующая страница', 'pa.album.hint': 'Листайте свайпом, касанием или стрелками'
  }
};

/* =====================================================================
   MODULE
   ===================================================================== */
App.module('parent', {
  view: 'parents',
  i18n: I18N,
  init(root) {
    R = root;
    resetState();
    bindLogin();
    q('[data-pa="menuBtn"]').addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });
    q('[data-pa="logout"]').addEventListener('click', () => { logout(); App.ui.toast(t('pa.loggedOut'), { icon: 'door' }); });
    q('[data-pa="notif"]').addEventListener('click', e => { S.notifOn = !S.notifOn; e.currentTarget.setAttribute('aria-checked', String(S.notifOn)); App.ui.toast(t(S.notifOn ? 'pa.notifsOn' : 'pa.notifsOff'), { icon: 'bell' }); });
    document.addEventListener('click', e => { if (!e.target.closest('#pa-menu') && !e.target.closest('[data-pa="menuBtn"]')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && q('#pa-menu') && !q('#pa-menu').hidden) { closeMenu(); q('[data-pa="menuBtn"]').focus(); } });
    qq('.pa-tile').forEach(b => b.addEventListener('click', () => ({ absent: openAbsent, late: openLate, pickup: openPickup, msg: openMsg })[b.dataset.qa]()));
    bindTabs(); bindFeed(); bindSummary(); bindPay(); bindCal(); bindMenu(); bindDocs();
    q('.pa-more__list').addEventListener('click', e => { const b = e.target.closest('[data-goto]'); if (b) selectTab(b.dataset.goto); });
    q('[data-book="prev"]').addEventListener('click', () => flip(-1));
    q('[data-book="next"]').addEventListener('click', () => flip(1));
    App.on('lang', () => {
      S.sumLang = lang();
      /* an open sheet was built with the old language (and direction): open it again in the new one */
      const cur = S.cur;
      if (cur && !cur.sh.closed && App.ui.sheets.includes(cur.sh)) { cur.sh.close('lang'); setTimeout(() => { if (S.logged && App.state.view === 'parents') cur.reopen(); }, 80); }
      if (!S.logged) return;
      renderAll();
      requestAnimationFrame(() => { moveInd(true); sideTop(); });
      if (S.tab === 'docs') sizeSig();
    });
    let lastW = innerWidth;
    addEventListener('resize', () => {
      if (!S.logged || App.state.view !== 'parents') return;
      moveInd(true);
      /* touch: ignore height-only resizes (browser bars showing/hiding) */
      if (!App.isTouch || innerWidth !== lastW) sideTop();
      lastW = innerWidth;
    }, { passive: true });
  },
  onEnter() {
    if (S.logged) { requestAnimationFrame(() => { moveInd(true); sideTop(); }); renderHeader(); if (S.tab === 'docs') sizeSig(); }
    observeLive();
  },
  onLeave() { closeMenu(); hideSms(); },
  reset() {
    closeSheets();
    resetState();
    if (S.logged || !q('.pa-login') || q('.pa-login').hidden) logout({ instant: true }); else resetLogin();
    S.tab = 'today';
  },
  openSummary() {
    if (!S.logged) showApp({ animate: false });
    selectTab('today', { animate: false, scroll: false });
    const el = q('.pa-sum'); App.scrollTo(el, { offset: barH() + 70 });
  },
  tour: {
    async login(ctx) {
      closeSheets();
      if (S.logged || q('.pa-login').hidden) logout({ instant: true });
      resetState(); resetLogin();
      if (App.scrollY() > 4) await ctx.scrollTo(0, { duration: 200 });
      await ctx.type('#pa-phone', '0501234567', { cps: ctx.fast ? 60 : 40, after: 80 });
      await ctx.tap('[data-pa="sendCode"]', { after: 0 });
      await ctx.waitFor(() => otpValue().length === 4 && !q('[data-pa="enter"]').disabled, 3500);
      await ctx.wait(ctx.fast ? 60 : 120);
      await ctx.tap('[data-pa="enter"]', { after: 0 });
      await ctx.waitFor(() => S.logged, 2500);
      await ctx.wait(ctx.fast ? 150 : 220);
    },
    async feed(ctx) {
      closeSheets();
      if (!S.logged) showApp({ animate: false });
      if (S.tab !== 'today') { await ctx.tap('.pa-tab[data-tab="today"]', { after: 300 }); }
      const list = q('.pa-feed');
      await ctx.scrollTo(list, { offset: barH() + 64, duration: 700 });
      const end = q('.pa-fi:last-child');
      const r = end.getBoundingClientRect();
      const target = App.scrollY() + r.bottom - innerHeight + 200;
      if (ctx.fast) { /* reduced motion: calm static beats instead of a long scroll */
        const y0 = App.scrollY();
        for (const k of [0, .5, 1]) { await ctx.scrollTo(y0 + (target - y0) * k, { duration: 0 }); await ctx.wait(1100); }
      } else await ctx.scrollTo(target, { duration: 3600, linear: false });
      const like = q('.pa-fi .pa-like[data-k="sleep"]');
      if (like && like.getAttribute('aria-pressed') !== 'true') await ctx.tap(like, { after: 500 });
      else await ctx.wait(500);
    },
    async summary(ctx) {
      closeSheets();
      if (!S.logged) showApp({ animate: false });
      if (S.tab !== 'today') await ctx.tap('.pa-tab[data-tab="today"]', { after: 300 });
      const base = S.sumLang, other = base === 'he' ? 'ru' : 'he';
      if (S.phone) $('.phone__notifs', S.phone).innerHTML = '';
      S.sumNotified = true;
      const wide = innerWidth >= 1000;
      /* phones: the caption card covers the bottom, so frame the night panel in the free zone */
      const toPhone = dur => {
        const r = q('.pa-sum__night').getBoundingClientRect();
        const zoneTop = barH() + 60, zoneBot = innerHeight - 210;
        return ctx.scrollTo(App.scrollY() + r.top + r.height / 2 - (zoneTop + zoneBot) / 2, { duration: dur });
      };
      if (wide) await ctx.scrollTo(q('.pa-sum'), { offset: barH() + 66, duration: 800 });
      else await toPhone(750);
      await ctx.wait(ctx.fast ? 80 : 250);
      dropNotif(base, true);
      await ctx.wait(ctx.fast ? 900 : 1150);
      const toCard = () => (wide ? Promise.resolve() : ctx.scrollTo(q('.pa-sum__card'), { offset: barH() + 74, duration: 550 }));
      await toCard();
      await ctx.tap(`.pa-sum__lang button[data-l="${other}"]`, { after: ctx.fast ? 1200 : 950 });
      if (!wide) { await toPhone(550); await ctx.wait(ctx.fast ? 1000 : 1000); }
      else await ctx.wait(ctx.fast ? 600 : 900);
      await toCard();
      await ctx.tap(`.pa-sum__lang button[data-l="${base}"]`, { after: ctx.fast ? 700 : 650 });
    }
  }
});
