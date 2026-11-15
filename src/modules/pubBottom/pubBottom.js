/* =====================================================================
   pubBottom · the rest of the public site (after the clock) + flows + footer
   Public: openBooking(opts), openEligibility(), openRegistration(opts), openAssistant(topic)
   Tour:   tour.booking(ctx)
   ===================================================================== */
const { $, $$, h, esc, icon, t } = App;
const gs = () => (window.gsap && !App.motion.reduced ? window.gsap : null);
const ADDR = { he: 'העצמאות 58, אשדוד', ru: 'ул. ха-Ацмаут 58, Ашдод' };
const MAPS = 'https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A2%D7%A6%D7%9E%D7%90%D7%95%D7%AA%2058%20%D7%90%D7%A9%D7%93%D7%95%D7%93';
const WA = [{ n: '058-528-1292', u: 'https://wa.me/972585281292' }, { n: '052-540-6093', u: 'https://wa.me/972525406093' }];
const SLIP_D = 'M14 112c-4-12 8-22 26-26 22-5 42-10 60-20 12-7 20-14 32-16 14-2 26 2 36-4 8-5 12-14 14-26 8 4 12 20 10 38-2 12-10 18-22 20-20 3-40 18-64 36-8 6-20 8-36 8H30c-10 0-15-4-16-10Z';
const SKINS = ['#FFE3D1', '#F6C9A6', '#DFA277', '#B77A52', '#83512F'];
const HAIRS = ['#2A1A12', '#553220', '#8A5A2E', '#C78D4C', '#E7C47D', '#A8401F'];
const SHIRT = ['#E8048C', '#01AEF2', '#7FC8A9', '#FFB547', '#9B8CE8', '#F49BB6'];
const T = (k, tag = 'span', cls = '') => `<${tag}${cls ? ` class="${cls}"` : ''} data-i18n="${k}">${esc(t(k))}</${tag}>`;
const sp = (cls = '') => `<svg class="ic ic--fill ${cls}" aria-hidden="true"><use href="#i-sparkle"/></svg>`;
const digits = s => String(s || '').replace(/\D/g, '');
const phoneOk = s => { const d = digits(s); return /^05\d{8}$/.test(d) || /^9725\d{8}$/.test(d); };
const phoneFmt = s => { let d = digits(s); if (d.startsWith('972')) d = '0' + d.slice(3); return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : s; };
const lang = () => App.i18n.lang;
const groupName = id => { const g = App.data.groups.find(x => x.id === id); return g ? App.L(g) : ''; };

/* ---------- i18n: Hebrew for markup is harvested from the HTML; dynamic strings live here ---------- */
const HE = {
  'pb.g.baby': 'תינוקייה', 'pb.g.young': 'צעירים', 'pb.g.big': 'בוגרים',
  'pb.next': 'המשך', 'pb.back': 'חזרה', 'pb.close': 'סגירה', 'pb.done': 'סיום', 'pb.stepOf': 'שלב {n} מתוך {m}',
  'pb.name': 'שם', 'pb.phone': 'טלפון נייד', 'pb.phonePh': '050-000-0000', 'pb.msgLang': 'שפת ההודעות',
  'pb.errName': 'איך קוראים לכם?', 'pb.errPhone': 'מספר נייד: 10 ספרות, מתחיל ב-05', 'pb.example': 'לדוגמה',
  'pb.kw.holTile': 'חג', 'pb.kw.openTile': 'חול המועד, פתוחים',
  /* eligibility */
  'pb.el.title': 'בדיקת זכאות', 'pb.el.intro': 'שלוש שאלות קצרות, בלי מספרים ובלי מסמכים.',
  'pb.el.q1': 'ההורים עובדים או לומדים?', 'pb.el.q1a': 'עובדים', 'pb.el.q1b': 'לומדים', 'pb.el.q1c': 'גם וגם', 'pb.el.q1d': 'מצב אחר',
  'pb.el.q2': 'כמה ילדים יש במשפחה?', 'pb.el.q2a': 'ילד אחד', 'pb.el.q2b': 'שניים או שלושה', 'pb.el.q2c': 'ארבעה ומעלה',
  'pb.el.q3': 'כבר פתחתם בקשה לסבסוד?', 'pb.el.q3a': 'כן', 'pb.el.q3b': 'עוד לא', 'pb.el.q3c': 'לא בטוחים',
  'pb.el.send': 'שלחו לי מדריך', 'pb.el.doneT': 'נשלח לכם מדריך בוואטסאפ', 'pb.el.doneP': 'בהודעה תמצאו את הצעדים הבאים. אפשר לענות לנו שם עם כל שאלה.',
  'pb.el.demo': 'בדמו ההודעה מוצגת כאן, בטלפון לדוגמה.',
  'pb.el.msg1': 'שלום! הנה המדריך הקצר שביקשתם:\n1. בודקים זכאות לסבסוד באתר הרשמי.\n2. שומרים את האישור.\n3. מצרפים אותו להרשמה אצלנו.\nיש שאלה? כתבו לנו כאן.',
  'pb.el.msg2': 'שלום! הנה המדריך הקצר שביקשתם:\n1. שומרים את אישור הזכאות שקיבלתם.\n2. מצרפים אותו להרשמה אצלנו.\nיש שאלה? כתבו לנו כאן.',
  /* waitlist + check */
  'pb.wl.title': 'רשימת המתנה', 'pb.wl.intro': 'כשיתפנה מקום, נכתוב לכם לפי הסדר בתור.', 'pb.wl.child': 'שם הילד או הילדה', 'pb.wl.dob': 'תאריך לידה', 'pb.wl.group': 'קבוצה',
  'pb.wl.submit': 'הצטרפות לרשימה', 'pb.wl.place': 'אתם במקום {n} בתור', 'pb.wl.you': 'אתם', 'pb.wl.wa': 'נעדכן בוואטסאפ כשמתפנה מקום',
  'pb.wl.ref': 'מספר פנייה', 'pb.wl.copy': 'העתקה', 'pb.wl.copied': 'מספר הפנייה הועתק', 'pb.wl.errChild': 'מה השם של הילד או הילדה?', 'pb.wl.gate': 'הקבוצה',
  'pb.ck.title': 'המקום שלי בתור', 'pb.ck.label': 'מספר פנייה', 'pb.ck.hint': 'בדמו אפשר להקליד כל מספר.', 'pb.ck.btn': 'בדיקה', 'pb.ck.moved': 'התקדמתם במקום אחד מאז ההרשמה',
  /* booking */
  'pb.bk.title': 'קביעת סיור בגן', 'pb.bk.day': 'בחרו יום', 'pb.bk.slot': 'בחרו שעה', 'pb.bk.you': 'הפרטים שלכם',
  'pb.bk.full': 'מלא', 'pb.bk.taken': 'תפוס', 'pb.bk.today': 'היום', 'pb.bk.slotsEx': 'שעות לדוגמה', 'pb.bk.confirm': 'אישור הסיור', 'pb.bk.pick': 'בחרו יום ושעה',
  'pb.bk.sending': 'שולחים…', 'pb.bk.stamp': 'נקבע', 'pb.bk.doneT': 'נתראה בגן, {name}', 'pb.bk.doneP': 'האישור כבר אצלכם בוואטסאפ.',
  'pb.bk.remind': 'נשלח לכם גם תזכורת יום לפני', 'pb.bk.sent': 'ההודעה שקיבלתם',
  /* registration */
  'pb.rg.title': 'הרשמה לגן סינדרלה', 'pb.rg.t1': 'הילד או הילדה', 'pb.rg.t2': 'ההורים', 'pb.rg.t3': 'מסמכים',
  'pb.rg.cname': 'שם הילד או הילדה', 'pb.rg.dob': 'תאריך לידה', 'pb.rg.sample': 'מילוי לדוגמה', 'pb.rg.groupH': 'הקבוצה', 'pb.rg.auto': 'נבחרה לפי תאריך הלידה',
  'pb.rg.rule': 'כלל לדוגמה: עד שנה תינוקייה, שנה עד שנתיים צעירים, שנתיים עד 3 בוגרים.', 'pb.rg.age': 'גיל: {m} חודשים',
  'pb.rg.older': 'הגן שלנו מיועד לילדים עד גיל 3. כתבו לנו בוואטסאפ ונשמח לייעץ.', 'pb.rg.future': 'נראה שהתאריך עוד לפנינו. כדאי לבדוק אותו שוב.',
  'pb.rg.reserve': 'שריון מקום · {g}', 'pb.rg.mismatch': 'לפי תאריך הלידה מתאימה דווקא קבוצת {g}.',
  'pb.rg.pname': 'שם ההורה', 'pb.rg.pphone': 'טלפון נייד (WhatsApp)',
  'pb.rg.docsP': 'צילום מהטלפון מספיק. בדמו אפשר לבחור קובץ לדוגמה.',
  'pb.rg.d1': 'ספח תעודת זהות עם פרטי הילד', 'pb.rg.d2': 'פנקס חיסונים', 'pb.rg.d3': 'אישור זכאות לסבסוד, אם יש', 'pb.rg.opt': 'לא חובה',
  'pb.rg.up': 'העלאה', 'pb.rg.sampleFile': 'קובץ לדוגמה', 'pb.rg.uploaded': 'הועלה', 'pb.rg.need': 'PDF או תמונה', 'pb.rg.send': 'שליחת ההרשמה',
  'pb.rg.doneT': 'ההרשמה נשלחה', 'pb.rg.doneP': 'תודה, {name}! הנה מה שקורה עכשיו:', 'pb.rg.n1': 'עוברים על הפרטים והמסמכים', 'pb.rg.n2': 'חוזרים אליכם בוואטסאפ', 'pb.rg.n3': 'מתאמים יחד את היום הראשון בגן',
  'pb.rg.sampleName': 'יעל', 'pb.rg.sampleParent': 'מיכל',
  /* chat */
  'pb.ch.title': 'שאלו אותנו', 'pb.ch.sub': 'עונים בעברית וברוסית', 'pb.ch.ph': 'כתבו שאלה…', 'pb.ch.send': 'שליחה',
  'pb.ch.hi': 'היי, כאן גן סינדרלה. על מה תרצו לשאול? אפשר לבחור נושא או לכתוב.',
  'pb.ch.q.hours': 'שעות פתיחה', 'pb.ch.q.food': 'אוכל', 'pb.ch.q.clubs': 'חוגים', 'pb.ch.q.discount': 'הנחה לזכאים', 'pb.ch.q.adapt': 'הסתגלות', 'pb.ch.q.address': 'כתובת', 'pb.ch.q.visit': 'סיור בגן',
  'pb.ch.a.hours': 'א׳–ה׳: \u206607:00–17:00\u2069, ואפשר להאריך עד 18:00.\nו׳: \u206607:00–13:00\u2069.',
  'pb.ch.a.food': 'יש לנו מטבח משלנו, ומבשלים כל יום אוכל טרי: ארוחת בוקר, ארוחת צהריים ומנחה. את התפריט אישרה דיאטנית.',
  'pb.ch.a.clubs': 'בכל שבוע יש שלושה חוגים: מוזיקה, ספורט וטבע-חיות.',
  'pb.ch.a.discount': 'אנחנו מעון מוכר ומפוקח, ומשפחות שזכאיות לסבסוד מקבלות אצלנו הנחה משמעותית. רוצים לבדוק?',
  'pb.ch.a.adapt': 'כל ילד מתרגל בקצב שלו, וזה בסדר גמור. הכי טוב לדבר על זה יחד: בסיור בגן נספר איך זה נראה אצלנו ונשמע מה חשוב לכם.',
  'pb.ch.a.address': 'העצמאות 58, אשדוד.',
  'pb.ch.a.visit': 'אפשר לקבוע סיור כאן ועכשיו: בוחרים יום ושעה, ומקבלים אישור לוואטסאפ.',
  'pb.ch.a.ages': 'אנחנו מעון יום לילדים מלידה ועד גיל 3, בשלוש קבוצות: תינוקייה, צעירים ובוגרים.',
  'pb.ch.a.holidays': 'יש אצלנו פחות ימי חופשה מאשר בלוח הרשמי, ואנחנו פתוחים בחול המועד סוכות ופסח.',
  'pb.ch.a.price': 'על מחירים נשמח לדבר אישית, בוואטסאפ או בסיור. ומשפחות שזכאיות לסבסוד מקבלות אצלנו הנחה משמעותית.',
  'pb.ch.a.register': 'אפשר להירשם כאן באתר בשלושה שלבים קצרים. את הקבוצה נבחר לפי תאריך הלידה.',
  'pb.ch.a.places': 'את המצב בכל קבוצה רואים כאן באתר. אם אין מקום, אפשר להיכנס לרשימת ההמתנה.',
  'pb.ch.a.contact': 'הכי נוח לכתוב לנו בוואטסאפ:',
  'pb.ch.a.hello': 'שלום! במה אפשר לעזור?', 'pb.ch.a.thanks': 'בשמחה! יש עוד משהו?',
  'pb.ch.a.fallback': 'על זה עדיף שנענה אישית. כתבו לנו בוואטסאפ, או קבעו סיור ונדבר בגן.',
  'pb.ch.act.elig': 'בדיקת זכאות', 'pb.ch.act.book': 'קביעת סיור', 'pb.ch.act.reg': 'התחלת הרשמה', 'pb.ch.act.avail': 'למקומות הפנויים'
};
const RU = {
  'pb.kw.replay': 'Подать заново', 'pb.kw.eye': 'Еда, кружки и праздники', 'pb.kw.h': 'Что ждёт детей',
  'pb.kw.lead': 'Свежая еда с нашей кухни, три кружка в неделю и сад, который работает даже в холь а-моэд.',
  'pb.kw.kitchen': 'Своя кухня', 'pb.kw.kitchenP': 'Готовим здесь, в саду, каждый день: завтрак, обед и полдник.',
  'pb.kw.meals': 'Приёмы пищи', 'pb.kw.mB': 'Завтрак', 'pb.kw.mL': 'Обед', 'pb.kw.mM': 'Полдник', 'pb.kw.diet': 'Меню утвердил диетолог',
  'pb.kw.clubsH': 'кружка каждую неделю', 'pb.kw.clubsP': 'Музыка, спорт и природа. Нажмите на карточку, чтобы оживить.',
  'pb.kw.music': 'Музыка', 'pb.kw.musicP': 'Песни, ритм и маленькие инструменты для маленьких рук.',
  'pb.kw.sport': 'Спорт', 'pb.kw.sportP': 'Движение, мячи, прыжки и много смеха.',
  'pb.kw.nature': 'Природа и животные', 'pb.kw.natureP': 'Знакомимся с растениями и маленькими животными.',
  'pb.kw.hol': 'Работаем в холь а-моэд', 'pb.kw.holP': 'Каникул у нас меньше, чем по официальному календарю. В холь а-моэд Суккота и Песаха сад открыт.',
  'pb.kw.holSeg': 'Праздник', 'pb.kw.sukkot': 'Суккот', 'pb.kw.pesach': 'Песах', 'pb.kw.stripA11y': 'Холь а-моэд: сад открыт',
  'pb.kw.legOn': 'Холь а-моэд · открыто', 'pb.kw.legOff': 'Праздник', 'pb.kw.holTile': 'Праздник', 'pb.kw.openTile': 'Холь а-моэд, открыто',
  'pb.rc.eye': 'Мэон для детей от рождения до 3 лет', 'pb.rc.h': 'Признанный мэон под надзором',
  'pb.rc.lead': '«Синдерелла» работает как признанный мэон (ясли-сад) под надзором, для детей от рождения до 3 лет.',
  'pb.rc.discT': 'Скидка для семей с правом на субсидию', 'pb.rc.discP': 'Семьи, у которых есть право на субсидию, получают у нас заметную скидку.',
  'pb.rc.btn': 'Проверить право', 'pb.rc.hint': 'Три коротких вопроса и понятная инструкция в WhatsApp',
  'pb.av.eye': 'Места в группах', 'pb.av.h': 'Свободные места', 'pb.av.lead': 'Так сейчас выглядят группы. Можно забронировать место или встать в лист ожидания.',
  'pb.g.baby': 'Младенческая группа', 'pb.g.young': 'Младшая группа', 'pb.g.big': 'Старшая группа',
  'pb.av.a11yBaby': 'Занято 6 мест из 8', 'pb.av.a11yYoung': 'Занято 9 мест из 10', 'pb.av.a11yBig': 'Все 12 мест заняты',
  'pb.av.two': '2 свободных места', 'pb.av.last': 'Последнее место', 'pb.av.wait': 'Лист ожидания', 'pb.av.reserve': 'Забронировать место',
  'pb.av.join': 'Встать в лист ожидания', 'pb.av.taken': 'занято', 'pb.av.free': 'свободно', 'pb.av.already': 'Уже в листе ожидания?', 'pb.av.check': 'Проверить моё место',
  'pb.vi.eye': 'Приходите познакомиться', 'pb.vi.h': 'Экскурсия в сад', 'pb.vi.lead': 'Лучше один раз увидеть. Выберите день и время, а подтверждение придёт в WhatsApp.',
  'pb.vi.see': 'Что вы увидите', 'pb.vi.b1': 'Комнаты, двор и детские уголки', 'pb.vi.b2': 'Кухню, где готовят каждый день', 'pb.vi.b3': 'Команду, которой можно задать любые вопросы',
  'pb.vi.btn': 'Записаться на экскурсию',
  'pb.rg.eye': 'Присоединяйтесь к нам', 'pb.rg.h': 'Запись в сад', 'pb.rg.lead': 'Три коротких шага прямо с телефона. Группу подберём по дате рождения.',
  'pb.rg.s1': 'Ребёнок', 'pb.rg.s1s': 'Имя и дата рождения', 'pb.rg.s2': 'Родители', 'pb.rg.s2s': 'Имя, телефон и язык сообщений', 'pb.rg.s3': 'Документы', 'pb.rg.s3s': 'Хватит фото с телефона',
  'pb.rg.btn': 'Начать запись',
  'pb.rv.eye': 'Отзывы', 'pb.rv.h': 'Что говорят родители', 'pb.rv.cap': 'Здесь появятся отзывы родителей',
  'pb.ask.eye': 'Есть вопрос?', 'pb.ask.h': 'Спросите нас', 'pb.ask.lead': 'Быстрые ответы про часы работы, еду, кружки и скидку. На иврите и по-русски.',
  'pb.ask.btn': 'Открыть чат', 'pb.ask.demoQ': 'До скольки вы работаете?', 'pb.ask.demoA': 'Вс–чт до 17:00, можно продлить до 18:00.',
  'pb.ft.name': 'Сад «Синдерелла»', 'pb.ft.slogan': 'Детский сад из сказки', 'pb.ft.addrH': 'Адрес', 'pb.ft.addr': 'ул. ха-Ацмаут 58, Ашдод',
  'pb.ft.hoursH': 'Часы работы', 'pb.ft.sunThu': 'вс–чт', 'pb.ft.ext': 'можно продлить до 18:00', 'pb.ft.fri': 'пт', 'pb.ft.writeH': 'Напишите нам',
  'pb.fab': 'Спросите нас',
  'pb.next': 'Дальше', 'pb.back': 'Назад', 'pb.close': 'Закрыть', 'pb.done': 'Готово', 'pb.stepOf': 'Шаг {n} из {m}',
  'pb.name': 'Имя', 'pb.phone': 'Мобильный', 'pb.phonePh': '050-000-0000', 'pb.msgLang': 'Язык сообщений',
  'pb.errName': 'Как вас зовут?', 'pb.errPhone': 'Мобильный номер: 10 цифр, начинается с 05', 'pb.example': 'пример',
  'pb.el.title': 'Проверка права на скидку', 'pb.el.intro': 'Три коротких вопроса, без цифр и документов.',
  'pb.el.q1': 'Родители работают или учатся?', 'pb.el.q1a': 'Работаем', 'pb.el.q1b': 'Учимся', 'pb.el.q1c': 'И то, и другое', 'pb.el.q1d': 'Другое',
  'pb.el.q2': 'Сколько детей в семье?', 'pb.el.q2a': 'Один', 'pb.el.q2b': 'Двое или трое', 'pb.el.q2c': 'Четверо и больше',
  'pb.el.q3': 'Вы уже подавали заявку на субсидию?', 'pb.el.q3a': 'Да', 'pb.el.q3b': 'Ещё нет', 'pb.el.q3c': 'Не уверены',
  'pb.el.send': 'Пришлите инструкцию', 'pb.el.doneT': 'Мы отправили вам инструкцию в WhatsApp', 'pb.el.doneP': 'В сообщении следующие шаги. С вопросами можно ответить прямо там.',
  'pb.el.demo': 'В демо сообщение показано здесь, на примерном телефоне.',
  'pb.el.msg1': 'Здравствуйте! Вот короткая инструкция:\n1. Проверьте право на субсидию на официальном сайте.\n2. Сохраните подтверждение.\n3. Приложите его при записи к нам.\nЕсть вопросы? Пишите сюда.',
  'pb.el.msg2': 'Здравствуйте! Вот короткая инструкция:\n1. Сохраните полученное подтверждение права.\n2. Приложите его при записи к нам.\nЕсть вопросы? Пишите сюда.',
  'pb.wl.title': 'Лист ожидания', 'pb.wl.intro': 'Когда освободится место, напишем по порядку очереди.', 'pb.wl.child': 'Имя ребёнка', 'pb.wl.dob': 'Дата рождения', 'pb.wl.group': 'Группа',
  'pb.wl.submit': 'Встать в очередь', 'pb.wl.place': 'Вы {n}-е в очереди', 'pb.wl.you': 'вы', 'pb.wl.wa': 'Напишем в WhatsApp, как только освободится место',
  'pb.wl.ref': 'Номер заявки', 'pb.wl.copy': 'Скопировать', 'pb.wl.copied': 'Номер заявки скопирован', 'pb.wl.errChild': 'Как зовут ребёнка?', 'pb.wl.gate': 'группа',
  'pb.ck.title': 'Моё место в очереди', 'pb.ck.label': 'Номер заявки', 'pb.ck.hint': 'В демо подойдёт любой номер.', 'pb.ck.btn': 'Проверить', 'pb.ck.moved': 'С момента записи вы продвинулись на одно место',
  'pb.bk.title': 'Запись на экскурсию', 'pb.bk.day': 'Выберите день', 'pb.bk.slot': 'Выберите время', 'pb.bk.you': 'Ваши данные',
  'pb.bk.full': 'мест нет', 'pb.bk.taken': 'занято', 'pb.bk.today': 'сегодня', 'pb.bk.slotsEx': 'пример', 'pb.bk.confirm': 'Подтвердить запись', 'pb.bk.pick': 'Выберите день и время',
  'pb.bk.sending': 'Отправляем…', 'pb.bk.stamp': 'Готово', 'pb.bk.doneT': 'До встречи в саду, {name}', 'pb.bk.doneP': 'Подтверждение уже у вас в WhatsApp.',
  'pb.bk.remind': 'Накануне пришлём напоминание', 'pb.bk.sent': 'Сообщение, которое вы получили',
  'pb.rg.title': 'Запись в «Синдереллу»', 'pb.rg.t1': 'Ребёнок', 'pb.rg.t2': 'Родители', 'pb.rg.t3': 'Документы',
  'pb.rg.cname': 'Имя ребёнка', 'pb.rg.dob': 'Дата рождения', 'pb.rg.sample': 'Заполнить примером', 'pb.rg.groupH': 'Группа', 'pb.rg.auto': 'Подобрана по дате рождения',
  'pb.rg.rule': 'Пример правила: до года младенческая, от года до двух младшая, от двух до трёх старшая.', 'pb.rg.age': 'Возраст: {m} мес.',
  'pb.rg.older': 'Наш сад для детей до 3 лет. Напишите нам в WhatsApp, подскажем.', 'pb.rg.future': 'Похоже, эта дата ещё впереди. Проверьте, пожалуйста.',
  'pb.rg.reserve': 'Бронь места · {g}', 'pb.rg.mismatch': 'По дате рождения подходит другая группа: {g}.',
  'pb.rg.pname': 'Имя родителя', 'pb.rg.pphone': 'Мобильный (WhatsApp)',
  'pb.rg.docsP': 'Хватит фото с телефона. В демо можно выбрать пример файла.',
  'pb.rg.d1': 'Приложение к теудат зеут с данными ребёнка', 'pb.rg.d2': 'Прививочный паспорт', 'pb.rg.d3': 'Подтверждение права на субсидию, если есть', 'pb.rg.opt': 'по желанию',
  'pb.rg.up': 'Загрузить', 'pb.rg.sampleFile': 'Пример файла', 'pb.rg.uploaded': 'Загружено', 'pb.rg.need': 'PDF или фото', 'pb.rg.send': 'Отправить заявку',
  'pb.rg.doneT': 'Заявка отправлена', 'pb.rg.doneP': 'Спасибо, {name}! Что будет дальше:', 'pb.rg.n1': 'Проверим данные и документы', 'pb.rg.n2': 'Ответим вам в WhatsApp', 'pb.rg.n3': 'Вместе договоримся о первом дне в саду',
  'pb.rg.sampleName': 'Яэль', 'pb.rg.sampleParent': 'Михаль',
  'pb.ch.title': 'Спросите нас', 'pb.ch.sub': 'Отвечаем на иврите и по-русски', 'pb.ch.ph': 'Напишите вопрос…', 'pb.ch.send': 'Отправить',
  'pb.ch.hi': 'Здравствуйте, это сад «Синдерелла». О чём хотите спросить? Выберите тему или напишите.',
  'pb.ch.q.hours': 'Часы работы', 'pb.ch.q.food': 'Еда', 'pb.ch.q.clubs': 'Кружки', 'pb.ch.q.discount': 'Скидка', 'pb.ch.q.adapt': 'Адаптация', 'pb.ch.q.address': 'Адрес', 'pb.ch.q.visit': 'Экскурсия',
  'pb.ch.a.hours': 'Вс–чт: \u206607:00–17:00\u2069, можно продлить до 18:00.\nПт: \u206607:00–13:00\u2069.',
  'pb.ch.a.food': 'У нас своя кухня, каждый день готовим свежую еду: завтрак, обед и полдник. Меню утвердил диетолог.',
  'pb.ch.a.clubs': 'Каждую неделю три кружка: музыка, спорт и «природа и животные».',
  'pb.ch.a.discount': 'Мы признанный мэон под надзором. Семьи с правом на субсидию получают у нас заметную скидку. Проверим?',
  'pb.ch.a.adapt': 'Каждый ребёнок привыкает в своём темпе, и это нормально. Лучше обсудить это вместе: на экскурсии расскажем, как это у нас выглядит, и послушаем, что важно вам.',
  'pb.ch.a.address': 'ул. ха-Ацмаут 58, Ашдод.',
  'pb.ch.a.visit': 'Записаться можно прямо здесь: выберите день и время, подтверждение придёт в WhatsApp.',
  'pb.ch.a.ages': 'Мы мэон (ясли-сад) для детей от рождения до 3 лет. Три группы: младенческая, младшая и старшая.',
  'pb.ch.a.holidays': 'Каникул у нас меньше, чем по официальному календарю, а в холь а-моэд Суккота и Песаха мы работаем.',
  'pb.ch.a.price': 'О ценах лучше поговорить лично, в WhatsApp или на экскурсии. А семьи с правом на субсидию получают заметную скидку.',
  'pb.ch.a.register': 'Записаться можно здесь на сайте, в три коротких шага. Группу подберём по дате рождения.',
  'pb.ch.a.places': 'Свободные места по группам видно здесь на сайте. Если мест нет, можно встать в лист ожидания.',
  'pb.ch.a.contact': 'Удобнее всего написать нам в WhatsApp:',
  'pb.ch.a.hello': 'Здравствуйте! Чем помочь?', 'pb.ch.a.thanks': 'Пожалуйста! Что-нибудь ещё?',
  'pb.ch.a.fallback': 'На это лучше ответим лично. Напишите нам в WhatsApp или запишитесь на экскурсию, поговорим в саду.',
  'pb.ch.act.elig': 'Проверить право', 'pb.ch.act.book': 'Записаться на экскурсию', 'pb.ch.act.reg': 'Начать запись', 'pb.ch.act.avail': 'К свободным местам'
};

let root = null;
const mine = new Map(); // type -> sheet api
function openSheet(type, o) {
  const prev = mine.get(type); if (prev && !prev.closed) prev.close('replace');
  const s = App.ui.sheet(Object.assign({}, o, {
    className: `pb-sh pb-sh--${type} ${o.className || ''}`,
    onClose: r => { if (mine.get(type) === s) mine.delete(type); o.onClose && o.onClose(r); }
  }));
  mine.set(type, s); return s;
}
const closeMine = () => Array.from(mine.values()).forEach(s => s.close('reset'));
const sfoot = inner => `<div class="pb-sfoot">${inner}</div>`;
const progressBar = (i, n) => `<div class="pb-prog"><span class="pb-prog__t" aria-live="polite">${esc(t('pb.stepOf', { n: i + 1, m: n }))}</span><span class="pb-prog__dots" aria-hidden="true">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? 'is-done' : k === i ? 'is-cur' : ''}"></i>`).join('')}</span></div>`;
function scrollSheetTo(s, el) {
  if (!s || !el) return; const body = s.body; const r = el.getBoundingClientRect(), br = body.getBoundingClientRect();
  const top = body.scrollTop + r.top - br.top - 12;
  try { body.scrollTo({ top, behavior: App.motion.reduced ? 'auto' : 'smooth' }); } catch (e) { body.scrollTop = top; }
}
function typingBubble(cls = '') { return h(`<div class="bubble ${cls} is-new pb-typing" aria-hidden="true"><span class="typing"><i></i><i></i><i></i></span></div>`); }

/* phone mock with a chat that receives one message after a typing indicator */
function phoneChat(text, o = {}) {
  const ph = App.ui.phone({ time: o.time || App.fmt.time(new Date()), light: true, size: o.size || 236 });
  const chat = ph.chat({ title: { he: 'גן סינדרלה', ru: 'Сад «Синдерелла»' }, messages: [] });
  const body = $('.chatv__body', chat);
  const run = async () => {
    await App.sleep(App.motion.reduced ? 0 : 450);
    const tb = typingBubble(); if (!App.motion.reduced) { body.append(tb); await App.sleep(900); tb.remove(); }
    chat.add({ text, time: App.fmt.time(new Date()) }, !App.motion.reduced);
    App.haptic(12);
  };
  ph.pbRun = run;
  return ph;
}
function groupFor(months) { if (months == null || isNaN(months)) return null; if (months < 0) return 'future'; if (months < 12) return 'baby'; if (months < 24) return 'young'; if (months < 36) return 'big'; return 'older'; }
function monthsSince(iso) { if (!iso) return null; const d = new Date(iso + 'T12:00:00'); if (isNaN(d)) return null; const n = new Date(); return (n.getFullYear() - d.getFullYear()) * 12 + (n.getMonth() - d.getMonth()) - (n.getDate() < d.getDate() ? 1 : 0); }
const isoMonthsAgo = m => { const d = new Date(); d.setMonth(d.getMonth() - m); d.setDate(Math.min(d.getDate(), 26)); return d.toISOString().slice(0, 10); };
const todayIso = () => new Date().toISOString().slice(0, 10);

/* =====================================================================
   SECTION ART + MOTION
   ===================================================================== */
const io = (els, fn, opt) => {
  if (!('IntersectionObserver' in window)) { els.forEach(el => fn(el, true)); return null; }
  const o = new IntersectionObserver(es => es.forEach(e => fn(e.target, e.isIntersecting, e)), opt || { threshold: .3 });
  els.forEach(el => o.observe(el)); return o;
};

/* ---------- kitchen plate ---------- */
const Plate = {
  meal: 'b', tl: null, served: false,
  init() {
    this.art = $('.pb-kitchen__art', root); this.svg = $('.pb-plate', root);
    io([this.art], (el, vis) => {
      el.classList.toggle('pb-on', vis);
      if (vis && !this.served) { this.served = true; this.play(); }
    }, { threshold: .35 });
    $('[data-pb-plate]', root).addEventListener('click', () => { this.play(); App.fx.burstAt(this.svg, { count: 14, speed: [80, 220] }); });
    $$('.pb-meals .chip', root).forEach(c => c.addEventListener('click', () => this.switchTo(c.dataset.meal)));
  },
  items(m) { return $$(`.pb-food[data-meal="${m}"] .pb-fi`, this.svg); },
  showOnly(m) { $$('.pb-food', this.svg).forEach(f => { f.hidden = f.dataset.meal !== m; }); },
  play() {
    const g = gs(); this.showOnly(this.meal);
    if (this.tl) this.tl.kill();
    if (!g) { this.art.classList.add('is-served'); return; }
    this.art.classList.remove('is-served');
    const S = sel => $(sel, this.svg);
    this.tl = g.timeline({ onComplete: () => this.art.classList.add('is-served') })
      .fromTo(S('.pb-doily'), { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: .7, ease: 'back.out(1.7)' }, 0)
      .fromTo(S('.pb-dish'), { x: -360 }, { x: 0, duration: .95, ease: 'back.out(1.15)' }, .05)
      .fromTo(S('.pb-cup'), { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'bounce.out' }, .45)
      .fromTo(this.items(this.meal), { y: -200, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .17, ease: 'bounce.out' }, .8)
      .fromTo(S('.pb-plate-sp'), { opacity: 0, scale: .4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(2)' }, '-=.5');
  },
  switchTo(m) {
    $$('.pb-meals .chip', root).forEach(c => c.setAttribute('aria-pressed', c.dataset.meal === m));
    if (m === this.meal) { this.play(); return; }
    const prev = this.meal; this.meal = m; const g = gs();
    if (this.tl) this.tl.progress(1).kill();
    if (!g) { this.showOnly(m); this.art.classList.add('is-served'); return; }
    this.tl = g.timeline()
      .to(this.items(prev), { y: -26, opacity: 0, duration: .26, stagger: .05, ease: 'power2.in' })
      .add(() => this.showOnly(m))
      .fromTo(this.items(m), { y: -200, opacity: 0 }, { y: 0, opacity: 1, duration: .85, stagger: .15, ease: 'bounce.out' });
    App.haptic(8);
  },
  reset() { this.meal = 'b'; $$('.pb-meals .chip', root).forEach(c => c.setAttribute('aria-pressed', c.dataset.meal === 'b')); if (this.tl) this.tl.progress(1).kill(); this.showOnly('b'); }
};

/* ---------- clubs: looped scenes play in view / hover / tap ---------- */
function initClubs() {
  const cards = $$('.pb-club', root);
  io(cards, (el, vis) => el.classList.toggle('pb-on', vis), { threshold: .45 });
  cards.forEach(c => c.addEventListener('click', () => {
    c.classList.remove('pb-boost'); void c.offsetWidth; c.classList.add('pb-boost', 'pb-on');
    clearTimeout(c._bt); c._bt = setTimeout(() => c.classList.remove('pb-boost'), 2200);
    App.fx.burstAt($('.pb-club__art', c), { count: 16, speed: [90, 240], colors: c.dataset.club === 'music' ? ['magenta', 'gold', 'blue'] : c.dataset.club === 'sport' ? ['gold', 'blue', 'white'] : ['gold', 'pink', 'white'] });
    App.haptic(10);
  }));
}

/* ---------- holiday strip ---------- */
const Hol = {
  kind: 'sukkot',
  init() {
    this.strip = $('.pb-strip', root);
    this.render();
    io([this.strip], (el, vis) => { if (vis) this.light(); }, { threshold: .6 });
    $$('[data-hol]', root).forEach(b => b.addEventListener('click', () => {
      this.kind = b.dataset.hol; $$('[data-hol]', root).forEach(x => x.setAttribute('aria-pressed', x === b));
      this.render(); requestAnimationFrame(() => this.light(true));
    }));
    App.on('lang', () => this.render(true));
  },
  render(keep) {
    const lit = keep && this.strip.classList.contains('is-lit');
    const ic = this.kind === 'sukkot' ? 'leaf' : 'sprout';
    this.strip.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => {
      const open = i > 0 && i < 6;
      return `<li class="pb-day ${open ? 'is-open' : 'is-hag'}" style="--i:${i}"><span class="sr-only">${esc(t(open ? 'pb.kw.openTile' : 'pb.kw.holTile'))}</span>${open ? `<svg class="ic ic--fill" aria-hidden="true"><use href="#i-sparkle"/></svg>` : icon(ic)}</li>`;
    }).join('');
    this.strip.classList.toggle('is-lit', !!lit);
  },
  light(force) {
    if (force) { this.strip.classList.remove('is-lit'); void this.strip.offsetWidth; }
    if (this.strip.classList.contains('is-lit')) return;
    this.strip.classList.add('is-lit');
    if (!App.motion.reduced) setTimeout(() => App.fx.burstAt($$('.pb-day.is-open', this.strip)[2], { count: 14, speed: [60, 180], colors: ['gold', 'magenta', 'white'] }), 700);
  }
};

/* ---------- availability seats ---------- */
function renderSeats() {
  $$('.pb-seats', root).forEach(box => {
    const n = +box.dataset.n, taken = +box.dataset.taken, kind = box.dataset.kind;
    const COL = kind === 'crib' ? ['#F6B0C6', '#9ED8F7', '#B8E4CF', '#FFD9A0'] : ['#FFB547', '#7FC8A9', '#01AEF2', '#F49BB6', '#9B8CE8'];
    let html = '';
    for (let i = 0; i < n; i++) {
      const tk = i < taken;
      const st = `--i:${i};--skin:${SKINS[(i * 3 + 1) % 5]};--hair:${HAIRS[(i * 5 + 2) % 6]};--shirt:${SHIRT[(i * 2 + 1) % 6]};color:${tk ? COL[i % COL.length] : (kind === 'crib' ? '#fff' : '#F6B0C6')}`;
      html += `<span class="pb-seat ${tk ? 'is-taken' : 'is-free'}" style="${st}"><svg viewBox="0 0 44 40"><use href="#pb-${kind}${tk ? '-k' : ''}"/></svg>${tk ? '' : sp('pb-seat__sp')}</span>`;
    }
    box.style.setProperty('--cols', kind === 'crib' ? 4 : n > 10 ? 6 : 5);
    box.innerHTML = html;
  });
}

/* ---------- door, seal, slipper teaser, footer loops ---------- */
function initArt() {
  const door = $('.pb-door', root);
  io([door], (el, vis) => { clearTimeout(el._t); if (vis) el._t = setTimeout(() => el.classList.add('is-open'), App.motion.reduced ? 0 : 450); else el.classList.remove('is-open'); }, { threshold: .45 });
  const seal = $('.pb-seal', root), foot = $('.pb-foot__scene', root);
  io([seal, foot, $('.pb-askcard', root)], (el, vis) => el.classList.toggle('pb-on', vis), { threshold: .1 });
  const sl = $('.pb-rg__art', root);
  io([sl], (el, vis) => {
    if (!vis || el._done) return; el._done = true;
    const liq = $('.pb-liq', el); const svg = $('svg', el);
    setTimeout(() => { liq.style.setProperty('--lvl', .5); }, App.motion.reduced ? 0 : 500);
    setTimeout(() => { svg.classList.add('is-full'); }, App.motion.reduced ? 0 : 1500);
  }, { threshold: .45 });
  $('[data-pb-statement]', root).addEventListener('click', () => App.ui.statement());
}

/* ---------- floating assistant button ---------- */
const Fab = {
  init() {
    this.el = $('.pb-fab', root); this.labeled = false;
    this.el.addEventListener('click', () => openAssistant());
    App.onScroll(y => this.update(y));
    addEventListener('resize', () => this.update(), { passive: true });
  },
  update(y = App.scrollY()) {
    if (!this.el) return;
    const docH = document.documentElement.scrollHeight;
    const nearEnd = y + innerHeight > docH - 260;
    const clock = document.getElementById('clock'); let inClock = false;
    if (clock) { const r = clock.getBoundingClientRect(); inClock = r.top < innerHeight * .6 && r.bottom > innerHeight * .75; }
    const show = App.state.view === 'visitors' && y > innerHeight * .8 && !nearEnd && !inClock;
    this.el.classList.toggle('is-shown', show);
    if (show && !this.labeled) {
      this.labeled = true; this.el.classList.add('is-labeled');
      setTimeout(() => this.el.classList.remove('is-labeled'), 4200);
    }
  }
};

/* =====================================================================
   ELIGIBILITY
   ===================================================================== */
const EL_Q = [
  { q: 'pb.el.q1', ic: 'users', o: ['pb.el.q1a', 'pb.el.q1b', 'pb.el.q1c', 'pb.el.q1d'] },
  { q: 'pb.el.q2', ic: 'home-heart', o: ['pb.el.q2a', 'pb.el.q2b', 'pb.el.q2c'] },
  { q: 'pb.el.q3', ic: 'doc', o: ['pb.el.q3a', 'pb.el.q3b', 'pb.el.q3c'] }
];
const EL = { step: 0, ans: [null, null, null] };
function openEligibility() {
  EL.step = 0; EL.ans = [null, null, null];
  const s = openSheet('elig', { titleKey: 'pb.el.title', content: '<div class="pb-el"></div>' });
  elRender(s);
  return s;
}
function elRender(s) {
  const box = $('.pb-el', s.body); if (!box) return;
  if (EL.step < 3) {
    const Q = EL_Q[EL.step], a = EL.ans[EL.step];
    box.innerHTML = `${progressBar(EL.step, 3)}
      ${EL.step === 0 ? `<p class="muted small pb-el__intro">${T('pb.el.intro')}</p>` : ''}
      <div class="pb-q pb-anim-in">
        <span class="icon-bubble icon-bubble--pink">${icon(Q.ic)}</span>
        <h3 class="h3">${T(Q.q)}</h3>
        <div class="pb-opts" role="group" aria-label="${esc(t(Q.q))}">${Q.o.map((k, i) => `<button type="button" class="pb-opt" data-i="${i}" aria-pressed="${a === i}"><span class="pb-opt__dot" aria-hidden="true">${icon('check')}</span>${T(k)}</button>`).join('')}</div>
      </div>
      ${sfoot(`${EL.step ? `<button type="button" class="btn btn--ghost" data-back>${icon('back', 'ic--dir')}${T('pb.back')}</button>` : ''}
        <button type="button" class="btn btn--primary pb-grow" data-next ${a == null ? 'disabled' : ''}>${EL.step === 2 ? icon('send', 'pb-ic-send') + T('pb.el.send') : T('pb.next') + icon('arrow', 'ic--dir')}</button>`)}`;
    $$('.pb-opt', box).forEach(b => b.addEventListener('click', () => {
      EL.ans[EL.step] = +b.dataset.i; $$('.pb-opt', box).forEach(x => x.setAttribute('aria-pressed', x === b));
      $('[data-next]', box).disabled = false; App.haptic(8);
    }));
    const back = $('[data-back]', box); back && back.addEventListener('click', () => { EL.step--; elRender(s); });
    $('[data-next]', box).addEventListener('click', () => { EL.step++; elRender(s); if (EL.step === 3) elDone(s); });
    return;
  }
}
function elDone(s) {
  const box = $('.pb-el', s.body);
  const msg = t(EL.ans[2] === 0 ? 'pb.el.msg2' : 'pb.el.msg1');
  box.innerHTML = `<div class="pb-done pb-anim-in">
      <div class="pb-done__head"><span class="pb-stamp pb-stamp--sm">${icon('send', 'pb-ic-send')}</span><div><h3 class="h3">${T('pb.el.doneT')}</h3><p class="muted small">${T('pb.el.doneP')}</p></div></div>
      <div class="pb-phonecrop"></div>
      <p class="tiny muted pb-center">${T('pb.el.demo')}</p>
    </div>
    ${sfoot(`<button type="button" class="btn btn--ghost" data-book>${icon('calendar')}${T('pb.ch.act.book')}</button><button type="button" class="btn btn--primary pb-grow" data-close-sheet>${T('pb.done')}</button>`)}`;
  const ph = phoneChat(msg); $('.pb-phonecrop', box).append(ph);
  const stamp = $('.pb-stamp', box); stamp.classList.add('is-in');
  setTimeout(() => App.fx.burstAt(stamp, { count: 34 }), App.motion.reduced ? 0 : 380);
  ph.pbRun();
  $('[data-close-sheet]', box).addEventListener('click', () => s.close());
  $('[data-book]', box).addEventListener('click', () => { s.close(); setTimeout(() => openBooking(), 260); });
  s.body.scrollTop = 0;
}

/* =====================================================================
   WAITLIST + CHECK MY PLACE
   ===================================================================== */
const WL = { ref: null, group: 'big', name: '' };
function queueHTML(pos) {
  const looks = [{ skin: 2, hair: 'curly', hc: 0, bg: 3, shirt: SHIRT[2] }, { skin: 0, hair: 'bob', hc: 4, bg: 0, shirt: SHIRT[4] }, { skin: 1, hair: 'pigtails', hc: 2, bg: 5, shirt: SHIRT[0], bow: true }];
  let out = `<div class="pb-queue" role="img" aria-label="${esc(t('pb.wl.place', { n: pos }))}"><span class="pb-queue__gate">${icon('castle')}<span>${esc(t('pb.wl.gate'))}</span></span><span class="pb-queue__trail" aria-hidden="true"></span>`;
  for (let i = 1; i <= pos; i++) {
    const me = i === pos;
    out += `<span class="pb-queue__p ${me ? 'is-me' : ''}" style="--i:${i}">${me ? `<span class="pb-queue__crown">${sp()}</span>` : ''}${App.avatarEl(me ? looks[2] : looks[(i - 1) % 2], me ? 58 : 46, { label: '' })}<b class="tnum">${me ? esc(t('pb.wl.you')) : i}</b></span>`;
  }
  return out + '</div>';
}
function openWaitlist(group = 'big') {
  WL.group = group;
  const s = openSheet('wait', { titleKey: 'pb.wl.title', content: '<div class="pb-wl"></div>' });
  const box = $('.pb-wl', s.body);
  box.innerHTML = `<form class="stack pb-form" style="--gap:16px" novalidate>
      <p class="muted small">${T('pb.wl.intro')}</p>
      <div class="field"><label for="pb-wl-n">${T('pb.wl.child')}</label><input class="input" id="pb-wl-n" autocomplete="off" required><span class="pb-err" hidden>${T('pb.wl.errChild')}</span></div>
      <div class="field"><label for="pb-wl-d">${T('pb.wl.dob')}</label><input class="input" id="pb-wl-d" type="date" max="${todayIso()}"></div>
      <div class="field"><span class="label">${T('pb.wl.group')}</span><div class="chips" role="group">${App.data.groups.map(g => `<button type="button" class="chip" data-g="${g.id}" aria-pressed="${g.id === WL.group}">${T('pb.g.' + g.id)}</button>`).join('')}</div></div>
      ${sfoot(`<button type="submit" class="btn btn--primary btn--block">${icon('hourglass')}${T('pb.wl.submit')}</button>`)}
    </form>`;
  const form = $('form', box);
  const pickG = id => { WL.group = id; $$('[data-g]', box).forEach(b => b.setAttribute('aria-pressed', b.dataset.g === id)); };
  $$('[data-g]', box).forEach(b => b.addEventListener('click', () => pickG(b.dataset.g)));
  $('#pb-wl-d', box).addEventListener('change', e => { const g = groupFor(monthsSince(e.target.value)); if (['baby', 'young', 'big'].includes(g)) pickG(g); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#pb-wl-n', box); const ok = n.value.trim().length > 1;
    n.setAttribute('aria-invalid', !ok); $('.pb-err', box).hidden = ok;
    if (!ok) { n.focus(); return; }
    WL.name = n.value.trim(); WL.ref = 'CN-' + (4000 + Math.floor(Math.random() * 5000));
    queueResult(s, box, 3, 'pb.wl.wa');
  });
  return s;
}
function queueResult(s, box, pos, noteKey) {
  box.innerHTML = `<div class="pb-done pb-anim-in">
      <span class="tag tag--pink">${icon('hourglass')}${T('pb.g.' + WL.group)}${WL.name ? ' · ' + esc(WL.name) : ''}</span>
      <h3 class="pb-place">${esc(t('pb.wl.place', { n: pos }))}</h3>
      ${queueHTML(pos)}
      <p class="pb-note">${icon('chat-text')}${T(noteKey)}</p>
      ${WL.ref ? `<div class="pb-ref"><span class="muted small">${T('pb.wl.ref')}</span><bdi dir="ltr" class="pb-ref__n tnum">${WL.ref}</bdi><button type="button" class="btn btn--soft btn--sm" data-copy>${icon('copy')}${T('pb.wl.copy')}</button></div>` : ''}
      <span class="demo-tag">${esc(t('core.example'))}</span>
    </div>
    ${sfoot(`<button type="button" class="btn btn--primary btn--block" data-close-sheet>${T('pb.done')}</button>`)}`;
  $('[data-close-sheet]', box).addEventListener('click', () => s.close());
  const cp = $('[data-copy]', box);
  cp && cp.addEventListener('click', async () => { try { await navigator.clipboard.writeText(WL.ref); } catch (e) { /* demo */ } App.ui.toast(t('pb.wl.copied'), { icon: 'copy' }); });
  const q = $('.pb-queue', box); requestAnimationFrame(() => q.classList.add('is-go'));
  setTimeout(() => App.fx.burstAt($('.pb-queue__p.is-me', box), { count: 30 }), App.motion.reduced ? 0 : 200 + pos * 220);
  s.body.scrollTop = 0;
}
function openCheck() {
  const s = openSheet('check', { titleKey: 'pb.ck.title', content: '<div class="pb-wl"></div>' });
  const box = $('.pb-wl', s.body);
  box.innerHTML = `<form class="stack pb-form" style="--gap:14px" novalidate>
      <div class="field"><label for="pb-ck-r">${T('pb.ck.label')}</label><input class="input pb-ltr-in" id="pb-ck-r" dir="ltr" autocomplete="off" placeholder="CN-4827" value="${WL.ref || ''}"><span class="hint">${T('pb.ck.hint')}</span></div>
      ${sfoot(`<button type="submit" class="btn btn--primary btn--block">${icon('search')}${T('pb.ck.btn')}</button>`)}
    </form>`;
  $('form', box).addEventListener('submit', e => {
    e.preventDefault(); const v = $('#pb-ck-r', box).value.trim();
    WL.ref = v ? v.toUpperCase() : 'CN-4827';
    queueResult(s, box, 2, 'pb.ck.moved');
  });
  return s;
}

/* =====================================================================
   BOOKING (visit)
   ===================================================================== */
const SLOTS = ['09:00', '10:30', '15:30'];
const FULL = new Set([2, 6]);
const slotTaken = (di, si) => (di * 5 + si * 7) % 6 === 1;
const BK = { s: null, day: null, slot: null, name: '', phone: '', lang: 'he', done: false, days: [] };
function bkDays() {
  const days = []; const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + 1);
  while (days.length < 10) { if (d.getDay() <= 4) days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return days;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function openBooking(opts = {}) {
  Object.assign(BK, { day: null, slot: null, name: '', phone: '', lang: lang(), done: false, days: bkDays() });
  if (opts.day != null) BK.day = opts.day;
  const s = openSheet('book', { titleKey: 'pb.bk.title', content: '<div class="pb-bk"></div>' });
  BK.s = s; bkRender(); return s;
}
function bkCalendar() {
  const days = BK.days, first = days[0], last = days[days.length - 1];
  const start = new Date(first); start.setDate(start.getDate() - start.getDay());
  const mon = d => cap(App.fmt.date(d, { month: 'long' }));
  const head = first.getMonth() === last.getMonth() ? `${mon(first)} ${first.getFullYear()}` : `${mon(first)}–${mon(last)} ${last.getFullYear()}`;
  const wd = [0, 1, 2, 3, 4].map(i => { const d = new Date(start); d.setDate(d.getDate() + i); return `<span class="pb-cal__wd" aria-hidden="true">${esc(App.fmt.weekday(d))}</span>`; }).join('');
  let cells = ''; const cur = new Date(start); const today = new Date().toDateString();
  while (cur <= last || cur.getDay() !== 0) {
    if (cur.getDay() <= 4) {
      const idx = days.findIndex(x => x.toDateString() === cur.toDateString());
      const monthTag = cur.getDate() === 1 ? `<small>${esc(App.fmt.date(cur, { month: 'short' }))}</small>` : '';
      if (idx < 0) cells += `<span class="pb-cal__day is-off ${cur.toDateString() === today ? 'is-today' : ''}" aria-hidden="true"><b>${cur.getDate()}</b>${cur.toDateString() === today ? `<small>${esc(t('pb.bk.today'))}</small>` : monthTag}</span>`;
      else {
        const full = FULL.has(idx);
        const lab = App.fmt.date(cur, { weekday: 'long', day: 'numeric', month: 'long' }) + (full ? ', ' + t('pb.bk.full') : '');
        cells += `<button type="button" class="pb-cal__day" data-di="${idx}" ${full ? 'disabled' : ''} aria-pressed="${BK.day === idx}" aria-label="${esc(lab)}"><b>${cur.getDate()}</b>${full ? `<small>${esc(t('pb.bk.full'))}</small>` : monthTag}</button>`;
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return `<div class="pb-cal"><div class="pb-cal__head">${icon('calendar')}<span>${esc(head)}</span></div><div class="pb-cal__grid">${wd}${cells}</div></div>`;
}
function bkSlots() {
  if (BK.day == null) return '';
  return `<div class="chips pb-slots" role="group" aria-label="${esc(t('pb.bk.slot'))}">${SLOTS.map((x, si) => { const tk = slotTaken(BK.day, si); return `<button type="button" class="chip pb-slot" data-si="${si}" ${tk ? 'disabled' : ''} aria-pressed="${BK.slot === si}">${icon('clock')}<span class="tnum">${x}</span>${tk ? `<small>${esc(t('pb.bk.taken'))}</small>` : ''}</button>`; }).join('')}</div>`;
}
function bkRender() {
  const s = BK.s; if (!s || s.closed) return;
  const box = $('.pb-bk', s.body); if (!box) return;
  if (BK.done) return;
  box.innerHTML = `
    <div class="pb-bk__sec"><p class="pb-sec-t"><b>1</b>${T('pb.bk.day')}</p>${bkCalendar()}</div>
    <div class="pb-bk__sec" data-sec="slot" ${BK.day == null ? 'hidden' : ''}><p class="pb-sec-t"><b>2</b>${T('pb.bk.slot')} <span class="demo-tag">${esc(t('pb.bk.slotsEx'))}</span></p><div data-slots>${bkSlots()}</div></div>
    <form class="pb-bk__sec pb-form" data-sec="you" ${BK.slot == null ? 'hidden' : ''} novalidate>
      <p class="pb-sec-t"><b>3</b>${T('pb.bk.you')}</p>
      <div class="pb-two">
        <div class="field"><label for="pb-bk-n">${T('pb.name')}</label><input class="input" id="pb-bk-n" autocomplete="given-name" value="${esc(BK.name)}"><span class="pb-err" hidden>${T('pb.errName')}</span></div>
        <div class="field"><label for="pb-bk-p">${T('pb.phone')}</label><input class="input pb-ltr-in" id="pb-bk-p" type="tel" inputmode="tel" dir="ltr" autocomplete="tel" placeholder="${esc(t('pb.phonePh'))}" value="${esc(BK.phone)}"><span class="pb-err" hidden>${T('pb.errPhone')}</span></div>
      </div>
      <div class="pb-langrow"><span class="label">${T('pb.msgLang')}</span><div class="seg" role="group" aria-label="${esc(t('pb.msgLang'))}"><button type="button" data-l="he" aria-pressed="${BK.lang === 'he'}" lang="he">עברית</button><button type="button" data-l="ru" aria-pressed="${BK.lang === 'ru'}" lang="ru">Русский</button></div></div>
      <button type="submit" hidden></button>
    </form>
    ${sfoot(`<button type="button" class="btn btn--primary btn--block pb-bk__go" data-confirm ${BK.day == null || BK.slot == null ? 'disabled' : ''}>${icon('check')}<span>${esc(t(BK.day == null || BK.slot == null ? 'pb.bk.pick' : 'pb.bk.confirm'))}</span></button>`)}`;
  bkBind(box);
}
function bkBind(box) {
  const s = BK.s;
  const go = $('[data-confirm]', box);
  const refreshGo = () => { const ok = BK.day != null && BK.slot != null; go.disabled = !ok; $('span', go).textContent = t(ok ? 'pb.bk.confirm' : 'pb.bk.pick'); };
  const bindSlots = () => $$('.pb-slot', box).forEach(b => b.addEventListener('click', () => {
    BK.slot = +b.dataset.si; $$('.pb-slot', box).forEach(x => x.setAttribute('aria-pressed', x === b)); App.haptic(8);
    const you = $('[data-sec="you"]', box); const first = you.hidden; you.hidden = false;
    if (first) { you.classList.add('pb-anim-in'); setTimeout(() => scrollSheetTo(s, you), 60); }
    refreshGo();
  }));
  $$('.pb-cal__day[data-di]', box).forEach(b => b.addEventListener('click', () => {
    BK.day = +b.dataset.di; $$('.pb-cal__day[data-di]', box).forEach(x => x.setAttribute('aria-pressed', x === b)); App.haptic(8);
    if (BK.slot != null && slotTaken(BK.day, BK.slot)) BK.slot = null;
    const sec = $('[data-sec="slot"]', box); const first = sec.hidden; sec.hidden = false;
    $('[data-slots]', box).innerHTML = bkSlots(); bindSlots();
    if (first) sec.classList.add('pb-anim-in');
    if (BK.slot == null) { $('[data-sec="you"]', box).hidden = true; }
    refreshGo();
  }));
  bindSlots();
  const n = $('#pb-bk-n', box), p = $('#pb-bk-p', box);
  n.addEventListener('input', () => { BK.name = n.value; if (n.value.trim().length > 1) { n.removeAttribute('aria-invalid'); n.nextElementSibling.hidden = true; } });
  p.addEventListener('input', () => { BK.phone = p.value; if (phoneOk(p.value)) { p.removeAttribute('aria-invalid'); p.nextElementSibling.hidden = true; } });
  p.addEventListener('blur', () => { if (phoneOk(p.value)) { p.value = phoneFmt(p.value); BK.phone = p.value; } });
  $$('[data-l]', box).forEach(b => b.addEventListener('click', () => { BK.lang = b.dataset.l; $$('[data-l]', box).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  $('form', box).addEventListener('submit', e => { e.preventDefault(); go.click(); });
  go.addEventListener('click', async () => {
    if (BK.day == null || BK.slot == null) return;
    const okN = n.value.trim().length > 1, okP = phoneOk(p.value);
    n.toggleAttribute('aria-invalid', !okN); n.nextElementSibling.hidden = okN;
    p.toggleAttribute('aria-invalid', !okP); p.nextElementSibling.hidden = okP;
    if (!okN || !okP) { const bad = !okN ? n : p; scrollSheetTo(s, bad.closest('.field')); try { bad.focus({ preventScroll: true }); } catch (e) { } return; }
    BK.name = n.value.trim(); BK.phone = phoneFmt(p.value);
    go.disabled = true; go.classList.add('is-busy'); go.innerHTML = `${sp()}<span>${esc(t('pb.bk.sending'))}</span>`;
    await App.sleep(App.motion.reduced ? 0 : 650);
    bkDone();
  });
}
function bkMessage() {
  const d = BK.days[BK.day], time = SLOTS[BK.slot];
  if (BK.lang === 'ru') {
    const ds = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
    return `Здравствуйте, ${BK.name}! Экскурсия в сад «Синдерелла» назначена на ${ds}, ${time}.\nАдрес: ${ADDR.ru}.\nДо встречи!`;
  }
  const ds = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  return `היי ${BK.name}, הסיור שלכם בגן סינדרלה נקבע ל${ds} בשעה ${time}.\nהכתובת: ${ADDR.he}.\nנתראה!`;
}
function bkDone() {
  const s = BK.s; if (!s || s.closed) return; BK.done = true;
  const box = $('.pb-bk', s.body); const d = BK.days[BK.day];
  const row = (ic, main, sub = '') => `<div class="rowi"><span class="icon-bubble">${icon(ic)}</span><div class="rowi__main"><div class="rowi__title">${main}</div>${sub ? `<div class="rowi__sub">${sub}</div>` : ''}</div></div>`;
  box.innerHTML = `<div class="pb-done pb-done--bk pb-anim-in">
      <div class="pb-done__head"><span class="pb-stamp">${icon('check')}<b>${T('pb.bk.stamp')}</b></span><div><h3 class="h3">${esc(t('pb.bk.doneT', { name: BK.name }))}</h3><p class="muted small">${T('pb.bk.doneP')}</p></div></div>
      <div class="pb-done__grid">
        <div class="pb-summary rows">
          ${row('calendar', esc(cap(App.fmt.date(d, { weekday: 'long', day: 'numeric', month: 'long' }))), `<span class="tnum">${SLOTS[BK.slot]}</span>`)}
          ${row('pin', esc(App.L(ADDR)), `<a href="${MAPS}" target="_blank" rel="noopener">Google Maps</a>`)}
          ${row('user', esc(BK.name), `<bdi dir="ltr" class="tnum">${esc(BK.phone)}</bdi>`)}
          <div class="rowi pb-remind"><span class="icon-bubble icon-bubble--pink">${icon('bell')}</span><div class="rowi__main"><div class="rowi__title">${T('pb.bk.remind')}</div></div></div>
        </div>
        <div class="pb-phonewrap"><p class="tiny muted pb-center">${T('pb.bk.sent')}</p><div class="pb-phonecrop"></div></div>
      </div>
    </div>
    ${sfoot(`<button type="button" class="btn btn--primary btn--block" data-close-sheet>${sp()}${T('pb.done')}</button>`)}`;
  const ph = phoneChat(bkMessage(), { size: 232 });
  $('.pb-phonecrop', box).append(ph);
  const stamp = $('.pb-stamp', box); stamp.classList.add('is-in');
  setTimeout(() => App.fx.burstAt(stamp, { count: 40, speed: [140, 420] }), App.motion.reduced ? 0 : 420);
  ph.pbRun();
  $('[data-close-sheet]', box).addEventListener('click', () => s.close());
  s.body.scrollTop = 0;
}

/* =====================================================================
   REGISTRATION (3 steps · glass-slipper progress)
   ===================================================================== */
const RG = {};
const rgReset = pre => Object.assign(RG, { s: null, step: 0, name: '', dob: '', group: null, months: null, pname: '', phone: '', lang: lang(), docs: [null, null, null], pre: pre || null, done: false, lastGroup: null });
let slipSeq = 0;
function slipperSVG() {
  const id = 'pb-slc' + (++slipSeq);
  return `<svg viewBox="0 0 250 170" class="pb-slipper pb-slipper--prog" aria-hidden="true">
    <defs><clipPath id="${id}"><path transform="translate(15 14)" d="${SLIP_D}"/></clipPath></defs>
    <ellipse cx="128" cy="158" rx="96" ry="7" fill="#1B1A4B" opacity=".08"/>
    <use href="#pb-slip-body" x="18" y="17" width="220" height="140" fill="#7FCBF3"/>
    <use href="#pb-slip-body" x="15" y="14" width="220" height="140" fill="#D6F0FE"/>
    <g clip-path="url(#${id})"><g class="pb-liq pb-liq--prog" style="--lvl:.05">
      <g class="pb-liq__wave"><path d="M0 0c30 0 30-8 55-8s25 8 55 8 30-8 55-8 25 8 55 8 30-8 55-8 25 8 55 8 30-8 55-8 25 8 55 8V200H0Z" fill="url(#pb-liq-g)"/></g>
      <g class="pb-bubbles" fill="#fff"><circle cx="60" cy="30" r="2.6"/><circle cx="100" cy="50" r="2"/><circle cx="140" cy="24" r="3"/><circle cx="180" cy="46" r="2.2"/><circle cx="80" cy="70" r="1.8"/></g>
    </g></g>
    <path d="M153 66c12-1 22-6 28-14 6-9 9-20 10-30 6 5 8 18 6 30" fill="#BFE6FC" opacity=".9"/>
    <g fill="none" stroke="#fff" stroke-linecap="round"><path d="M45 108c16-6 34-10 50-17" stroke-width="4.5"/><path d="M205 42c3 8 3 18 1 26" stroke-width="3.5" opacity=".9"/></g>
    <path d="M175 86l14-4c2 18 0 40-4 58h-6c1-18 0-36-4-54Z" fill="#9ED8F7"/><path d="M175 86l14-4c2 18 0 40-4 58h-4c1-18-1-36-6-54Z" fill="#E4F5FE"/>
    <g clip-path="url(#${id})"><rect class="pb-shine" x="-60" y="0" width="26" height="170" fill="#fff" opacity=".6"/></g>
    <g class="pb-slip-sp"><use href="#i-sparkle" x="214" y="4" width="20" height="20" style="color:#FFB547"/><use href="#i-sparkle" x="34" y="50" width="14" height="14" style="color:#E8048C"/><use href="#i-sparkle" x="120" y="0" width="12" height="12" style="color:#01AEF2"/></g>
  </svg>`;
}
function openRegistration(opts = {}) {
  rgReset(opts.group);
  const s = openSheet('reg', { titleKey: 'pb.rg.title', size: 'full', content: `<div class="pb-rg">
      <div class="pb-rg__top"><div class="pb-rg__slip">${slipperSVG()}</div><div class="pb-rg__meta"><div class="pb-rg__prog"></div><p class="pb-rg__title"></p></div></div>
      <div class="pb-rg__body"></div><div class="pb-rg__foot"></div></div>` });
  RG.s = s; rgRender(); return s;
}
function rgLevel(v) { const l = RG.s && $('.pb-liq', RG.s.body); if (l) l.style.setProperty('--lvl', v); }
function rgRender() {
  const s = RG.s; if (!s || s.closed) return;
  const body = $('.pb-rg__body', s.body), foot = $('.pb-rg__foot', s.body);
  if (RG.done) return;
  $('.pb-rg__prog', s.body).innerHTML = progressBar(RG.step, 3);
  const tk = ['pb.rg.t1', 'pb.rg.t2', 'pb.rg.t3'][RG.step];
  $('.pb-rg__title', s.body).innerHTML = T(tk);
  rgLevel([.05, .36, .68][RG.step]);
  if (RG.step === 0) {
    body.innerHTML = `<div class="stack pb-anim-in" style="--gap:16px">
      ${RG.pre ? `<span class="tag tag--pink pb-self-start">${icon('star')}${esc(t('pb.rg.reserve', { g: groupName(RG.pre) }))}</span>` : ''}
      <div class="field"><label for="pb-rg-n">${T('pb.rg.cname')}</label><input class="input" id="pb-rg-n" autocomplete="off" value="${esc(RG.name)}"></div>
      <div class="field"><label for="pb-rg-d">${T('pb.rg.dob')}</label><input class="input" id="pb-rg-d" type="date" max="${todayIso()}" value="${esc(RG.dob)}"></div>
      <button type="button" class="link-btn pb-self-start pb-sample" data-sample>${icon('wand')}${T('pb.rg.sample')}</button>
      <div class="pb-gpick-wrap">
        <div class="pb-gpick-h"><span class="label">${T('pb.rg.groupH')}</span><span class="demo-tag">${esc(t('core.example'))}</span></div>
        <div class="pb-gpick" role="group" aria-label="${esc(t('pb.rg.groupH'))}">
          <span class="pb-gpick__wand" aria-hidden="true">${sp()}</span>
          ${['baby', 'young', 'big'].map(g => `<span class="pb-gp ${RG.group === g ? 'is-chosen' : ''}" data-g="${g}" aria-current="${RG.group === g}">${icon('check', 'pb-gp__ck')}<span>${esc(groupName(g))}</span></span>`).join('')}
        </div>
        <p class="pb-gnote small" aria-live="polite"></p>
        <p class="tiny muted">${T('pb.rg.rule')}</p>
      </div></div>`;
    foot.innerHTML = sfoot(`<button type="button" class="btn btn--primary btn--block" data-next>${T('pb.next')}${icon('arrow', 'ic--dir')}</button>`);
    const n = $('#pb-rg-n', body), d = $('#pb-rg-d', body);
    const upd = (animate) => {
      RG.name = n.value; RG.dob = d.value; RG.months = monthsSince(d.value);
      const g = groupFor(RG.months); RG.group = ['baby', 'young', 'big'].includes(g) ? g : null;
      const note = $('.pb-gnote', body);
      note.className = 'pb-gnote small' + (g === 'older' || g === 'future' ? ' is-warn' : '');
      note.textContent = g === 'older' ? t('pb.rg.older') : g === 'future' ? t('pb.rg.future') : RG.group ? t('pb.rg.age', { m: RG.months }) + ' · ' + t('pb.rg.auto') + (RG.pre && RG.pre !== RG.group ? '. ' + t('pb.rg.mismatch', { g: groupName(RG.group) }) : '') : '';
      rgPick(body, animate);
      $('[data-next]', foot).disabled = !(RG.name.trim().length > 1 && RG.group);
    };
    n.addEventListener('input', () => upd(false));
    d.addEventListener('input', () => upd(true)); d.addEventListener('change', () => upd(true));
    $('[data-sample]', body).addEventListener('click', () => { n.value = t('pb.rg.sampleName'); d.value = isoMonthsAgo(15); upd(true); });
    RG.lastGroup = null; upd(false); RG.lastGroup = RG.group; rgPick(body, false);
    $('[data-next]', foot).addEventListener('click', () => { RG.step = 1; rgRender(); });
  } else if (RG.step === 1) {
    body.innerHTML = `<div class="stack pb-anim-in" style="--gap:16px">
      <div class="field"><label for="pb-rg-pn">${T('pb.rg.pname')}</label><input class="input" id="pb-rg-pn" autocomplete="name" value="${esc(RG.pname)}"><span class="pb-err" hidden>${T('pb.errName')}</span></div>
      <div class="field"><label for="pb-rg-pp">${T('pb.rg.pphone')}</label><input class="input pb-ltr-in" id="pb-rg-pp" type="tel" inputmode="tel" dir="ltr" autocomplete="tel" placeholder="${esc(t('pb.phonePh'))}" value="${esc(RG.phone)}"><span class="pb-err" hidden>${T('pb.errPhone')}</span></div>
      <div class="pb-langrow"><span class="label">${T('pb.msgLang')}</span><div class="seg" role="group" aria-label="${esc(t('pb.msgLang'))}"><button type="button" data-l="he" lang="he" aria-pressed="${RG.lang === 'he'}">עברית</button><button type="button" data-l="ru" lang="ru" aria-pressed="${RG.lang === 'ru'}">Русский</button></div></div>
      <button type="button" class="link-btn pb-self-start pb-sample" data-sample>${icon('wand')}${T('pb.rg.sample')}</button>
    </div>`;
    foot.innerHTML = sfoot(`<button type="button" class="btn btn--ghost" data-back>${icon('back', 'ic--dir')}${T('pb.back')}</button><button type="button" class="btn btn--primary pb-grow" data-next>${T('pb.next')}${icon('arrow', 'ic--dir')}</button>`);
    const pn = $('#pb-rg-pn', body), pp = $('#pb-rg-pp', body);
    pn.addEventListener('input', () => { RG.pname = pn.value; });
    pp.addEventListener('input', () => { RG.phone = pp.value; });
    pp.addEventListener('blur', () => { if (phoneOk(pp.value)) { pp.value = phoneFmt(pp.value); RG.phone = pp.value; } });
    $$('[data-l]', body).forEach(b => b.addEventListener('click', () => { RG.lang = b.dataset.l; $$('[data-l]', body).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
    $('[data-sample]', body).addEventListener('click', () => { pn.value = RG.pname = t('pb.rg.sampleParent'); pp.value = RG.phone = '052-123-4567'; });
    $('[data-back]', foot).addEventListener('click', () => { RG.step = 0; rgRender(); });
    $('[data-next]', foot).addEventListener('click', () => {
      const okN = pn.value.trim().length > 1, okP = phoneOk(pp.value);
      pn.toggleAttribute('aria-invalid', !okN); pn.nextElementSibling.hidden = okN;
      pp.toggleAttribute('aria-invalid', !okP); pp.nextElementSibling.hidden = okP;
      if (!okN || !okP) { (okN ? pp : pn).focus(); return; }
      RG.step = 2; rgRender();
    });
  } else {
    const docs = ['pb.rg.d1', 'pb.rg.d2', 'pb.rg.d3'];
    body.innerHTML = `<div class="stack pb-anim-in" style="--gap:12px">
      <p class="muted small">${T('pb.rg.docsP')}</p>
      ${docs.map((k, i) => `<div class="pb-doc ${RG.docs[i] ? 'is-ok' : ''}" data-i="${i}">
        <span class="pb-doc__ic">${icon('doc')}<span class="pb-doc__ck">${icon('check')}</span></span>
        <div class="pb-doc__main"><p class="pb-doc__t">${T(k)}${i === 2 ? ` <span class="pb-doc__opt">${T('pb.rg.opt')}</span>` : ''}</p><p class="pb-doc__s">${RG.docs[i] ? `<bdi>${esc(RG.docs[i])}</bdi>` : T('pb.rg.need')}</p><span class="pb-doc__bar"><i></i></span></div>
        <div class="pb-doc__acts">
          <label class="btn btn--soft btn--sm pb-doc__up">${icon('upload')}<span data-i18n="pb.rg.up">${esc(t('pb.rg.up'))}</span><input type="file" class="sr-only" accept="image/*,.pdf"></label>
          <button type="button" class="link-btn pb-doc__sample" data-sample>${T('pb.rg.sampleFile')}</button>
        </div></div>`).join('')}
      </div>`;
    foot.innerHTML = sfoot(`<button type="button" class="btn btn--ghost" data-back>${icon('back', 'ic--dir')}${T('pb.back')}</button><button type="button" class="btn btn--primary pb-grow" data-send>${icon('send', 'pb-ic-send')}${T('pb.rg.send')}</button>`);
    const send = $('[data-send]', foot);
    const refresh = () => { send.disabled = !(RG.docs[0] && RG.docs[1]); };
    $$('.pb-doc', body).forEach(row => {
      const i = +row.dataset.i;
      const take = name => {
        RG.docs[i] = name; row.classList.remove('is-ok'); row.classList.add('is-up');
        $('.pb-doc__s', row).innerHTML = `<bdi>${esc(name)}</bdi>`;
        setTimeout(() => { row.classList.remove('is-up'); row.classList.add('is-ok'); App.fx.burstAt($('.pb-doc__ic', row), { count: 12, speed: [60, 180] }); App.haptic(10); refresh(); }, App.motion.reduced ? 0 : 750);
        refresh();
      };
      $('input[type=file]', row).addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) take(f.name); });
      $('[data-sample]', row).addEventListener('click', () => take(['teudat-zehut-sefach.pdf', 'pinkas-hisunim.jpg', 'ishur-zakaut.pdf'][i]));
    });
    refresh();
    $('[data-back]', foot).addEventListener('click', () => { RG.step = 1; rgRender(); });
    send.addEventListener('click', () => { if (!send.disabled) rgDone(); });
  }
  s.body.scrollTop = 0;
}
function rgPick(body, animate) {
  const wrap = $('.pb-gpick', body); if (!wrap) return;
  const wand = $('.pb-gpick__wand', wrap);
  $$('.pb-gp', wrap).forEach(p => { const on = p.dataset.g === RG.group; p.classList.toggle('is-chosen', on); p.setAttribute('aria-current', on); });
  const chosen = RG.group && $(`.pb-gp[data-g="${RG.group}"]`, wrap);
  wrap.classList.toggle('has-pick', !!chosen);
  if (chosen) {
    wand.style.setProperty('--x', (chosen.offsetLeft + chosen.offsetWidth / 2) + 'px');
    if (animate && RG.group !== RG.lastGroup) {
      chosen.classList.remove('is-pop'); void chosen.offsetWidth; chosen.classList.add('is-pop');
      setTimeout(() => App.fx.burstAt(chosen, { count: 22, speed: [90, 260] }), App.motion.reduced ? 0 : 260);
      App.haptic(14);
    }
  }
  RG.lastGroup = RG.group;
}
function rgDone() {
  const s = RG.s; RG.done = true;
  const svg = $('.pb-slipper', s.body);
  $('.pb-rg', s.body).classList.add('is-done');
  rgLevel(1); svg.classList.add('is-full');
  $('.pb-rg__prog', s.body).innerHTML = `<div class="pb-prog"><span class="pb-prog__t">${T('pb.rg.doneT')}</span><span class="pb-prog__dots" aria-hidden="true"><i class="is-done"></i><i class="is-done"></i><i class="is-done"></i></span></div>`;
  $('.pb-rg__title', s.body).innerHTML = '';
  setTimeout(() => { App.fx.burstAt(svg, { count: 60, speed: [160, 480], life: [800, 1500] }); App.haptic(20); }, App.motion.reduced ? 0 : 700);
  $('.pb-rg__body', s.body).innerHTML = `<div class="pb-done pb-anim-in">
      <h3 class="pb-place">${T('pb.rg.doneT')}</h3>
      <p class="muted">${esc(t('pb.rg.doneP', { name: RG.pname || RG.name }))}</p>
      <ol class="pb-next">${['pb.rg.n1', 'pb.rg.n2', 'pb.rg.n3'].map((k, i) => `<li style="--i:${i}"><b>${i + 1}</b>${T(k)}</li>`).join('')}</ol>
      <span class="demo-tag">${esc(t('core.example'))}</span>
    </div>`;
  $('.pb-rg__foot', s.body).innerHTML = sfoot(`<button type="button" class="btn btn--primary btn--block" data-close-sheet>${sp()}${T('pb.done')}</button>`);
  $('[data-close-sheet]', s.body).addEventListener('click', () => s.close());
  s.body.scrollTop = 0;
}

/* =====================================================================
   ASSISTANT "שאלו אותנו"
   ===================================================================== */
const TOPICS = ['hours', 'food', 'clubs', 'discount', 'adapt', 'address', 'visit'];
const ACTS = { discount: ['elig'], adapt: ['book'], address: ['maps'], visit: ['book'], price: ['wa', 'elig'], register: ['reg'], places: ['avail'], contact: ['wa'], fallback: ['wa', 'book'], ages: ['avail'] };
const KW = [
  ['adapt', ['הסתגל', 'להסתגל', 'התאקלמ', 'פרידה', 'בוכה', 'בכי', 'מתרגל', 'адаптац', 'привык', 'плач', 'расстава']],
  ['discount', ['הנחה', 'סבסוד', 'זכאות', 'זכאי', 'מוכר', 'מפוקח', 'скидк', 'субсид', 'льгот', 'право на']],
  ['price', ['מחיר', 'עולה', 'עלות', 'תשלום', 'שכר לימוד', 'цен', 'стоит', 'стоимост', 'оплат', 'платить', 'сколько стоит']],
  ['food', ['אוכל', 'אוכלים', 'ארוח', 'מטבח', 'תפריט', 'דיאטנ', 'מנחה', 'צהריים', 'בוקר', 'מבשל', 'еда', 'еду', 'еды', 'кормят', 'питан', 'кухн', 'меню', 'диетолог', 'завтрак', 'обед', 'полдник']],
  ['clubs', ['חוג', 'מוזיק', 'ספורט', 'טבע', 'חיות', 'פעילו', 'кружк', 'музык', 'спорт', 'природ', 'животн', 'занят']],
  ['holidays', ['חג', 'חופש', 'חול המועד', 'סוכות', 'פסח', 'праздн', 'каникул', 'отпуск', 'холь', 'суккот', 'песах']],
  ['visit', ['סיור', 'לבקר', 'ביקור', 'לראות את הגן', 'להגיע לראות', 'экскурс', 'посмотреть', 'посетить', 'визит', 'прийти']],
  ['register', ['הרשמה', 'להירשם', 'רישום', 'נרשמ', 'записат', 'запись', 'регистрац', 'записа']],
  ['places', ['מקום פנוי', 'מקומות', 'רשימת המתנה', 'תור', 'свободн', 'места', 'место', 'очеред', 'ожидани']],
  ['address', ['כתובת', 'איפה', 'מיקום', 'להגיע', 'רחוב', 'אדרס', 'адрес', 'где', 'находит', 'доехать', 'добрат', 'улиц']],
  ['ages', ['גיל', 'גילאי', 'קבוצ', 'תינוק', 'возраст', 'лет', 'групп', 'младен', 'малыш']],
  ['contact', ['וואטסאפ', 'ווטסאפ', 'whatsapp', 'טלפון', 'ליצור קשר', 'לדבר עם', 'ватсап', 'вотсап', 'телефон', 'связат', 'контакт']],
  ['hours', ['שעות', 'שעה', 'פתוח', 'פותח', 'סוגר', 'עד מתי', 'מתי', 'שישי', 'הארכ', 'час', 'время', 'открыт', 'работает', 'работаете', 'график', 'до скольк', 'во сколько', 'пятниц', 'продл']],
  ['thanks', ['תודה', 'спасибо', 'благодар']],
  ['hello', ['שלום', 'היי', 'הי ', 'בוקר טוב', 'ערב טוב', 'привет', 'здравств', 'добрый']]
];
function matchTopic(text) {
  const s = ' ' + String(text).toLowerCase().replace(/[֑-ׇ]/g, '').replace(/[?!.,;:״"׳']/g, ' ').replace(/\s+/g, ' ') + ' ';
  for (const [k, words] of KW) if (words.some(w => s.includes(w))) return k;
  return null;
}
const CH = { s: null, log: [], busy: Promise.resolve() };
function chatShell() {
  return `<div class="pb-chat">
    <div class="pb-chat__hello"><span class="brand__logo pb-chat__logo" data-logo></span><div><p class="pb-chat__name">${T('pb.ft.name')}</p><p class="tiny muted"><span class="pb-online"></span>${T('pb.ch.sub')}</p></div></div>
    <div class="pb-chat__log" aria-live="polite"></div>
    <div class="pb-chat__dock">
      <div class="pb-chat__chips" role="group" aria-label="${esc(t('pb.ch.title'))}">${TOPICS.map(k => `<button type="button" class="chip" data-q="${k}">${T('pb.ch.q.' + k)}</button>`).join('')}</div>
      <form class="pb-chat__form"><label class="sr-only" for="pb-ch-in">${T('pb.ch.ph')}</label><input class="input pb-chat__in" id="pb-ch-in" autocomplete="off" placeholder="${esc(t('pb.ch.ph'))}" data-i18n-attr="placeholder:pb.ch.ph" enterkeyhint="send"><button type="submit" class="pb-chat__send" aria-label="${esc(t('pb.ch.send'))}" data-i18n-attr="aria-label:pb.ch.send">${icon('send', 'pb-ic-send')}</button></form>
    </div></div>`;
}
function actHTML(a) {
  if (a === 'maps') return `<a class="btn btn--ghost btn--sm" href="${MAPS}" target="_blank" rel="noopener">${icon('pin')}Google Maps</a>`;
  if (a === 'wa') return WA.map(w => `<a class="btn btn--ghost btn--sm" href="${w.u}" target="_blank" rel="noopener">${icon('chat-text')}WhatsApp <bdi dir="ltr" class="tnum">${w.n}</bdi></a>`).join('');
  return `<button type="button" class="btn btn--soft btn--sm" data-act="${a}">${icon({ elig: 'search', book: 'calendar', reg: 'sparkles', avail: 'users' }[a], a === 'reg' ? 'ic--fill' : '')}${esc(t('pb.ch.act.' + a))}</button>`;
}
function chatAppend(m, animate) {
  if (!CH.s || CH.s.closed) return;
  const log = $('.pb-chat__log', CH.s.body);
  const el = h(`<div class="pb-msg ${m.out ? 'pb-msg--out' : ''}"><div class="bubble ${m.out ? 'bubble--out' : ''} ${animate ? 'is-new' : ''}"></div>${m.acts && m.acts.length ? `<div class="pb-msg__acts ${animate ? 'pb-anim-in' : ''}">${m.acts.map(actHTML).join('')}</div>` : ''}</div>`);
  $('.bubble', el).textContent = m.text;
  log.append(el);
  $$('[data-act]', el).forEach(b => b.addEventListener('click', () => chatAct(b.dataset.act)));
  chatScroll();
}
function chatScroll() { const b = CH.s && CH.s.body; if (!b) return; requestAnimationFrame(() => { try { b.scrollTo({ top: b.scrollHeight, behavior: App.motion.reduced ? 'auto' : 'smooth' }); } catch (e) { b.scrollTop = b.scrollHeight; } }); }
function chatAct(a) {
  const close = () => { if (CH.s) CH.s.close(); };
  if (a === 'elig') { close(); setTimeout(openEligibility, 240); }
  else if (a === 'book') { close(); setTimeout(() => openBooking(), 240); }
  else if (a === 'reg') { close(); setTimeout(() => openRegistration(), 240); }
  else if (a === 'avail') { close(); setTimeout(() => App.scrollTo('#availability'), 300); }
}
function botSay(key, acts, animate = true) {
  CH.busy = CH.busy.then(async () => {
    if (!CH.s || CH.s.closed) return;
    const log = $('.pb-chat__log', CH.s.body); let tb = null;
    if (animate && !App.motion.reduced) { tb = typingBubble(); log.append(tb); chatScroll(); await App.sleep(650 + Math.random() * 450); tb.remove(); }
    const m = { text: t(key), acts: acts || [] }; CH.log.push(m); chatAppend(m, animate);
  });
  return CH.busy;
}
function ask(topic, userText) {
  const text = userText || t('pb.ch.q.' + topic);
  const m = { text, out: true }; CH.log.push(m); chatAppend(m, true);
  return botSay('pb.ch.a.' + (topic || 'fallback'), ACTS[topic || 'fallback']);
}
function openAssistant(topic) {
  const s = openSheet('chat', { titleKey: 'pb.ch.title', content: chatShell(), onClose: () => { CH.s = null; } });
  CH.s = s; App.ui.fillLogos(s.body);
  if (!CH.log.length) botSay('pb.ch.hi', [], true);
  else CH.log.forEach(m => chatAppend(m, false));
  $$('[data-q]', s.body).forEach(b => b.addEventListener('click', () => { ask(b.dataset.q); App.haptic(8); }));
  const form = $('.pb-chat__form', s.body), inp = $('.pb-chat__in', s.body);
  form.addEventListener('submit', e => {
    e.preventDefault(); const v = inp.value.trim(); if (!v) return;
    inp.value = ''; ask(matchTopic(v), v);
  });
  if (topic) setTimeout(() => ask(topic), CH.log.length > 1 ? 200 : 900);
  return s;
}

/* =====================================================================
   MODULE
   ===================================================================== */
const M = App.module('pubBottom', {
  view: 'visitors',
  i18n: { he: HE, ru: RU },
  init(r) {
    root = r;
    // harvest inline Hebrew from the markup so the he dictionary always matches the page
    $$('[data-i18n]', r).forEach(el => { const k = el.getAttribute('data-i18n'); if (k.startsWith('pb.') && !(k in HE)) HE[k] = el.textContent.trim(); });
    $$('[data-i18n-attr]', r).forEach(el => el.getAttribute('data-i18n-attr').split(/[;,]\s*/).forEach(p => { const [a, k] = p.split(':').map(x => x.trim()); if (k && k.startsWith('pb.') && !(k in HE) && el.hasAttribute(a)) HE[k] = el.getAttribute(a); }));
    App.i18n.add({ he: HE });
    renderSeats();
    Plate.init(); initClubs(); Hol.init(); initArt(); Fab.init();
    r.addEventListener('click', e => {
      const b = e.target.closest('[data-pb-book],[data-pb-elig],[data-pb-register],[data-pb-reserve],[data-pb-waitlist],[data-pb-check],[data-pb-ask]');
      if (!b || b.classList.contains('pb-fab')) return;
      if (b.hasAttribute('data-pb-book')) openBooking();
      else if (b.hasAttribute('data-pb-elig')) openEligibility();
      else if (b.hasAttribute('data-pb-register')) openRegistration();
      else if (b.hasAttribute('data-pb-reserve')) openRegistration({ group: b.dataset.pbReserve });
      else if (b.hasAttribute('data-pb-waitlist')) openWaitlist(b.dataset.pbWaitlist);
      else if (b.hasAttribute('data-pb-check')) openCheck();
      else if (b.hasAttribute('data-pb-ask')) openAssistant(b.dataset.pbAsk || undefined);
    });
    App.on('lang', () => {
      if (BK.s && !BK.s.closed && !BK.done) bkRender();
      if (RG.s && !RG.s.closed && !RG.done) rgRender();
      const es = mine.get('elig'); if (es && !es.closed && EL.step < 3) elRender(es);
    });
  },
  onEnter() { root && root.classList.remove('pb-paused'); Fab.update(); },
  onLeave() { root && root.classList.add('pb-paused'); if (Fab.el) Fab.el.classList.remove('is-shown'); },
  reset() {
    closeMine(); CH.log = []; CH.busy = Promise.resolve();
    WL.ref = null; Plate.reset();
  },
  openBooking, openEligibility, openRegistration, openAssistant, openWaitlist, openCheck,
  tour: {
    async booking(ctx) {
      closeMine();
      const onAbort = () => closeMine(); ctx.signal.addEventListener('abort', onAbort, { once: true });
      const f = ctx.fast;
      await ctx.tap('#visit [data-pb-book]', { after: f ? 250 : 560 });
      const s = BK.s; if (!s) return;
      const day = await ctx.waitFor(() => $$('.pb-cal__day[data-di]:not([disabled])', s.body)[1]);
      await ctx.tap(day, { after: f ? 120 : 200 });
      const slot = await ctx.waitFor(() => $('.pb-slot:not([disabled])', s.body));
      await ctx.tap(slot, { after: f ? 150 : 360 });
      await ctx.type($('#pb-bk-n', s.body), lang() === 'ru' ? 'Михаль' : 'מיכל', { cps: 17, after: 100 });
      await ctx.type($('#pb-bk-p', s.body), '0521234567', { cps: 32, after: 120 });
      await ctx.tap($('[data-confirm]', s.body), { after: 150 });
      await ctx.waitFor(() => $('.pb-done--bk', s.body), 3000);
      const ph = await ctx.waitFor(() => $('.pb-phonecrop', s.body), 1500);
      if (ph) await ctx.point(ph);
      ctx.hideFinger();
      await ctx.wait(f ? 900 : 2250);
      ctx.signal.removeEventListener('abort', onAbort);
      closeMine();
      await ctx.wait(f ? 100 : 200);
    }
  }
});
