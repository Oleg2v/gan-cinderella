/* =====================================================================
   owner · the owner's dashboard ("הנהלה")
   Hero (greeting, date, calm status, day dial, quick chips) · KPI bento ·
   funnel "מהאתר ועד ההרשמה" · "מאחורי הקלעים": 9 automations, each a small film.
   Public: play(id) → Promise<boolean>, reset()
   Tour:   tour.kpis(ctx), tour.automations(ctx)
   All numbers are fictional (marked "נתונים לדוגמה"); no staff names, no prices.
   ===================================================================== */
const { $, $$, h, esc, icon, t } = App;
const L = o => App.L(o);
const lang = () => App.i18n.lang;
const reduced = () => App.motion.reduced;
const num = n => App.fmt.num(n);
const P = (he, ru) => ({ he, ru });
const ic = (n, c = '') => icon(n, c);
const inLang = (o, lg) => (o == null ? '' : typeof o === 'string' ? o : (o[lg] != null ? o[lg] : (o.he != null ? o.he : o.ru)));
const abortErr = () => { const e = new Error('aborted'); e.name = 'AbortError'; return e; };
const sleep = (ms, signal) => new Promise((res, rej) => {
  if (signal && signal.aborted) return rej(abortErr());
  const id = setTimeout(res, ms);
  if (signal) signal.addEventListener('abort', () => { clearTimeout(id); rej(abortErr()); }, { once: true });
});
const ease = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const reflow = el => void el.offsetWidth;

/* =====================================================================
   I18N
   ===================================================================== */
const HE = {
  'ow.demo': 'נתונים לדוגמה', 'ow.example': 'לדוגמה',
  'ow.hero.sub': 'ככה נראה הגן שלך היום',
  'ow.greet.morning': 'בוקר טוב', 'ow.greet.noon': 'צהריים טובים', 'ow.greet.eve': 'ערב טוב', 'ow.greet.night': 'לילה טוב',
  'ow.status.open': 'יום רגוע. {n} ילדים בגן, ושום דבר לא דחוף.',
  'ow.status.early': 'בוקר שקט. הגן נפתח ב-07:00, והכול מוכן.',
  'ow.status.closed': 'היום הסתיים. הסיכומים נשלחו, והכול מוכן למחר.',
  'ow.status.weekend': 'שבת שלום. הגן נח, והמערכת שומרת על הסדר.',
  'ow.dial.open': 'פתוח', 'ow.dial.closed': 'סגור', 'ow.dial.a11y': 'שעות הגן היום {hrs}. עכשיו {now}, {state}.', 'ow.dial.sat': 'סגור היום',
  'ow.quick': 'קיצורי דרך', 'ow.q.funnel': 'מהאתר להרשמה', 'ow.q.auto': 'מאחורי הקלעים', 'ow.q.pay': 'תשלומים', 'ow.q.wait': 'רשימת המתנה',
  'ow.kpis.h': 'המספרים של היום',
  /* KPI */
  'ow.k.kids': 'ילדים היום', 'ow.k.kidsPill': '{p} נוכחות', 'ow.k.kidsSub': 'מתוך {n} רשומים · {m} לא הגיעו היום', 'ow.k.arr': 'הגעות לפי שעה', 'ow.k.arrA11y': 'הגעות לפי שעה: {list}',
  'ow.k.groups': 'תפוסת קבוצות', 'ow.k.groupsPill': 'מקומות פנויים: {n}', 'ow.k.free': '{n} פנויים', 'ow.k.last': 'מקום אחרון', 'ow.k.full': 'מלא', 'ow.k.ringA11y': '{g}: תפוסה {p}, {note}',
  'ow.k.wait': 'רשימת המתנה', 'ow.k.waitUnit': 'משפחות', 'ow.k.waitPill': '+2 השבוע', 'ow.k.waitHint': 'כשמתפנה מקום, ההצעה יוצאת לבד.', 'ow.k.waitHow': 'איך זה עובד', 'ow.k.waitA11y': '{n} משפחות ברשימת ההמתנה',
  'ow.k.tours': 'סיורים השבוע', 'ow.k.toursNext': 'הבא', 'ow.k.toursWhen': 'מחר 09:30', 'ow.k.weekA11y': 'סיורים לפי יום: {list}',
  'ow.k.src': 'פניות לפי מקור', 'ow.k.srcPill': '{n} החודש', 'ow.k.src.site': 'אתר', 'ow.k.src.fb': 'Facebook', 'ow.k.src.ru': 'פורטל בשפה הרוסית',
  'ow.k.pay': 'תשלומים', 'ow.k.paid': 'שולם', 'ow.k.pending': 'ממתין', 'ow.k.payPill': 'ממתינים: {n}', 'ow.k.payUnit': 'משפחות', 'ow.k.payA11y': '{a} משפחות שילמו, {b} ממתינות',
  'ow.k.shift': 'מי במשמרת', 'ow.k.shiftPill': 'צוות מלא', 'ow.k.role.carers': 'מטפלות', 'ow.k.role.kitchen': 'מטבח', 'ow.k.shiftA11y': '{role}: {n} מתוך {m}',
  /* funnel */
  'ow.fun.eyebrow': 'המשפך', 'ow.fun.h': 'מהאתר ועד ההרשמה', 'ow.fun.period': 'תקופה', 'ow.fun.week': 'שבוע', 'ow.fun.month': 'חודש',
  'ow.fun.s.visits': 'ביקורים באתר', 'ow.fun.s.tours': 'סיורים', 'ow.fun.s.regs': 'הרשמות', 'ow.fun.s.pays': 'תשלומים',
  'ow.fun.c.tours': 'מביקור לסיור', 'ow.fun.c.regs': 'מסיור להרשמה', 'ow.fun.c.pays': 'מהרשמה לתשלום',
  'ow.fun.convA11y': '{p} עברו מהשלב הקודם', 'ow.fun.insight': 'מכל 100 ביקורים באתר, בערך {n} משפחות נרשמות ומשלמות.', 'ow.fun.scale': 'הפסים בקנה מידה אמיתי',
  /* automations */
  'ow.auto.eyebrow': 'מאחורי הקלעים', 'ow.auto.h': 'המערכת עובדת בשבילך', 'ow.auto.lead': 'תשע עבודות קטנות שקורות לבד, כל יום. נגיעה בכרטיס מראה בדיוק איך.',
  'ow.auto.active': '{n} מתוך 9 פועלות', 'ow.auto.feed': 'הפעלות אחרונות',
  'ow.a.last': 'הפעלה אחרונה: {when}', 'ow.a.now': 'עכשיו', 'ow.a.min': 'לפני {n} דק׳', 'ow.a.off': 'כבוי', 'ow.a.demo': 'הדגמה',
  'ow.a.offToast': 'האוטומציה כבויה. אפשר להדליק אותה במתג.', 'ow.a.schemaA11y': 'מה מפעיל: {trig}. מה קורה: {acts}.',
  /* stage */
  'ow.st.when': 'מה מפעיל', 'ow.st.log': 'מה קורה עכשיו', 'ow.st.again': 'מההתחלה', 'ow.st.close': 'סגירה',
  'ow.st.done': 'בוצע', 'ow.st.doneSub': 'בלי אף נגיעה שלך.',
  'ow.st.parent': 'הורה', 'ow.st.inHe': 'בעברית', 'ow.st.inRu': 'ברוסית', 'ow.st.owner': 'הטלפון שלך', 'ow.st.kitchen': 'טאבלט המטבח', 'ow.st.staff': 'טאבלט הצוות',
  'ow.st.sent': 'נשלחו', 'ow.st.tabKitchen': 'מטבח · התראות', 'ow.st.tabStaff': 'בוגרים · תזכורות', 'ow.st.tabEmpty': 'אין התראות חדשות',
  /* the nine */
  'ow.a.lead.t': 'פנייה חדשה מהאתר', 'ow.a.lead.d': 'ההורה מקבל מיד מועדים לסיור, ואת מקבלת התראה.', 'ow.a.lead.trig': 'טופס באתר', 'ow.a.lead.act1': 'מועדים לסיור', 'ow.a.lead.act2': 'התראה אלייך', 'ow.a.lead.log': 'פנייה מהאתר · נשלחו מועדים לסיור',
  'ow.a.visit.t': 'תזכורת לסיור', 'ow.a.visit.d': 'יום לפני הסיור ההורה מקבל תזכורת, ואחריו קישור להרשמה.', 'ow.a.visit.trig': 'סיור מחר', 'ow.a.visit.act1': 'תזכורת', 'ow.a.visit.act2': 'קישור להרשמה', 'ow.a.visit.log': 'תזכורת לסיור של מחר',
  'ow.a.seat.t': 'התפנה מקום', 'ow.a.seat.d': 'המקום מוצע מיד למשפחה הבאה ברשימת ההמתנה.', 'ow.a.seat.trig': 'מקום פנוי', 'ow.a.seat.act1': 'הצעה למשפחה הבאה', 'ow.a.seat.log': 'מקום בצעירים הוצע למשפחה הבאה',
  'ow.a.billing.t': 'חשבון חודשי', 'ow.a.billing.d': 'ב-1 בחודש חשבון, ב-5 תזכורת עדינה, והקבלה יוצאת לבד.', 'ow.a.billing.trig': '1 בחודש', 'ow.a.billing.act1': 'חשבון', 'ow.a.billing.act2': 'תזכורת ב-5', 'ow.a.billing.act3': 'קבלה', 'ow.a.billing.log': 'חשבון, תזכורת וקבלה יצאו לבד',
  'ow.a.summaries.t': 'סיכומי ערב', 'ow.a.summaries.d': 'ב-17:30 כל הורה מקבל סיכום חם של היום, בשפה שלו.', 'ow.a.summaries.trig': '17:30', 'ow.a.summaries.act1': 'סיכום לכל הורה', 'ow.a.summaries.log': '38 סיכומי ערב נשלחו',
  'ow.a.shabbat.t': 'הורי שבת', 'ow.a.shabbat.d': 'ביום רביעי ההורים של השבוע מקבלים תזכורת מה להביא.', 'ow.a.shabbat.trig': 'יום רביעי', 'ow.a.shabbat.act1': 'תזכורת להורים', 'ow.a.shabbat.log': 'תזכורת להורי השבת',
  'ow.a.docs.t': 'מסמך חסר', 'ow.a.docs.d': 'כשחסר מסמך בתיק, ההורה מקבל תזכורת עם קישור לחתימה.', 'ow.a.docs.trig': 'חסר מסמך', 'ow.a.docs.act1': 'תזכורת להורה', 'ow.a.docs.log': 'תזכורת על הצהרת בריאות',
  'ow.a.birthday.t': 'יום הולדת מחר', 'ow.a.birthday.d': 'יום לפני, הצוות מקבל תזכורת להכין חגיגה קטנה.', 'ow.a.birthday.trig': 'מחר יום הולדת', 'ow.a.birthday.act1': 'תזכורת לצוות', 'ow.a.birthday.log': 'תזכורת יום הולדת לצוות',
  'ow.a.allergies.t': 'אלרגיות מול התפריט', 'ow.a.allergies.d': 'התפריט של השבוע נבדק מול האלרגיות של הילדים, והמטבח מקבל התראה.', 'ow.a.allergies.trig': 'תפריט השבוע', 'ow.a.allergies.act1': 'התראה למטבח', 'ow.a.allergies.log': 'שתי התאמות בתפריט, המטבח עודכן'
};
const RU = {
  'ow.demo': 'примерные данные', 'ow.example': 'пример',
  'ow.hero.sub': 'Вот как выглядит ваш сад сегодня',
  'ow.greet.morning': 'Доброе утро', 'ow.greet.noon': 'Добрый день', 'ow.greet.eve': 'Добрый вечер', 'ow.greet.night': 'Доброй ночи',
  'ow.status.open': 'Спокойный день. В саду {n} детей, ничего срочного.',
  'ow.status.early': 'Тихое утро. Сад открывается в 07:00, всё готово.',
  'ow.status.closed': 'День закончился. Сводки отправлены, к завтра всё готово.',
  'ow.status.weekend': 'Шабат шалом. Сад отдыхает, а система следит за порядком.',
  'ow.dial.open': 'открыто', 'ow.dial.closed': 'закрыто', 'ow.dial.a11y': 'Часы работы сегодня {hrs}. Сейчас {now}, {state}.', 'ow.dial.sat': 'сегодня закрыто',
  'ow.quick': 'Быстрые переходы', 'ow.q.funnel': 'От сайта до записи', 'ow.q.auto': 'За кулисами', 'ow.q.pay': 'Оплаты', 'ow.q.wait': 'Лист ожидания',
  'ow.kpis.h': 'Цифры дня',
  'ow.k.kids': 'Дети сегодня', 'ow.k.kidsPill': 'Пришли {p}', 'ow.k.kidsSub': 'Записано {n} · сегодня нет {m}', 'ow.k.arr': 'Приход по времени', 'ow.k.arrA11y': 'Приход по времени: {list}',
  'ow.k.groups': 'Заполненность групп', 'ow.k.groupsPill': 'Свободно мест: {n}', 'ow.k.free': 'свободно {n}', 'ow.k.last': 'последнее место', 'ow.k.full': 'мест нет', 'ow.k.ringA11y': '{g}: заполнено {p}, {note}',
  'ow.k.wait': 'Лист ожидания', 'ow.k.waitUnit': 'семей', 'ow.k.waitPill': '+2 за неделю', 'ow.k.waitHint': 'Когда освобождается место, предложение уходит само.', 'ow.k.waitHow': 'Как это работает', 'ow.k.waitA11y': 'В листе ожидания семей: {n}',
  'ow.k.tours': 'Экскурсии на неделе', 'ow.k.toursNext': 'Ближайшая', 'ow.k.toursWhen': 'завтра 09:30', 'ow.k.weekA11y': 'Экскурсии по дням: {list}',
  'ow.k.src': 'Заявки по источникам', 'ow.k.srcPill': '{n} за месяц', 'ow.k.src.site': 'Сайт', 'ow.k.src.fb': 'Facebook', 'ow.k.src.ru': 'Русскоязычный портал',
  'ow.k.pay': 'Оплаты', 'ow.k.paid': 'Оплачено', 'ow.k.pending': 'Ждут', 'ow.k.payPill': 'Ждут оплаты: {n}', 'ow.k.payUnit': 'семей', 'ow.k.payA11y': 'Оплатили семей: {a}, ждут: {b}',
  'ow.k.shift': 'Кто на смене', 'ow.k.shiftPill': 'Все на месте', 'ow.k.role.carers': 'Воспитательницы', 'ow.k.role.kitchen': 'Кухня', 'ow.k.shiftA11y': '{role}: {n} из {m}',
  'ow.fun.eyebrow': 'Воронка', 'ow.fun.h': 'От сайта до записи', 'ow.fun.period': 'Период', 'ow.fun.week': 'Неделя', 'ow.fun.month': 'Месяц',
  'ow.fun.s.visits': 'Визиты на сайт', 'ow.fun.s.tours': 'Экскурсии', 'ow.fun.s.regs': 'Регистрации', 'ow.fun.s.pays': 'Оплаты',
  'ow.fun.c.tours': 'Из визита в экскурсию', 'ow.fun.c.regs': 'Из экскурсии в регистрацию', 'ow.fun.c.pays': 'Из регистрации в оплату',
  'ow.fun.convA11y': 'дошли с прошлого шага: {p}', 'ow.fun.insight': 'Из каждых 100 визитов на сайт примерно {n} семьи записываются и платят.', 'ow.fun.scale': 'Полосы в реальном масштабе',
  'ow.auto.eyebrow': 'За кулисами', 'ow.auto.h': 'Система работает за вас', 'ow.auto.lead': 'Девять небольших дел, которые происходят сами, каждый день. Нажмите на карточку и посмотрите, как именно.',
  'ow.auto.active': 'Работают {n} из 9', 'ow.auto.feed': 'Последние запуски',
  'ow.a.last': 'Последний запуск: {when}', 'ow.a.now': 'только что', 'ow.a.min': '{n} мин назад', 'ow.a.off': 'Выключено', 'ow.a.demo': 'Показать',
  'ow.a.offToast': 'Автоматизация выключена. Её можно включить переключателем.', 'ow.a.schemaA11y': 'Запуск: {trig}. Что происходит: {acts}.',
  'ow.st.when': 'Запуск', 'ow.st.log': 'Что происходит', 'ow.st.again': 'Сначала', 'ow.st.close': 'Закрыть',
  'ow.st.done': 'Готово', 'ow.st.doneSub': 'Вам не пришлось ничего делать.',
  'ow.st.parent': 'Родитель', 'ow.st.inHe': 'на иврите', 'ow.st.inRu': 'по-русски', 'ow.st.owner': 'Ваш телефон', 'ow.st.kitchen': 'Планшет кухни', 'ow.st.staff': 'Планшет команды',
  'ow.st.sent': 'отправлено', 'ow.st.tabKitchen': 'Кухня · уведомления', 'ow.st.tabStaff': 'Старшая группа · напоминания', 'ow.st.tabEmpty': 'Новых уведомлений нет',
  'ow.a.lead.t': 'Новая заявка с сайта', 'ow.a.lead.d': 'Родитель сразу получает время экскурсии, а вам приходит уведомление.', 'ow.a.lead.trig': 'Форма на сайте', 'ow.a.lead.act1': 'Время экскурсии', 'ow.a.lead.act2': 'Уведомление вам', 'ow.a.lead.log': 'Заявка с сайта · отправлено время экскурсии',
  'ow.a.visit.t': 'Напоминание об экскурсии', 'ow.a.visit.d': 'Накануне экскурсии родитель получает напоминание, а после неё ссылку на регистрацию.', 'ow.a.visit.trig': 'Экскурсия завтра', 'ow.a.visit.act1': 'Напоминание', 'ow.a.visit.act2': 'Ссылка на регистрацию', 'ow.a.visit.log': 'Напоминание о завтрашней экскурсии',
  'ow.a.seat.t': 'Освободилось место', 'ow.a.seat.d': 'Место сразу предлагается следующей семье из листа ожидания.', 'ow.a.seat.trig': 'Свободное место', 'ow.a.seat.act1': 'Предложение следующей семье', 'ow.a.seat.log': 'Место в младшей группе предложено следующей семье',
  'ow.a.billing.t': 'Ежемесячный счёт', 'ow.a.billing.d': '1-го числа счёт, 5-го мягкое напоминание, а квитанция уходит сама.', 'ow.a.billing.trig': '1-е число', 'ow.a.billing.act1': 'Счёт', 'ow.a.billing.act2': 'Напоминание 5-го', 'ow.a.billing.act3': 'Квитанция', 'ow.a.billing.log': 'Счёт, напоминание и квитанция ушли сами',
  'ow.a.summaries.t': 'Вечерние сводки', 'ow.a.summaries.d': 'В 17:30 каждый родитель получает тёплую сводку дня на своём языке.', 'ow.a.summaries.trig': '17:30', 'ow.a.summaries.act1': 'Сводка каждой семье', 'ow.a.summaries.log': 'Отправлено 38 вечерних сводок',
  'ow.a.shabbat.t': 'Шабатные родители', 'ow.a.shabbat.d': 'В среду родители недели получают напоминание, что принести.', 'ow.a.shabbat.trig': 'Среда', 'ow.a.shabbat.act1': 'Напоминание родителям', 'ow.a.shabbat.log': 'Напоминание шабатным родителям',
  'ow.a.docs.t': 'Не хватает документа', 'ow.a.docs.d': 'Если в папке не хватает документа, родитель получает напоминание со ссылкой на подпись.', 'ow.a.docs.trig': 'Нет документа', 'ow.a.docs.act1': 'Напоминание родителю', 'ow.a.docs.log': 'Напоминание о декларации здоровья',
  'ow.a.birthday.t': 'Завтра день рождения', 'ow.a.birthday.d': 'Накануне команда получает напоминание подготовить маленький праздник.', 'ow.a.birthday.trig': 'Завтра день рождения', 'ow.a.birthday.act1': 'Напоминание команде', 'ow.a.birthday.log': 'Напоминание команде о дне рождения',
  'ow.a.allergies.t': 'Аллергии и меню', 'ow.a.allergies.d': 'Меню недели сверяется с аллергиями детей, и кухня получает предупреждение.', 'ow.a.allergies.trig': 'Меню недели', 'ow.a.allergies.act1': 'Предупреждение кухне', 'ow.a.allergies.log': 'Два совпадения в меню, кухня предупреждена'
};

/* =====================================================================
   DATA (fictional)
   ===================================================================== */
const KPI0 = {
  present: 38, registered: 41,
  arrivals: [['07:00', 5], ['07:30', 9], ['08:00', 11], ['08:30', 7], ['09:00', 4], ['09:30', 2]],
  groups: [{ id: 'baby', p: 75, free: 2 }, { id: 'young', p: 90, free: 1 }, { id: 'big', p: 100, free: 0 }],
  wait: 12, tourDays: [1, 2, 1, 1, 1],
  sources: [{ id: 'site', n: 14, ic: 'globe' }, { id: 'fb', n: 9, ic: 'users' }, { id: 'ru', n: 7, ic: 'translate' }],
  paid: 36, families: 41
};
const FUN = { week: [72, 6, 3, 2], month: [296, 26, 12, 10] };
const STAGES = [['visits', 'globe'], ['tours', 'walk'], ['regs', 'pen'], ['pays', 'card']];
const DAYS = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳'], ru: ['вс', 'пн', 'вт', 'ср', 'чт'] };
const STAFF = [
  { adult: true, skin: 1, hair: 'bun', hc: 1, bg: 1, shirt: '#E8048C' },
  { adult: true, skin: 2, hair: 'long', hc: 0, bg: 0, shirt: '#01AEF2' },
  { adult: true, skin: 0, hair: 'bob', hc: 4, bg: 2, shirt: '#7FC8A9' },
  { adult: true, skin: 3, hair: 'curly', hc: 0, bg: 3, shirt: '#FFB547' },
  { adult: true, skin: 1, hair: 'long', hc: 5, bg: 4, shirt: '#9B8CE8' },
  { adult: true, skin: 4, hair: 'bun', hc: 0, bg: 5, shirt: '#2D2B6B' }
];
const COOK = { adult: true, skin: 2, hair: 'short', hc: 2, bg: 3, shirt: '#F49BB6', glasses: true };
const FAM = [
  { adult: true, skin: 0, hair: 'long', hc: 3, bg: 1, shirt: '#9B8CE8' },
  { adult: true, skin: 2, hair: 'short', hc: 0, bg: 0, shirt: '#2D2B6B', beard: true },
  { adult: true, skin: 1, hair: 'bob', hc: 1, bg: 2, shirt: '#FFB547' }
];
const TINT = { blush: '#F3CFDF', sky: '#D0EDFD', lilac: '#E7E0FB', peach: '#FDE8C8', ink: '#1B1A4B' };
const MSG_TITLE = { he: 'גן סינדרלה', ru: 'Сад «Синдерелла»' };

/* The nine automations. Each `stage` is a little film:
   trig = what fires it · lanes = who receives (parent phone in a language / your phone / a tablet) · steps = the script */
const AUTOS = [
  {
    id: 'lead', icon: 'globe', tint: 'blush', sch: { trig: 'globe', acts: ['chat', 'bell'] },
    last: P('היום 09:14', 'сегодня 09:14'),
    stage: {
      time: 'now',
      trig: { icon: 'globe', t: P('נשלח טופס באתר', 'Заполнена форма на сайте'), v: P('עכשיו', 'сейчас'), sub: P('מרינה · בן שנה וחצי · ברוסית', 'Марина · сыну полтора года · по-русски') },
      lanes: [{ id: 'p', kind: 'parent', lang: 'ru' }, { id: 'o', kind: 'owner' }],
      steps: [
        { t: 'trig', log: P('נכנסה פנייה חדשה מהאתר', 'Пришла новая заявка с сайта') },
        { t: 'go', lanes: ['p'] },
        { t: 'type', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('שלום מרינה! תודה על הפנייה. אפשר לבוא לסיור: ב׳ 09:30, ד׳ 16:00 או ה׳ 10:00. מה נוח לך?', 'Здравствуйте, Марина! Спасибо за заявку. Приглашаем на экскурсию: пн 09:30, ср 16:00 или чт 10:00. Когда вам удобно?'), log: P('ההורה קיבלה מועדים לסיור, ברוסית', 'Родитель получила время экскурсии по-русски') },
        { t: 'reply', lane: 'p', text: P('ד׳ 16:00 מתאים. תודה!', 'Ср 16:00 подходит. Спасибо!'), log: P('מרינה בחרה: ד׳ 16:00', 'Марина выбрала ср 16:00') },
        { t: 'go', lanes: ['o'] },
        { t: 'notify', lane: 'o', title: P('פנייה חדשה מהאתר', 'Новая заявка с сайта'), text: P('מרינה, בן שנה וחצי. בחרה סיור ביום ד׳ 16:00, וזה כבר ביומן.', 'Марина, сыну полтора года. Выбрала экскурсию в ср 16:00, она уже в календаре.'), log: P('התראה נשלחה אלייך', 'Вам пришло уведомление') }
      ]
    }
  },
  {
    id: 'visit', icon: 'calendar', tint: 'sky', sch: { trig: 'calendar', acts: ['bell', 'link'] },
    last: P('היום 08:30', 'сегодня 08:30'),
    stage: {
      time: '18:00',
      trig: { icon: 'calendar', t: P('מחר סיור ב-09:30', 'Завтра экскурсия в 09:30'), v: P('ב׳ 18:00', 'пн 18:00'), sub: P('רותם · בת שנתיים', 'Ротем · дочке 2 года') },
      lanes: [{ id: 'p', kind: 'parent', lang: 'he' }, { id: 'o', kind: 'owner' }],
      steps: [
        { t: 'trig', log: P('ערב לפני הסיור', 'Вечер накануне экскурсии') },
        { t: 'go', lanes: ['p'] },
        { t: 'type', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('היי רותם, מזכירים: מחר ב-09:30 סיור בגן סינדרלה, העצמאות 58, אשדוד. מחכים לך!', 'Ротем, напоминаем: завтра в 09:30 экскурсия в «Синдерелле», ул. ха-Ацмаут 58, Ашдод. Ждём вас!'), log: P('תזכורת נשלחה להורה', 'Родителю ушло напоминание') },
        { t: 'reply', lane: 'p', text: P('נהיה שם. תודה!', 'Будем. Спасибо!') },
        { t: 'phase', tt: P('הסיור הסתיים', 'Экскурсия закончилась'), v: P('ג׳ 10:30', 'вт 10:30'), time: '10:30', log: P('למחרת, אחרי הסיור', 'На следующий день, после экскурсии') },
        { t: 'go', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('היה כיף להכיר! אם מתאים לך, ממשיכים להרשמה כאן:', 'Было приятно познакомиться! Если вам подходит, регистрация здесь:'), link: P('הרשמה לגן', 'Регистрация'), log: P('נשלח קישור להרשמה', 'Ушла ссылка на регистрацию') },
        { t: 'go', lanes: ['o'] },
        { t: 'notify', lane: 'o', title: P('הסיור הסתיים', 'Экскурсия прошла'), text: P('רותם קיבלה קישור להרשמה. נעדכן אותך כשהיא ממלאת.', 'Ротем получила ссылку на регистрацию. Сообщим, когда заполнит.'), log: P('עדכון נשלח אלייך', 'Вам пришло обновление') }
      ]
    }
  },
  {
    id: 'seat', icon: 'sofa', tint: 'lilac', sch: { trig: 'sofa', acts: ['send'] },
    last: P('אתמול 11:20', 'вчера 11:20'),
    stage: {
      time: 'now',
      trig: { icon: 'sofa', t: P('התפנה מקום בצעירים', 'Освободилось место в младшей группе'), v: P('עכשיו', 'сейчас') },
      props: [{ id: 'w1', av: FAM[0], label: P('1 בתור', '№1') }, { id: 'w2', av: FAM[1], label: P('2 בתור', '№2') }, { id: 'w3', av: FAM[2], label: P('3 בתור', '№3') }],
      lanes: [{ id: 'p', kind: 'parent', lang: 'ru' }, { id: 'o', kind: 'owner' }],
      steps: [
        { t: 'trig', log: P('התפנה מקום בקבוצת צעירים', 'Освободилось место в младшей группе') },
        { t: 'scan', ids: ['w3', 'w2', 'w1'], end: { w1: 'pick', w2: '', w3: '' }, log: P('המשפחה הראשונה בתור נבחרה', 'Выбрана первая семья в очереди') },
        { t: 'go', lanes: ['p'] },
        { t: 'type', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('אנה, בשורה טובה! התפנה מקום בקבוצת צעירים. הוא שלך אם תאשרי עד יום חמישי.', 'Анна, хорошая новость! В младшей группе освободилось место. Оно ваше, если подтвердите до четверга.'), log: P('נשלחה הצעה, ברוסית', 'Предложение ушло по-русски') },
        { t: 'reply', lane: 'p', text: P('כן, מאשרים! תודה ענקית!', 'Да, подтверждаем! Огромное спасибо!') },
        { t: 'kpi', key: 'wait', d: -1 },
        { t: 'go', lanes: ['o'] },
        { t: 'notify', lane: 'o', title: P('המקום נתפס', 'Место занято'), text: P('המשפחה הראשונה בתור אישרה. רשימת ההמתנה התעדכנה.', 'Первая семья в очереди подтвердила. Лист ожидания обновлён.'), log: P('רשימת ההמתנה התעדכנה', 'Лист ожидания обновлён') }
      ]
    }
  },
  {
    id: 'billing', icon: 'receipt', tint: 'peach', sch: { trig: 'calendar', acts: ['receipt', 'bell', 'check-circle'] },
    last: P('ב-5 בחודש, 10:00', '5-го числа, 10:00'),
    stage: {
      time: '08:00',
      trig: { icon: 'receipt', t: P('התחיל חודש חדש', 'Начался новый месяц'), v: P('1 בחודש', '1-е число'), sub: P('בלי סכומים בדמו', 'В демо без сумм') },
      props: [{ id: 'b1', icon: 'receipt', label: P('1 בחודש', '1-е') }, { id: 'b5', icon: 'bell', label: P('5 בחודש', '5-е') }, { id: 'bp', icon: 'check-circle', label: P('שולם', 'Оплачено') }],
      lanes: [{ id: 'p', kind: 'parent', lang: 'he' }, { id: 'o', kind: 'owner' }],
      steps: [
        { t: 'trig' },
        { t: 'prop', id: 'b1', s: 'on', log: P('1 בחודש · יוצאים חשבונות', '1-е число · уходят счета') },
        { t: 'go', lanes: ['p'] },
        { t: 'type', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('בוקר טוב מיכל! החשבון של החודש מחכה לך באזור האישי.', 'Доброе утро, Михаль! Счёт за месяц ждёт вас в личном кабинете.'), link: P('לתשלום', 'Оплатить'), log: P('החשבון נשלח', 'Счёт отправлен') },
        { t: 'phase', v: P('5 בחודש', '5-е число'), time: '10:00', prop: ['b1', 'done', 'b5', 'on'], log: P('5 בחודש · החשבון עוד פתוח', '5-е число · счёт ещё открыт') },
        { t: 'go', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('תזכורת קטנה: החשבון של החודש עדיין פתוח. אם כבר שילמת, אפשר להתעלם.', 'Небольшое напоминание: счёт за месяц ещё открыт. Если уже оплатили, просто не обращайте внимания.'), log: P('יצאה תזכורת עדינה', 'Ушло мягкое напоминание') },
        { t: 'reply', lane: 'p', text: P('שילמתי עכשיו, תודה!', 'Оплатила, спасибо!') },
        { t: 'phase', tt: P('התשלום התקבל', 'Оплата получена'), v: P('5 בחודש', '5-е число'), time: '10:04', prop: ['b5', 'done', 'bp', 'ok'] },
        { t: 'go', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('התשלום התקבל, תודה! הקבלה כבר באזור האישי.', 'Оплата получена, спасибо! Квитанция уже в личном кабинете.'), link: P('קבלה', 'Квитанция'), log: P('הקבלה יצאה לבד', 'Квитанция ушла сама') },
        { t: 'kpi', key: 'paid', d: 1 },
        { t: 'go', lanes: ['o'] },
        { t: 'notify', lane: 'o', title: P('תשלום התקבל', 'Оплата получена'), text: P('מיכל שילמה. הקבלה נשלחה אליה אוטומטית.', 'Михаль оплатила. Квитанция отправлена ей автоматически.') }
      ]
    }
  },
  {
    id: 'summaries', icon: 'chat-text', tint: 'ink', sch: { trig: 'clock', acts: ['chat-text'] },
    last: P('אתמול 17:30', 'вчера 17:30'),
    stage: {
      time: '17:30',
      trig: { icon: 'clock', t: P('סוף היום בגן', 'Конец дня в саду'), v: P('17:30', '17:30'), sub: P('נכתב מהסימונים של הצוות', 'Собрано из отметок воспитателей'), counter: 38 },
      lanes: [{ id: 'a', kind: 'parent', lang: 'he' }, { id: 'b', kind: 'parent', lang: 'ru' }],
      steps: [
        { t: 'trig', log: P('17:30 · כל סיכום נכתב מהסימונים של היום', '17:30 · каждая сводка собирается из отметок за день') },
        { t: 'go', lanes: ['a', 'b'], count: 38 },
        { t: 'type', lanes: ['a', 'b'], ms: 650 },
        { t: 'msg', lane: 'a', text: P('ערב טוב! נועה אכלה הכל בצהריים, ישנה 12:30–14:10 ונהנתה מאוד בחוג מוזיקה.', 'Добрый вечер! Ноа съела весь обед, спала с 12:30 до 14:10 и с удовольствием пела на музыке.'), ms: 300 },
        { t: 'msg', lane: 'b', text: P('ערב טוב! דניאל אכל יפה בצהריים, ישן 12:40–14:20 ובנה בחצר טירה מחול.', 'Добрый вечер! Даниэль хорошо пообедал, спал с 12:40 до 14:20 и строил во дворе замок из песка.'), log: P('38 סיכומים יצאו: 27 בעברית, 11 ברוסית', 'Ушло 38 сводок: 27 на иврите, 11 по-русски') }
      ]
    }
  },
  {
    id: 'shabbat', icon: 'candle', tint: 'peach', sch: { trig: 'calendar', acts: ['bell'] },
    last: P('ביום ד׳, 10:00', 'в ср, 10:00'),
    stage: {
      time: '10:00',
      trig: { icon: 'candle', t: P('קבלת שבת ביום שישי', 'Встреча шабата в пятницу'), v: P('ד׳ 10:00', 'ср 10:00'), sub: P('השבוע: ההורים של מאיה', 'На этой неделе: родители Майи') },
      lanes: [{ id: 'p', kind: 'parent', lang: 'ru' }, { id: 'o', kind: 'owner' }],
      steps: [
        { t: 'trig', log: P('יום רביעי · מי הורי השבת?', 'Среда · кто шабатные родители?') },
        { t: 'go', lanes: ['p'] },
        { t: 'type', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('אירינה, השבוע אתם הורי השבת! ביום שישי מביאים חלה ומיץ ענבים. תודה!', 'Ирина, на этой неделе вы шабатные родители! В пятницу принесите, пожалуйста, халу и виноградный сок.'), log: P('תזכורת נשלחה, ברוסית', 'Напоминание ушло по-русски') },
        { t: 'reply', lane: 'p', text: P('בשמחה! מאיה כבר מחכה.', 'С радостью! Майя уже ждёт.') },
        { t: 'go', lanes: ['o'] },
        { t: 'notify', lane: 'o', title: P('הורי שבת', 'Шабатные родители'), text: P('ההורים של מאיה אישרו: חלה ומיץ ענבים ביום שישי.', 'Родители Майи подтвердили: хала и сок в пятницу.'), log: P('ההורים אישרו', 'Родители подтвердили') }
      ]
    }
  },
  {
    id: 'docs', icon: 'doc', tint: 'lilac', sch: { trig: 'doc', acts: ['pen'] },
    last: P('היום 07:40', 'сегодня 07:40'),
    stage: {
      time: '07:40',
      trig: { kid: 'itai', t: P('בדיקת התיק של איתי', 'Проверка папки Итая'), v: P('07:40', '07:40') },
      props: [{ id: 'd1', icon: 'heart', label: P('הצהרת בריאות', 'Здоровье') }, { id: 'd2', icon: 'camera', label: P('אישור צילום', 'Фото') }, { id: 'd3', icon: 'pen', label: P('טופס הרשמה', 'Анкета') }],
      lanes: [{ id: 'p', kind: 'parent', lang: 'he' }, { id: 'o', kind: 'owner' }],
      steps: [
        { t: 'trig' },
        { t: 'scan', ids: ['d3', 'd2', 'd1'], end: { d1: 'hit', d2: 'ok', d3: 'ok' }, log: P('חסרה הצהרת בריאות', 'Не хватает декларации здоровья') },
        { t: 'go', lanes: ['p'] },
        { t: 'type', lanes: ['p'] },
        { t: 'msg', lane: 'p', text: P('בוקר טוב! חסרה לנו הצהרת בריאות של איתי. חותמים באצבע, זה לוקח דקה.', 'Доброе утро! Нам не хватает декларации здоровья Итая. Подписать можно пальцем, это минута.'), link: P('לחתימה', 'Подписать'), log: P('נשלחה תזכורת עם קישור לחתימה', 'Ушло напоминание со ссылкой на подпись') },
        { t: 'reply', lane: 'p', text: P('חתמתי!', 'Подписала!') },
        { t: 'prop', id: 'd1', s: 'ok' },
        { t: 'go', lanes: ['o'] },
        { t: 'notify', lane: 'o', title: P('התיק של איתי מלא', 'Папка Итая собрана'), text: P('הצהרת הבריאות נחתמה. כל המסמכים אצלך.', 'Декларация подписана. Все документы у вас.'), log: P('כל המסמכים התקבלו', 'Все документы получены') }
      ]
    }
  },
  {
    id: 'birthday', icon: 'cake', tint: 'blush', sch: { trig: 'cake', acts: ['tablet'] },
    last: P('אתמול 16:00', 'вчера 16:00'),
    stage: {
      time: '16:00',
      trig: { kid: 'eitan', t: P('מחר איתן חוגג 3', 'Завтра Эйтану 3 года'), v: P('16:00', '16:00'), sub: P('קבוצת בוגרים', 'Старшая группа') },
      lanes: [{ id: 's', kind: 'tablet', role: 'staff' }, { id: 'o', kind: 'owner' }],
      steps: [
        { t: 'trig', log: P('מחר יום הולדת בבוגרים', 'Завтра день рождения в старшей группе') },
        { t: 'go', lanes: ['s'] },
        { t: 'tab', lane: 's', icon: 'cake', tone: 'pink', kid: 'eitan', title: P('מחר יום הולדת לאיתן', 'Завтра день рождения Эйтана'), text: P('כדאי להכין כתר ושיר לבוקר.', 'Подготовьте корону и песню на утро.'), log: P('תזכורת הופיעה בטאבלט של הצוות', 'Напоминание появилось на планшете команды') },
        { t: 'go', lanes: ['o'] },
        { t: 'notify', lane: 'o', title: P('יום הולדת מחר', 'Завтра день рождения'), text: P('איתן חוגג 3. הצוות קיבל תזכורת.', 'Эйтану 3 года. Команда получила напоминание.'), log: P('עדכון נשלח אלייך', 'Вам пришло обновление') }
      ]
    }
  },
  {
    id: 'allergies', icon: 'plate', tint: 'peach', sch: { trig: 'list', acts: ['chef'] },
    last: P('ביום א׳, 06:30', 'в вс, 06:30'),
    stage: {
      time: '06:30',
      trig: { icon: 'plate', t: P('בדיקת תפריט השבוע', 'Проверка меню недели'), v: P('א׳ 06:30', 'вс 06:30') },
      props: [
        { id: 'm1', label: P('א׳', 'вс'), sub: P('פסטה', 'паста') },
        { id: 'm2', label: P('ב׳', 'пн'), sub: P('עוף', 'курица') },
        { id: 'm3', label: P('ג׳', 'вт'), sub: P('בוטנים', 'арахис'), kid: 'itai' },
        { id: 'm4', label: P('ד׳', 'ср'), sub: P('אורז', 'рис') },
        { id: 'm5', label: P('ה׳', 'чт'), sub: P('טחינה', 'тхина'), kid: 'tamar' }
      ],
      lanes: [{ id: 'k', kind: 'tablet', role: 'kitchen' }, { id: 'o', kind: 'owner' }],
      steps: [
        { t: 'trig', log: P('התפריט נבדק מול האלרגיות של כל הילדים', 'Меню сверяется с аллергиями всех детей') },
        { t: 'scan', ids: ['m1', 'm2', 'm3', 'm4', 'm5'], end: { m1: 'ok', m2: 'ok', m3: 'hit', m4: 'ok', m5: 'hit' }, log: P('שתי התאמות: איתי (בוטנים), תמר (שומשום)', 'Два совпадения: Итай (арахис), Тамар (кунжут)') },
        { t: 'go', lanes: ['k'] },
        { t: 'tab', lane: 'k', icon: 'alert', tone: 'warn', kid: 'itai', title: P('ג׳ · מנחה: חטיף בוטנים', 'Вт · полдник: арахисовые палочки'), text: P('לאיתי אלרגיה לבוטנים. להכין לו חלופה.', 'У Итая аллергия на арахис. Приготовьте замену.'), ms: 700 },
        { t: 'tab', lane: 'k', icon: 'alert', tone: 'warn', kid: 'tamar', title: P('ה׳ · צהריים: ממרח טחינה', 'Чт · обед: тхина'), text: P('לתמר אלרגיה לשומשום. להכין לה חלופה.', 'У Тамар аллергия на кунжут. Приготовьте замену.'), log: P('המטבח קיבל שתי התראות', 'Кухня получила два предупреждения') },
        { t: 'go', lanes: ['o'] },
        { t: 'notify', lane: 'o', title: P('תפריט השבוע נבדק', 'Меню недели проверено'), text: P('שתי התאמות לאלרגיות. המטבח כבר מכין חלופות.', 'Два совпадения с аллергиями. Кухня уже готовит замену.') }
      ]
    }
  }
];
const BY = Object.fromEntries(AUTOS.map(a => [a.id, a]));
const FEED0 = [
  { id: 'lead', when: P('09:14', '09:14') },
  { id: 'visit', when: P('08:30', '08:30') },
  { id: 'docs', when: P('07:40', '07:40') },
  { id: 'summaries', when: P('אתמול 17:30', 'вчера 17:30') },
  { id: 'birthday', when: P('אתמול 16:00', 'вчера 16:00') },
  { id: 'allergies', when: P('א׳ 06:30', 'вс 06:30') }
];

/* =====================================================================
   STATE
   ===================================================================== */
let root = null;
const S = {
  kpi: null, period: 'week', on: {}, last: {}, feed: [], speed: 1,
  clock: 0, funIO: null, autoIO: null, active: false, funDone: false, introT: 0, fresh: null
};
function freshState() {
  S.kpi = JSON.parse(JSON.stringify(KPI0));
  S.period = 'week';
  AUTOS.forEach(a => { S.on[a.id] = true; S.last[a.id] = null; });
  S.feed = FEED0.map(x => Object.assign({}, x));
}

/* =====================================================================
   HERO · greeting, date, calm status, day dial
   ===================================================================== */
const hoursFor = d => (d.getDay() === 6 ? null : d.getDay() === 5 ? [7, 13] : [7, 17]);
const hh = n => String(n).padStart(2, '0') + ':00';
function renderHero() {
  if (!root) return;
  const now = new Date(), hr = now.getHours() + now.getMinutes() / 60;
  const g = hr >= 5 && hr < 12 ? 'morning' : hr >= 12 && hr < 17 ? 'noon' : hr >= 17 && hr < 22 ? 'eve' : 'night';
  $('[data-ow-greet]', root).textContent = t('ow.greet.' + g) + ',';
  $('[data-ow-date]', root).textContent = App.fmt.date(now, { weekday: 'long', day: 'numeric', month: 'long' });
  const hrs = hoursFor(now), open = !!hrs && hr >= hrs[0] && hr < hrs[1];
  const status = open ? t('ow.status.open', { n: num(S.kpi.present) }) : !hrs ? t('ow.status.weekend') : hr < hrs[0] ? t('ow.status.early') : t('ow.status.closed');
  $('[data-ow-status]', root).textContent = status;
  $('[data-ow-statusline]', root).classList.toggle('is-closed', !open);
  // dial: the day as a ring, from opening to closing time (Cinderella's clock, minus the midnight drama)
  const span = hrs || [7, 17];
  const frac = hrs ? App.clamp((hr - span[0]) / (span[1] - span[0]), 0, 1) : 0;
  const C = 2 * Math.PI * 40, n = span[1] - span[0];
  const ticks = Array.from({ length: n }, (_, i) => `<line x1="50" y1="3.5" x2="50" y2="${i % 2 ? 6.5 : 8}" transform="rotate(${(i / n) * 360} 50 50)"/>`).join('');
  const hrsTxt = hrs ? `${hh(span[0])}–${hh(span[1])}` : t('ow.dial.sat');
  const state = open ? t('ow.dial.open') : t('ow.dial.closed');
  const dial = $('[data-ow-dial]', root);
  dial.setAttribute('role', 'img');
  dial.setAttribute('aria-label', t('ow.dial.a11y', { hrs: hrsTxt, now: App.fmt.time(now), state }));
  dial.classList.toggle('is-open', open);
  dial.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle class="ow-dial__face" cx="50" cy="50" r="49"/>
      <g class="ow-dial__ticks">${ticks}</g>
      <circle class="ow-dial__tr" cx="50" cy="50" r="40"/>
      <circle class="ow-dial__fg" cx="50" cy="50" r="40" transform="rotate(-90 50 50)" style="stroke-dasharray:${C.toFixed(2)};stroke-dashoffset:${(C * (1 - frac)).toFixed(2)}"/>
      <g transform="rotate(${(frac * 360).toFixed(1)} 50 50)"><circle class="ow-dial__dot" cx="50" cy="10" r="6.5"/><use href="#i-sparkle" class="ow-dial__mk" x="44.5" y="4.5" width="11" height="11"/></g>
    </svg>
    <span class="ow-dial__c"><b class="tnum">${App.fmt.time(now)}</b><span>${esc(state)}</span></span>
    <span class="ow-dial__hrs tnum">${esc(hrsTxt)}</span>`;
}

/* =====================================================================
   KPI BENTO
   ===================================================================== */
const CU = (n, cls = '') => `<span class="${cls}" data-ow-cu="${n}">${num(n)}</span>`;
function kHead(icn, key, pill) {
  return `<div class="ow-k__head"><span class="ow-k__ic">${ic(icn)}</span><h3 class="ow-k__label">${esc(t(key))}</h3>${pill || ''}</div>`;
}
function ringSvg(p, i) {
  const C = 2 * Math.PI * 30;
  return `<svg viewBox="0 0 76 76" aria-hidden="true" focusable="false"><circle class="ow-ring__tr" cx="38" cy="38" r="30"/><circle class="ow-ring__fg" cx="38" cy="38" r="30" transform="rotate(-90 38 38)" style="--ow-c:${C.toFixed(2)};--ow-off:${(C * (1 - p / 100)).toFixed(2)};--ow-i:${i}"/></svg>`;
}
function payRing() {
  const k = S.kpi, C = 2 * Math.PI * 30, gap = 3;
  const a = (k.paid / k.families) * C, b = C - a;
  return `<svg viewBox="0 0 76 76" aria-hidden="true" focusable="false" class="ow-pay__svg">
    <circle class="ow-pay__a" cx="38" cy="38" r="30" transform="rotate(-90 38 38)" style="stroke-dasharray:${(a - gap).toFixed(2)} ${C.toFixed(2)};stroke-dashoffset:${(-gap / 2).toFixed(2)}"/>
    <circle class="ow-pay__b" cx="38" cy="38" r="30" transform="rotate(-90 38 38)" style="stroke-dasharray:${Math.max(0, b - gap).toFixed(2)} ${C.toFixed(2)};stroke-dashoffset:${(-(a + gap / 2)).toFixed(2)}"/></svg>`;
}
function renderBento() {
  const k = S.kpi, el = $('[data-ow-bento]', root); if (!el) return;
  const maxA = Math.max(...k.arrivals.map(x => x[1]));
  const att = Math.round((k.present / k.registered) * 100) + '%';
  const groupName = id => L(App.data.groups.find(g => g.id === id));
  const gNote = g => (g.p >= 100 ? t('ow.k.full') : g.free === 1 ? t('ow.k.last') : t('ow.k.free', { n: g.free }));
  const freeTotal = k.groups.reduce((s, g) => s + g.free, 0);
  const pend = k.families - k.paid;
  const tourTotal = k.tourDays.reduce((s, n) => s + n, 0);
  const today = new Date().getDay(); // 0 = Sunday
  const maxS = Math.max(...k.sources.map(s => s.n));
  const srcTotal = k.sources.reduce((s, x) => s + x.n, 0);
  const days = DAYS[lang()] || DAYS.he;
  el.innerHTML = `
  <article class="ow-card ow-k ow-k--kids" data-ow-kpi="kids" style="--ow-n:0">
    ${kHead('users', 'ow.k.kids', `<span class="tag tag--ok ow-k__pill">${ic('check-circle')}${esc(t('ow.k.kidsPill', { p: att }))}</span>`)}
    <p class="ow-big">${CU(k.present, 'ow-big__n')}<span class="ow-big__of">/${num(k.registered)}</span></p>
    <p class="ow-k__sub">${esc(t('ow.k.kidsSub', { n: num(k.registered), m: num(k.registered - k.present) }))}</p>
    <figure class="ow-arr" role="img" aria-label="${esc(t('ow.k.arrA11y', { list: k.arrivals.map(a => `${a[0]} ${a[1]}`).join(', ') }))}">
      <figcaption class="ow-k__cap" aria-hidden="true">${esc(t('ow.k.arr'))}</figcaption>
      <div class="ow-arr__plot" aria-hidden="true">${k.arrivals.map((a, i) => `<div class="ow-arr__col ${a[1] === maxA ? 'is-peak' : ''}" style="--ow-h:${(a[1] / maxA).toFixed(3)};--ow-i:${i}"><span class="ow-arr__zone"><span class="ow-arr__v tnum">${a[1]}</span><i class="ow-arr__bar"></i></span><span class="ow-arr__t tnum">${a[0]}</span></div>`).join('')}</div>
    </figure>
  </article>
  <article class="ow-card ow-k ow-k--groups" data-ow-kpi="groups" style="--ow-n:1">
    ${kHead('castle', 'ow.k.groups', `<span class="tag ow-k__pill">${esc(t('ow.k.groupsPill', { n: freeTotal }))}</span>`)}
    <div class="ow-rings">${k.groups.map((g, i) => `<figure class="ow-ring" role="img" aria-label="${esc(t('ow.k.ringA11y', { g: groupName(g.id), p: g.p + '%', note: gNote(g) }))}">
      <span class="ow-ring__art" aria-hidden="true">${ringSvg(g.p, i)}<span class="ow-ring__v">${CU(g.p)}<small>%</small></span></span>
      <figcaption aria-hidden="true"><b>${esc(groupName(g.id))}</b><span class="ow-ring__note ${g.p >= 100 ? 'is-full' : ''}">${esc(gNote(g))}</span></figcaption></figure>`).join('')}</div>
  </article>
  <article class="ow-card ow-k ow-k--wait" data-ow-kpi="wait" style="--ow-n:2">
    ${kHead('hourglass', 'ow.k.wait', `<span class="tag tag--pink ow-k__pill">${esc(t('ow.k.waitPill'))}</span>`)}
    <p class="ow-big" role="img" aria-label="${esc(t('ow.k.waitA11y', { n: k.wait }))}"><span aria-hidden="true">${CU(k.wait, 'ow-big__n')}<span class="ow-big__unit">${esc(t('ow.k.waitUnit'))}</span></span></p>
    <div class="ow-dots" aria-hidden="true">${Array.from({ length: k.wait }, (_, i) => `<i style="--ow-i:${i}" class="${i === 0 ? 'is-next' : ''}"></i>`).join('')}</div>
    <p class="ow-k__sub">${esc(t('ow.k.waitHint'))}</p>
    <button type="button" class="ow-k__link" data-ow-play="seat">${ic('play', 'ic--fill')}<span>${esc(t('ow.k.waitHow'))}</span></button>
  </article>
  <article class="ow-card ow-k ow-k--tours" data-ow-kpi="tours" style="--ow-n:3">
    ${kHead('walk', 'ow.k.tours')}
    <p class="ow-big">${CU(tourTotal, 'ow-big__n')}</p>
    <div class="ow-week" role="img" aria-label="${esc(t('ow.k.weekA11y', { list: k.tourDays.map((n, i) => `${days[i]} ${n}`).join(', ') }))}">${k.tourDays.map((n, i) => `<span class="ow-week__d ${i < today ? 'is-past' : ''} ${i === today ? 'is-today' : ''} ${i === today + 1 ? 'is-next' : ''}" aria-hidden="true"><span class="ow-week__dots">${Array.from({ length: n }, (_, j) => `<i style="--ow-i:${i * 2 + j}"></i>`).join('')}</span><span class="ow-week__l">${esc(days[i])}</span></span>`).join('')}</div>
    <p class="ow-next">${ic('clock')}<span>${esc(t('ow.k.toursNext'))}: <b>${esc(t('ow.k.toursWhen'))}</b></span></p>
  </article>
  <article class="ow-card ow-k ow-k--src" data-ow-kpi="src" style="--ow-n:4">
    ${kHead('trend', 'ow.k.src', `<span class="tag ow-k__pill">${esc(t('ow.k.srcPill', { n: srcTotal }))}</span>`)}
    <ul class="ow-src">${k.sources.map((s, i) => `<li class="ow-src__it"><span class="ow-src__row"><span class="ow-src__ic">${ic(s.ic)}</span><span class="ow-src__n">${esc(t('ow.k.src.' + s.id))}</span>${CU(s.n, 'ow-src__v')}</span><span class="ow-src__track" aria-hidden="true"><i style="--ow-w:${(s.n / maxS).toFixed(3)};--ow-i:${i}"></i></span></li>`).join('')}</ul>
  </article>
  <article class="ow-card ow-k ow-k--pay" data-ow-kpi="pay" style="--ow-n:5">
    ${kHead('card', 'ow.k.pay', `<span class="tag tag--warn ow-k__pill" data-ow-paypill>${esc(t('ow.k.payPill', { n: pend }))}</span>`)}
    <div class="ow-pay" role="img" aria-label="${esc(t('ow.k.payA11y', { a: k.paid, b: pend }))}"><span class="ow-pay__art" aria-hidden="true">${payRing()}<span class="ow-pay__c">${CU(k.paid, 'ow-pay__n')}<small>/${num(k.families)}</small></span></span>
      <ul class="ow-legend" aria-hidden="true"><li><i class="is-a"></i><span>${esc(t('ow.k.paid'))}</span><b class="tnum">${num(k.paid)}</b></li><li><i class="is-b"></i><span>${esc(t('ow.k.pending'))}</span><b class="tnum">${num(pend)}</b></li></ul></div>
  </article>
  <article class="ow-card ow-k ow-k--shift" data-ow-kpi="shift" style="--ow-n:6">
    ${kHead('users', 'ow.k.shift', `<span class="tag tag--ok ow-k__pill">${ic('check')}${esc(t('ow.k.shiftPill'))}</span>`)}
    <ul class="ow-shift">
      <li role="img" aria-label="${esc(t('ow.k.shiftA11y', { role: t('ow.k.role.carers'), n: 6, m: 6 }))}"><span class="ow-shift__top" aria-hidden="true"><span>${esc(t('ow.k.role.carers'))}</span><b class="tnum">6/6</b></span><span class="ow-avs" aria-hidden="true">${STAFF.map((s, i) => `<span class="av" style="--s:30px;--ow-i:${i}">${App.avatar(s, { label: '' })}</span>`).join('')}</span></li>
      <li role="img" aria-label="${esc(t('ow.k.shiftA11y', { role: t('ow.k.role.kitchen'), n: 1, m: 1 }))}"><span class="ow-shift__top" aria-hidden="true"><span>${esc(t('ow.k.role.kitchen'))}</span><b class="tnum">1/1</b></span><span class="ow-avs" aria-hidden="true"><span class="av" style="--s:30px;--ow-i:6">${App.avatar(COOK, { label: '' })}</span><span class="ow-avs__badge">${ic('chef')}</span></span></li>
    </ul>
  </article>`;
}
function introKpis() {
  const el = $('[data-ow-bento]', root); if (!el) return;
  clearTimeout(S.introT);
  el.classList.remove('is-on'); reflow(el);
  const go = () => {
    el.classList.add('is-on');
    $$('[data-ow-cu]', el).forEach(c => App.countUp(c, +c.dataset.owCu, { duration: 1150 }));
  };
  if (reduced()) go(); else S.introT = setTimeout(go, 60);
}
function kpiBump(key, d) {
  const k = S.kpi;
  if (key === 'wait') k.wait = Math.max(0, k.wait + d);
  if (key === 'paid') k.paid = Math.min(k.families, k.paid + d);
  renderBento();
  const card = $(`[data-ow-kpi="${key === 'paid' ? 'pay' : key}"]`, root);
  if (card) { card.classList.remove('is-bump'); reflow(card); card.classList.add('is-bump'); }
}

/* =====================================================================
   FUNNEL
   ===================================================================== */
function renderFunnel() {
  const v = FUN[S.period], max = v[0];
  const list = $('[data-ow-stages]', root), side = $('[data-ow-fside]', root); if (!list) return;
  const conv = i => Math.round((v[i] / v[i - 1]) * 100);
  list.innerHTML = STAGES.map(([k, icn], i) => {
    const w = v[i] / max, pw = i ? v[i - 1] / max : 0;
    const pour = i ? `<div class="ow-fs__pour" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false"><path d="M${(50 - pw * 50).toFixed(2)} 0L${(50 + pw * 50).toFixed(2)} 0L${(50 + w * 50).toFixed(2)} 100L${(50 - w * 50).toFixed(2)} 100Z" fill="url(#ow-pourg)"/></svg><i class="ow-drop"></i><i class="ow-drop"></i><i class="ow-drop"></i></div>
      <span class="ow-fs__conv" aria-hidden="true">${ic('chevron-down')}<span class="tnum">${conv(i)}%</span></span>` : '';
    return `<li class="ow-fs__st" style="--ow-w:${w.toFixed(4)};--ow-i:${i}">
      ${pour}
      <div class="ow-fs__row"><span class="ow-fs__ic" aria-hidden="true">${ic(icn)}</span><span class="ow-fs__name">${esc(t('ow.fun.s.' + k))}</span><b class="ow-fs__v" data-ow-cu="${v[i]}">${num(v[i])}</b></div>
      <div class="ow-fs__track" aria-hidden="true"><i class="ow-fs__bar"></i></div>
      ${i ? `<span class="sr-only">${esc(t('ow.fun.convA11y', { p: conv(i) + '%' }))}</span>` : ''}
    </li>`;
  }).join('');
  const per100 = Math.max(1, Math.round((v[3] / v[0]) * 100));
  side.innerHTML = `<ul class="ow-conv">${STAGES.slice(1).map(([k], j) => { const i = j + 1, p = conv(i); return `<li><span class="ow-conv__l">${esc(t('ow.fun.c.' + k))}</span><b class="tnum">${p}%</b><span class="ow-conv__bar" aria-hidden="true"><i style="--ow-w:${(p / 100).toFixed(3)};--ow-i:${i}"></i></span></li>`; }).join('')}</ul>
    <p class="ow-insight">${ic('sparkles', 'ic--fill')}<span>${esc(t('ow.fun.insight', { n: per100 }))}</span></p>
    <p class="ow-scale">${esc(t('ow.fun.scale'))}</p>`;
  $$('[data-ow-period]', root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.owPeriod === S.period)));
}
function introFunnel() {
  const card = $('.ow-fun', root); if (!card) return;
  card.classList.remove('is-on'); reflow(card);
  card.classList.add('is-on');
  $$('[data-ow-cu]', card).forEach((c, i) => App.countUp(c, +c.dataset.owCu, { duration: 900 + i * 120 }));
}
function setPeriod(p) {
  if (p === S.period) return;
  S.period = p; renderFunnel(); introFunnel(); App.haptic(8);
}

/* =====================================================================
   AUTOMATION CARDS + ACTIVITY FEED
   ===================================================================== */
function relTime(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  return m < 1 ? t('ow.a.now') : t('ow.a.min', { n: m });
}
const lastText = id => t('ow.a.last', { when: S.last[id] ? relTime(S.last[id]) : L(BY[id].last) });
function schemaHtml(a) {
  const n = a.sch.acts.length;
  const acts = a.sch.acts.map((_, k) => t(`ow.a.${a.id}.act${k + 1}`));
  const ys = a.sch.acts.map((_, k) => ((k + .5) / n) * 100);
  const paths = ys.map(y => `<path d="M0 50C20 50 20 ${y} 40 ${y}"/>`).join('');
  return `<div class="ow-sch" data-n="${n}" role="img" aria-label="${esc(t('ow.a.schemaA11y', { trig: t(`ow.a.${a.id}.trig`), acts: acts.join(', ') }))}">
    <span class="ow-sch__trig" aria-hidden="true">${ic(a.sch.trig)}<span>${esc(t(`ow.a.${a.id}.trig`))}</span></span>
    <svg class="ow-sch__wire" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${paths}</svg>
    <span class="ow-sch__acts" aria-hidden="true">${a.sch.acts.map((x, k) => `<span class="ow-sch__act">${ic(x)}<span>${esc(acts[k])}</span></span>`).join('')}</span>
  </div>`;
}
function cardHtml(a, i) {
  const on = S.on[a.id];
  return `<article class="ow-a ${on ? '' : 'is-off'} ${S.cardsIn ? 'is-in' : ''}" data-ow-a="${a.id}" data-reveal style="--ow-tint:${TINT[a.tint]};--d:${(i % 3) * 70}ms">
    <div class="ow-a__top">
      <span class="ow-a__ic ${a.tint === 'ink' ? 'is-ink' : ''}" aria-hidden="true">${ic(a.icon)}</span>
      <h3 class="ow-a__t" id="ow-a-${a.id}-t">${esc(t(`ow.a.${a.id}.t`))}</h3>
      <button type="button" class="switch ow-sw" role="switch" aria-checked="${on}" aria-labelledby="ow-a-${a.id}-t" data-ow-sw="${a.id}"></button>
    </div>
    <p class="ow-a__d">${esc(t(`ow.a.${a.id}.d`))}</p>
    ${schemaHtml(a)}
    <div class="ow-a__foot">
      <span class="ow-a__last">${ic('clock')}<span data-ow-last>${esc(lastText(a.id))}</span></span>
      <span class="ow-a__off">${ic('pause')}<span>${esc(t('ow.a.off'))}</span></span>
      <button type="button" class="ow-a__play" data-ow-play="${a.id}" aria-describedby="ow-a-${a.id}-t">${ic('play', 'ic--fill')}<span>${esc(t('ow.a.demo'))}</span></button>
    </div>
  </article>`;
}
function renderGrid() {
  const g = $('[data-ow-grid]', root); if (!g) return;
  g.innerHTML = AUTOS.map(cardHtml).join('');
  if (!S.cardsIn) App.reveal(g);
  updActive();
}
function updActive() {
  const n = AUTOS.filter(a => S.on[a.id]).length;
  const el = $('[data-ow-active]', root); if (el) el.textContent = t('ow.auto.active', { n });
  const c = $('.ow-auto__count', root); if (c) c.classList.toggle('is-partial', n < 9);
}
function updLastRuns() {
  $$('[data-ow-a]', root).forEach(c => { const l = $('[data-ow-last]', c); if (l) l.textContent = lastText(c.dataset.owA); });
}
function renderFeed() {
  const f = $('[data-ow-feed]', root); if (!f) return;
  f.innerHTML = S.feed.map(x => `<li class="ow-feed__it ${x.isNew ? 'is-new' : ''}"><span class="ow-feed__ic" aria-hidden="true">${ic(BY[x.id].icon)}</span><span class="ow-feed__m"><b>${esc(t(`ow.a.${x.id}.log`))}</b><span class="tnum">${esc(x.ts ? relTime(x.ts) : L(x.when))}</span></span></li>`).join('');
  S.feed.forEach(x => { x.isNew = false; });
}
function toggle(id) {
  S.on[id] = !S.on[id];
  const card = $(`[data-ow-a="${id}"]`, root); if (!card) return;
  const sw = $('[data-ow-sw]', card);
  sw.setAttribute('aria-checked', String(S.on[id]));
  card.classList.toggle('is-off', !S.on[id]);
  updActive(); App.haptic(10);
  if (S.on[id]) App.fx.burstAt(sw, { count: 10, speed: [60, 170], size: [6, 14], life: [350, 700], gravity: 60, colors: ['magenta', 'gold', 'white'] });
}
function offNudge(id) {
  App.ui.toast({ he: HE['ow.a.offToast'], ru: RU['ow.a.offToast'] }, { icon: 'info' });
  const sw = $(`[data-ow-a="${id}"] [data-ow-sw]`, root);
  if (sw) { sw.classList.remove('is-nudge'); reflow(sw); sw.classList.add('is-nudge'); }
}

/* =====================================================================
   PLAYER · each automation as a short film
   trigger lights → a token runs along the wire → lane lights → device receives
   ===================================================================== */
const PL = { s: null, ctrl: null, run: null, finished: false, a: null };
function trigHtml(st) {
  const tr = st.trig;
  const art = tr.kid ? App.avatar(App.data.kid(tr.kid), { label: '' }) : ic(tr.icon);
  const prop = p => `<li class="ow-prop" data-p="${p.id}">
      <span class="ow-prop__ic">${p.av ? App.avatar(p.av, { label: '' }) : p.icon ? ic(p.icon) : ic('plate')}</span>
      <span class="ow-prop__l">${esc(L(p.label))}</span>${p.sub ? `<span class="ow-prop__s">${esc(L(p.sub))}</span>` : ''}
      ${p.kid ? `<span class="ow-prop__kid">${App.avatar(App.data.kid(p.kid), { label: '' })}</span>` : ''}
      <span class="ow-prop__st">${ic('check')}</span></li>`;
  return `<div class="ow-trig" data-ow-trig>
    <div class="ow-trig__row">
      <span class="ow-trig__ic ${tr.kid ? 'is-av' : ''}" aria-hidden="true">${art}</span>
      <span class="ow-trig__main"><span class="ow-trig__k">${ic('bolt')}${esc(t('ow.st.when'))}</span><b class="ow-trig__t" data-ow-tt>${esc(L(tr.t))}</b>${tr.sub ? `<span class="ow-trig__sub">${esc(L(tr.sub))}</span>` : ''}</span>
      <span class="ow-trig__side">
        <span class="ow-trig__v tnum" data-ow-tv>${esc(L(tr.v))}</span>
        ${tr.counter ? `<span class="ow-trig__count"><b class="tnum" data-ow-cnt>0</b><span class="tnum">/${tr.counter}</span><span>${esc(t('ow.st.sent'))}</span></span>` : ''}
      </span>
    </div>
    ${st.props ? `<ul class="ow-props" data-n="${st.props.length}" aria-hidden="true">${st.props.map(prop).join('')}</ul>` : ''}
  </div>`;
}
function laneHtml(l) {
  const lab = l.kind === 'parent' ? `${t('ow.st.parent')} · ${t(l.lang === 'ru' ? 'ow.st.inRu' : 'ow.st.inHe')}`
    : t(l.kind === 'owner' ? 'ow.st.owner' : l.role === 'kitchen' ? 'ow.st.kitchen' : 'ow.st.staff');
  const icn = l.kind === 'parent' ? 'user' : l.kind === 'owner' ? 'crown' : l.role === 'kitchen' ? 'chef' : 'tablet';
  return `<div class="ow-lane" data-lane="${l.id}" data-kind="${l.kind}"><span class="ow-lane__chip">${ic(icn)}<span>${esc(lab)}</span></span><div class="ow-lane__dev" aria-hidden="true"></div></div>`;
}
function stageHtml(a) {
  const st = a.stage;
  return `<div class="ow-stage" data-lanes="${st.lanes.length}" data-auto="${a.id}">
    <div class="ow-stage__main">
      <p class="ow-stage__desc">${esc(t(`ow.a.${a.id}.d`))}</p>
      <div class="ow-flow">
        <svg class="ow-flow__svg" aria-hidden="true" focusable="false"></svg>
        ${trigHtml(st)}
        <div class="ow-lanes">${st.lanes.map(laneHtml).join('')}</div>
      </div>
    </div>
    <div class="ow-stage__side">
      <p class="ow-stage__k">${esc(t('ow.st.log'))}</p>
      <ol class="ow-log" aria-live="polite"></ol>
      <p class="ow-done" hidden>${ic('check-circle')}<b>${esc(t('ow.st.done'))}</b><span>${esc(t('ow.st.doneSub'))}</span></p>
      <div class="ow-stage__btns">
        <button type="button" class="btn btn--ghost btn--sm" data-ow-again>${ic('refresh')}<span>${esc(t('ow.st.again'))}</span></button>
        <button type="button" class="btn btn--night btn--sm" data-ow-close>${esc(t('ow.st.close'))}</button>
      </div>
    </div>
  </div>`;
}
function offIn(el, anc) { let x = 0, y = 0, e = el; while (e && e !== anc) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y }; }

/* devices: parent phone (chat, in the family's language) · your phone (lock screen) · staff/kitchen tablet */
function devWidth(box, n) {
  const w = box.clientWidth || 160;
  return Math.round(Math.min(w, n === 1 ? 230 : 214));
}
function makeTablet(l, tm, w) {
  const el = h(`<div class="ow-tab" style="--pw:${w}px"><div class="ow-tab__screen">
    <div class="ow-tab__bar"><span class="ow-tab__who">${ic(l.role === 'kitchen' ? 'chef' : 'users')}<span>${esc(t(l.role === 'kitchen' ? 'ow.st.tabKitchen' : 'ow.st.tabStaff'))}</span></span><span class="tnum" data-ow-tabtime>${esc(tm)}</span></div>
    <div class="ow-tab__list"></div>
    <div class="ow-tab__empty">${ic('check-circle')}<span>${esc(t('ow.st.tabEmpty'))}</span></div>
  </div></div>`);
  el.setTime = x => { $('[data-ow-tabtime]', el).textContent = x; };
  return el;
}
function makeDevices(F) {
  const st = F.a.stage, n = st.lanes.length;
  const tm = st.time === 'now' ? App.fmt.time(new Date()) : st.time;
  F.devs = {};
  st.lanes.forEach(l => {
    const box = $(`[data-lane="${l.id}"] .ow-lane__dev`, F.stage);
    box.innerHTML = '';
    const w = devWidth(box, n);
    if (l.kind === 'tablet') { const tb = makeTablet(l, tm, w); box.append(tb); F.devs[l.id] = { kind: 'tablet', el: tb, l }; return; }
    const ph = App.ui.phone({ time: tm, size: w, max: 2 });
    ph.classList.add('ow-phone');
    const nl = $('.phone__notifs', ph); if (nl) nl.setAttribute('aria-live', 'off');
    if (l.kind === 'parent') {
      ph.setAttribute('lang', l.lang); ph.setAttribute('dir', l.lang === 'ru' ? 'ltr' : 'rtl');
      const chat = ph.chat({ title: MSG_TITLE[l.lang] });
      F.devs[l.id] = { kind: 'parent', el: ph, chat, l };
    } else {
      F.devs[l.id] = { kind: 'owner', el: ph, l };
    }
    box.append(ph);
  });
}
function sizeDevices(F) {
  if (!F || !F.devs) return;
  const n = F.a.stage.lanes.length;
  Object.values(F.devs).forEach(d => { const w = devWidth(d.el.parentElement, n); d.el.style.setProperty('--pw', w + 'px'); });
}
function layoutPaths(F) {
  const flow = F.flow, svg = $('.ow-flow__svg', flow); if (!flow || !svg) return;
  const W = flow.clientWidth, H = flow.clientHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
  const trig = $('[data-ow-trig]', flow), tp = offIn(trig, flow);
  const x0 = tp.x + trig.offsetWidth / 2, y0 = tp.y + trig.offsetHeight;
  let out = '';
  F.a.stage.lanes.forEach(l => {
    const chip = $(`[data-lane="${l.id}"] .ow-lane__chip`, flow), cp = offIn(chip, flow);
    const x1 = cp.x + chip.offsetWidth / 2, y1 = cp.y + 1, my = (y0 + y1) / 2;
    const d = `M${x0.toFixed(1)} ${y0.toFixed(1)}C${x0.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    out += `<path class="ow-flow__wire" data-wire="${l.id}" d="${d}"/><path class="ow-flow__lit" data-lit="${l.id}" d="${d}"/>`;
  });
  svg.innerHTML = out;
  F.paths = {}; F.lits = {};
  F.a.stage.lanes.forEach(l => {
    const p = $(`[data-wire="${l.id}"]`, svg), lit = $(`[data-lit="${l.id}"]`, svg);
    const len = p.getTotalLength();
    lit.style.strokeDasharray = len; lit.style.strokeDashoffset = F.litOn[l.id] ? 0 : len;
    F.paths[l.id] = p; F.lits[l.id] = lit;
  });
}
function travel(F, id) {
  const path = F.paths[id], lit = F.lits[id];
  const chip = $(`[data-lane="${id}"] .ow-lane__chip`, F.stage);
  const done = () => {
    F.litOn[id] = true; if (lit) lit.style.strokeDashoffset = 0;
    chip.classList.remove('is-lit'); reflow(chip); chip.classList.add('is-lit');
    if (!reduced()) { const r = chip.getBoundingClientRect(); App.fx.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 9, speed: [50, 170], size: [6, 14], life: [350, 700], gravity: 60, colors: ['magenta', 'gold', 'white', 'pink'] }); }
  };
  const dur = 760 * F.speed;
  if (!path || reduced() || dur < 80) { done(); return Promise.resolve(); }
  const len = path.getTotalLength();
  const tok = h('<span class="ow-token" aria-hidden="true"></span>'); F.flow.append(tok);
  return new Promise((res, rej) => {
    const t0 = performance.now(); let n = 0;
    const step = now => {
      if (F.signal.aborted) { tok.remove(); rej(abortErr()); return; }
      const k = Math.min(1, (now - t0) / dur), e = ease(k);
      const pt = path.getPointAtLength(len * e);
      tok.style.transform = `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`;
      lit.style.strokeDashoffset = (len * (1 - e)).toFixed(1);
      if (++n % 3 === 0) { const r = F.flow.getBoundingClientRect(); App.fx.trail(r.left + pt.x, r.top + pt.y, { size: [6, 13], colors: ['magenta', 'gold', 'white'] }); }
      if (k < 1) requestAnimationFrame(step); else { tok.remove(); done(); res(); }
    };
    requestAnimationFrame(step);
  });
}
function typing(d, on) {
  if (!d || d.kind !== 'parent') return;
  const body = $('.chatv__body', d.el); if (!body) return;
  let ty = $('.ow-typing', body);
  if (on && !ty) { ty = h('<div class="bubble ow-typing is-new"><span class="typing"><i></i><i></i><i></i></span></div>'); body.append(ty); }
  if (!on && ty) ty.remove();
}
function bubble(F, s, out) {
  const d = F.devs[s.lane]; if (!d || !d.chat) return 0;
  typing(d, false);
  const text = inLang(s.text, d.l.lang);
  const tm = $('.phone__status span', d.el);
  const b = d.chat.add({ text, out, time: tm ? tm.textContent : '' });
  if (s.link) {
    const lk = h(`<span class="ow-blink">${ic('link')}<span>${esc(inLang(s.link, d.l.lang))}</span></span>`);
    b.insertBefore(lk, $('.bubble__meta', b));
  }
  return text.length;
}
function tabAdd(F, s) {
  const d = F.devs[s.lane]; if (!d) return;
  const list = $('.ow-tab__list', d.el), empty = $('.ow-tab__empty', d.el);
  if (empty) empty.hidden = true;
  const c = h(`<div class="ow-tcard ow-tcard--${s.tone || 'warn'} is-new">
    <span class="ow-tcard__ic">${s.kid ? App.avatar(App.data.kid(s.kid), { label: '' }) : ic(s.icon)}</span>
    <span class="ow-tcard__m"><b>${ic(s.icon)}<span></span></b><span class="ow-tcard__x"></span></span></div>`);
  $('b span', c).textContent = L(s.title); $('.ow-tcard__x', c).textContent = L(s.text);
  list.prepend(c);
  while (list.children.length > 2) list.lastElementChild.remove();
}
function setProp(F, id, s) {
  const p = $(`[data-p="${id}"]`, F.stage); if (!p) return;
  p.dataset.s = s || '';
  if (s === 'hit' || s === 'pick') { p.classList.remove('is-pop'); reflow(p); p.classList.add('is-pop'); }
}
function logLine(F, text) {
  const ol = $('.ow-log', F.stage); if (!ol || !text) return;
  $$('li', ol).forEach(li => li.classList.remove('is-cur'));
  const li = h(`<li class="ow-log__i is-cur">${ic('check')}<span></span></li>`);
  $('span', li).textContent = L(text);
  ol.append(li);
}
function lightTrig(F) {
  const tr = $('[data-ow-trig]', F.stage); if (!tr) return;
  tr.classList.remove('is-lit'); reflow(tr); tr.classList.add('is-lit');
  if (!reduced()) App.fx.burstAt($('.ow-trig__ic', tr), { count: 14, speed: [80, 220], size: [7, 16], life: [400, 800], gravity: 80, colors: ['magenta', 'gold', 'white', 'blue'] });
}
function phase(F, s) {
  const tr = $('[data-ow-trig]', F.stage);
  if (s.tt) $('[data-ow-tt]', tr).textContent = L(s.tt);
  if (s.v) $('[data-ow-tv]', tr).textContent = L(s.v);
  if (s.time) Object.values(F.devs).forEach(d => (d.el.setTime ? d.el.setTime(s.time) : 0));
  if (s.prop) for (let i = 0; i < s.prop.length; i += 2) setProp(F, s.prop[i], s.prop[i + 1]);
  // the wires go dark again so the token visibly runs a second time
  Object.keys(F.lits || {}).forEach(id => { const lit = F.lits[id]; F.litOn[id] = false; lit.style.strokeDashoffset = lit.getTotalLength(); });
  $$('.ow-lane__chip', F.stage).forEach(c => c.classList.remove('is-lit'));
  tr.classList.remove('is-flip'); reflow(tr); tr.classList.add('is-flip');
  lightTrig(F);
}
async function runFilm(F) {
  const W = ms => sleep(Math.max(0, ms * F.speed), F.signal);
  for (const s of F.a.stage.steps) {
    if (F.signal.aborted) throw abortErr();
    switch (s.t) {
      case 'trig': lightTrig(F); logLine(F, s.log); await W(650); break;
      case 'phase': phase(F, s); logLine(F, s.log); await W(750); break;
      case 'prop': setProp(F, s.id, s.s); logLine(F, s.log); await W(380); break;
      case 'scan':
        for (const id of s.ids) { setProp(F, id, 'scan'); await W(250); setProp(F, id, s.end[id] || ''); }
        logLine(F, s.log); await W(420); break;
      case 'go': {
        if (s.count) { const c = $('[data-ow-cnt]', F.stage); if (c) App.countUp(c, s.count, { duration: Math.max(300, 1500 * F.speed) }); }
        await Promise.all(s.lanes.map(id => travel(F, id))); break;
      }
      case 'type': s.lanes.forEach(id => typing(F.devs[id], true)); await W(s.ms || 780); break;
      case 'msg': { const n = bubble(F, s, false); logLine(F, s.log); await W(s.ms != null ? s.ms : 650 + Math.min(1100, n * 9)); break; }
      case 'reply': { await W(380); bubble(F, s, true); logLine(F, s.log); await W(750); break; }
      case 'notify': { const d = F.devs[s.lane]; if (d && d.el.notify) d.el.notify({ title: s.title, text: s.text }); logLine(F, s.log); await W(1050); break; }
      case 'tab': tabAdd(F, s); logLine(F, s.log); await W(s.ms || 1050); break;
      case 'kpi': kpiBump(s.key, s.d); break;
    }
  }
}
function finishFilm(F) {
  const done = $('.ow-done', F.stage);
  if (done) {
    done.hidden = false; done.classList.remove('is-in'); reflow(done); done.classList.add('is-in');
    if (!reduced()) App.fx.burstAt($('.ic', done), { count: 26, speed: [120, 340], size: [8, 20], life: [600, 1100], gravity: 200 });
  }
  $$('.ow-log li', F.stage).forEach(li => li.classList.remove('is-cur'));
  App.haptic(14);
  // the dashboard reacts: last run → "now", a new line in the activity feed
  const id = F.a.id;
  S.last[id] = Date.now();
  S.feed.unshift({ id, ts: S.last[id], isNew: true });
  S.feed = S.feed.slice(0, 8);
  renderFeed(); updLastRuns();
  S.fresh = id;
}
function closePlayer() { if (PL.s && !PL.s.closed) PL.s.close('owner'); }
function startFilm() {
  if (!PL.s) return Promise.resolve(false);
  if (PL.ctrl) PL.ctrl.abort();
  const a = PL.a, body = PL.s.body;
  body.innerHTML = stageHtml(a);
  const ctrl = new AbortController(); PL.ctrl = ctrl; PL.finished = false;
  const F = { a, stage: $('.ow-stage', body), signal: ctrl.signal, speed: reduced() ? .3 : S.speed, litOn: {}, devs: {} };
  F.flow = $('.ow-flow', F.stage);
  PL.F = F;
  $('[data-ow-again]', F.stage).addEventListener('click', () => { startFilm(); });
  $('[data-ow-close]', F.stage).addEventListener('click', () => closePlayer());
  const run = (async () => {
    try {
      makeDevices(F);
      await App.nextFrame();
      layoutPaths(F);
      await sleep(reduced() ? 60 : Math.round(380 * Math.max(.6, F.speed)), F.signal);
      layoutPaths(F);
      await runFilm(F);
      if (F.signal.aborted) return false;
      finishFilm(F);
      PL.finished = true;
      return true;
    } catch (e) { if (!e || e.name !== 'AbortError') console.error('[owner] film', e); return false; }
  })();
  PL.run = run;
  return run;
}
function play(id) {
  const a = BY[id]; if (!a) return Promise.resolve(false);
  closePlayer();
  PL.a = a;
  const s = App.ui.sheet({
    titleKey: `ow.a.${id}.t`, size: 'full', className: 'ow-sheet',
    onClose: () => {
      if (PL.s !== s) return;
      if (PL.ctrl) PL.ctrl.abort();
      PL.s = null; PL.F = null;
      const fid = S.fresh; S.fresh = null;
      const card = fid && $(`[data-ow-a="${fid}"]`, root);
      if (card) { card.classList.remove('is-fresh'); reflow(card); card.classList.add('is-fresh'); }
    }
  });
  PL.s = s;
  return startFilm();
}
function onResize() {
  if (PL.F && PL.s && !PL.s.closed) { sizeDevices(PL.F); layoutPaths(PL.F); }
}

/* =====================================================================
   RENDER ALL · LIFECYCLE
   ===================================================================== */
function renderAll() {
  renderHero(); renderBento(); renderFunnel(); renderGrid(); renderFeed();
}
function startClock() {
  stopClock();
  S.clock = setInterval(() => { renderHero(); updLastRuns(); renderFeed(); }, 30000);
}
function stopClock() { if (S.clock) { clearInterval(S.clock); S.clock = 0; } }
function observe() {
  if (!('IntersectionObserver' in window)) { introFunnel(); return; }
  const fun = $('.ow-fun', root);
  if (!S.funIO) {
    S.funIO = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting && S.active && !S.funDone) { S.funDone = true; introFunnel(); }
      en.target.classList.toggle('is-vis', en.isIntersecting);
    }), { threshold: .3 });
  }
  S.funIO.unobserve(fun); S.funIO.observe(fun);
  const auto = $('.ow-auto', root);
  if (!S.autoIO) S.autoIO = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('is-vis', en.isIntersecting)), { threshold: 0 });
  S.autoIO.unobserve(auto); S.autoIO.observe(auto);
}

App.module('owner', {
  view: 'owner',
  i18n: { he: HE, ru: RU },
  init(r) {
    root = r;
    freshState();
    renderAll();
    S.cardsIn = true;
    r.addEventListener('click', e => {
      const sw = e.target.closest('[data-ow-sw]'); if (sw) { toggle(sw.dataset.owSw); return; }
      const per = e.target.closest('[data-ow-period]'); if (per) { setPeriod(per.dataset.owPeriod); return; }
      const go = e.target.closest('[data-ow-go]');
      if (go) { const el = $(go.dataset.owGo, root); if (el) { App.scrollTo(el, { offset: 84 }); el.classList.remove('is-ping'); reflow(el); el.classList.add('is-ping'); } return; }
      const pl = e.target.closest('[data-ow-play]'), card = e.target.closest('[data-ow-a]');
      const id = pl ? pl.dataset.owPlay : card ? card.dataset.owA : null;
      if (!id) return;
      if (!S.on[id]) { offNudge(id); return; }
      play(id);
    });
    App.on('lang', () => { renderAll(); });
    App.on('motion', () => { const b = $('[data-ow-bento]', root); if (b) b.classList.add('is-on'); const f = $('.ow-fun', root); if (f) f.classList.add('is-on'); });
    addEventListener('resize', onResize, { passive: true });
  },
  onEnter() {
    S.active = true; S.funDone = false;
    root.classList.remove('is-paused');
    renderHero(); updLastRuns(); renderFeed(); startClock();
    const f = $('.ow-fun', root); if (f && !reduced()) f.classList.remove('is-on');
    if (reduced()) { introKpis(); introFunnel(); S.funDone = true; }
    else { clearTimeout(S.introT); $('[data-ow-bento]', root).classList.remove('is-on'); S.introT = setTimeout(introKpis, 320); }
    observe();
  },
  onLeave() {
    S.active = false;
    root.classList.add('is-paused');
    stopClock(); clearTimeout(S.introT); closePlayer();
  },
  reset() {
    closePlayer();
    freshState();
    renderAll();
    const b = $('[data-ow-bento]', root); if (b) b.classList.add('is-on');
    const f = $('.ow-fun', root); if (f) f.classList.add('is-on');
  },
  play,
  tour: {
    /* KPIs count up, then the funnel pours (≈ 5.5 s) */
    async kpis(ctx) {
      closePlayer();
      const f = ctx.fast;
      await ctx.scrollTo(0, { duration: f ? 0 : 420 });
      introKpis();
      await ctx.point($('[data-ow-kpi="kids"] .ow-big', root));
      await ctx.wait(f ? 250 : 850);
      await ctx.point($('[data-ow-kpi="groups"] .ow-rings', root));
      await ctx.wait(f ? 250 : 700);
      await ctx.scrollTo($('#ow-funnel'), { duration: f ? 0 : 650, offset: 72 });
      S.funDone = true; introFunnel();
      await ctx.point($('.ow-fs__st:nth-child(2) .ow-fs__track', root));
      await ctx.wait(f ? 300 : 1300);
    },
    /* scroll backstage, play "new lead" and "17:30 summaries" by tapping their cards (≈ 9.5 s) */
    async automations(ctx) {
      closePlayer();
      const f = ctx.fast, prev = S.speed;
      AUTOS.forEach(a => { if (!S.on[a.id]) toggle(a.id); });
      const onAbort = () => closePlayer();
      ctx.signal.addEventListener('abort', onAbort, { once: true });
      S.speed = f ? .3 : .42;
      try {
        await ctx.scrollTo($('#ow-auto .ow-auto__head'), { duration: f ? 0 : 650, offset: 70 });
        for (const id of ['lead', 'summaries']) {
          ctx.check();
          await ctx.tap($(`[data-ow-a="${id}"] [data-ow-play]`, root), { after: 120 });
          const t0 = performance.now();
          while (!PL.finished && performance.now() - t0 < 9000) await ctx.wait(80);
          ctx.hideFinger();
          await ctx.wait(f ? 250 : 650);
          closePlayer();
          await ctx.wait(f ? 120 : 380);
        }
      } finally {
        S.speed = prev;
        ctx.signal.removeEventListener('abort', onAbort);
      }
    }
  }
});
