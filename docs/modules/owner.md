# Module brief: owner (view: owner)

MODULE owner: the owner's dashboard ("הנהלה"). She is the client watching this demo: make her feel in control and amazed. Mobile-first app-like dashboard, gorgeous bento grid on desktop (>= 900px). All numbers are fictional and clearly marked (.demo-tag + "נתונים לדוגמה"). Never invent staff names (use roles), prices or real stats. Address her in Hebrew feminine singular where addressing is needed (לך, שלך).

1) Header: greeting by time of day, today's date, a one-line calm status, quick chips.
2) KPI bento (count-up on enter, tiny SVG sparklines/rings, semantic pills):
  - ילדים היום (present / registered, e.g. 38/41) + mini bars of arrivals by hour
  - תפוסת קבוצות: three rings for תינוקייה / צעירים / בוגרים (%)
  - רשימת המתנה (count + hint)
  - סיורים השבוע (count + next one "מחר 09:30")
  - פניות לפי מקור: אתר / Facebook / פורטל בשפה הרוסית (bars, generic icons, no brand logos)
  - תשלומים: שולם vs ממתין (families count, ring)
  - מי במשמרת: role-based avatars only ("מטפלות 6/6", "מטבח 1/1"), no names
3) Funnel "מהאתר ועד ההרשמה": ביקורים באתר -> סיורים -> הרשמות -> תשלומים, animated (bars narrowing / pouring, numbers counting, conversion % between stages). Period switch (שבוע / חודש) re-animates.
4) "מאחורי הקלעים" automations: 9 cards. Each: icon, title, one-line description, a role="switch" toggle (on by default; off dims the card and shows "כבוי"), "הפעלה אחרונה: היום 09:14" (example), and a mini schema: trigger chip -> dotted path -> action chip(s). Tapping a card (or its "הדגמה" button) plays the automation in a sheet/stage: a token travels along the path; the trigger lights; message bubbles appear on 1-3 phone mocks (parent / owner / kitchen tablet) in the right language; ends with "בוצע" and the card's last-run updates to "עכשיו". The 9 (ids in brackets):
   [lead] פנייה חדשה מהאתר -> מיד הודעה להורה עם מועדים לסיור + התראה לך
   [visit] סיור מחר -> תזכורת להורה; אחרי הסיור -> קישור להרשמה
   [seat] התפנה מקום -> הצעה למשפחה הבאה ברשימת ההמתנה
   [billing] 1 בחודש -> חשבון; 5 בחודש -> תזכורת עדינה; הקבלה יוצאת לבד
   [summaries] 17:30 -> סיכומי ערב לכל ההורים
   [shabbat] יום רביעי -> תזכורת להורי שבת
   [docs] חסר מסמך -> תזכורת להורה
   [birthday] מחר יום הולדת -> תזכורת לצוות
   [allergies] תפריט השבוע מול האלרגיות של הילדים -> התראה למטבח (e.g. Itai peanuts / Tamar sesame)
   Russian versions for everything. An activity log strip (latest runs) updates as you play them.
Public: play(id), reset(). Tour fns: tour.kpis(ctx) (scroll to top, re-trigger counts + funnel, point at 2 KPIs; <= 6s), tour.automations(ctx) (scroll to the automations, play 'lead' then 'summaries' via ctx.tap on their cards/buttons, wait for each to finish, close; <= 10s).
