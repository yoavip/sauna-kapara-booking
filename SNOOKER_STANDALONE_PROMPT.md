# פרומט מושלם – בניית אפליקציית "ביליארד בית קשת" (Standalone)

> העתק את כל התוכן שמתחת לקו והדבק בפרויקט Lovable **חדש וריק** (עם Lovable Cloud מופעל). האפליקציה תיבנה מאפס, זהה בהתנהגות ל־Snooker הקיים, אך ללא כל קוד/DB של הסאונה.

---

## 🎱 בקשה: בנה לי אפליקציית "ביליארד בית קשת" – אפליקציה עצמאית מלאה

בנה אפליקציה בעברית (RTL) שמנהלת רישום לשולחן הביליארד של קיבוץ בית קשת. זו אפליקציה עצמאית לגמרי – אין סאונה, אין תיירות. רק ביליארד.

### Stack
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui (עם כל הרכיבים הרלוונטיים)
- Zustand + persist (localStorage) לניהול זהות המשתמש
- Lovable Cloud (Supabase) – טבלאות, RLS, Realtime
- react-router-dom, date-fns (locale `he`), sonner (toasts), lucide-react (icons)
- recharts (גרפים בדף הסטטיסטיקות)
- xlsx (ייצוא Excel לנתונים גולמיים בדף הסטטיסטיקות)

### עיצוב ואווירה
- כל האתר בעברית, `dir="rtl"`, פונט `Heebo` מ־Google Fonts (weights 300–700).
- פלטת "לבד סנוקר" – רקע: `linear-gradient(180deg, #0c2418 0%, #0a3d24 25%, #0d4a2c 50%, #0a3d24 75%, #0c2418 100%)`.
- Overlay רעש (SVG fractalNoise inline) בשקיפות ~30% על כל דף.
- אלמנטים דקורטיביים: כדורי ביליארד צפים/מתגלגלים ברקע (מספרים 1–8) עם keyframes CSS, ומקלות ביליארד מוטים.
- כרטיסים: `bg-black/60` או `bg-emerald-900/60` עם `backdrop-blur-md` וגבול `border-emerald-700/30`.
- כפתור ראשי: `bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white`.
- טקסטים: `text-emerald-200/300`, secondary `text-emerald-400/70`.
- אמוג'י 🎱 מופיע בכותרות מרכזיות.

### מבנה הראוטים
- `/` → מפנה ל־`/snooker`
- `/snooker` – Landing (זיהוי משתמש + כניסה)
- `/snooker/rules` – דף תקנון עצמאי
- `/snooker/register` – מסך הרשמה לשעות
- `/snooker/stats` – סטטיסטיקות (לוועד)
- `*` – NotFound

### כותרות דף וMetadata (index.html)
- `<title>`: **ביליארד בית קשת | השולחן הכי חם בצפון 🎱**
- description: "הזמינו מקום בשולחן הביליארד של בית קשת. רדיו בר, אווירה מעולה, ומשחק שווה!"
- הוסף og:title, og:description, og:type=website, twitter:card=summary_large_image.

---

## 🗄️ Database (Lovable Cloud) – מיגרציה יחידה

צור את הטבלאות הבאות. **חשוב:** כל CREATE TABLE ב־public חייב GRANT באותה מיגרציה.

### enum
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

### טבלה: `users`
- `id uuid PK default gen_random_uuid()`
- `phone text NOT NULL`
- `name text NOT NULL`
- `last_name text`
- `display_name text`
- `created_at timestamptz NOT NULL default now()`
- unique על `phone`
- **טריגר לפני INSERT** – `update_display_names()`: אם יש משתמש קיים עם אותו `name`, קובע לשני המשתמשים `display_name = first_name + ' ' + first_letter_of_last_name`. אחרת `display_name = name`. SECURITY DEFINER, search_path=public.
- **טריגר לפני UPDATE** – `recalculate_display_name_on_update()`: מחשב מחדש כשמשנים name/last_name.

### טבלה: `snooker_registrations`
- `id uuid PK default gen_random_uuid()`
- `name text NOT NULL`
- `phone text NOT NULL`
- `hour integer NOT NULL` (0–23)
- `registered_at timestamptz NOT NULL default now()` – בפועל נשמר כאן ה־date+hour של הסלוט
- `created_at timestamptz NOT NULL default now()`
- **Realtime enabled** (`alter publication supabase_realtime add table ...`).

### טבלה: `user_roles`
- `id uuid PK default gen_random_uuid()`
- `user_id uuid NOT NULL`
- `role app_role NOT NULL`
- unique(user_id, role)

### טבלה: `analytics`
- `id uuid PK default gen_random_uuid()`
- `event_type text NOT NULL` (`page_view` | `registration` | `cancellation` | `user_created`)
- `event_data jsonb default '{}'::jsonb`
- `user_name text`, `user_phone text`
- `created_at timestamptz NOT NULL default now()`

### פונקציה
```sql
CREATE OR REPLACE FUNCTION public.has_role(_phone text, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.users u ON ur.user_id = u.id
    WHERE u.phone = _phone AND ur.role = _role
  )
$$;
```

### GRANTs + RLS
לכל טבלה: `GRANT SELECT, INSERT, UPDATE, DELETE ... TO anon, authenticated; GRANT ALL ... TO service_role;` (האפליקציה אנונימית – אין Supabase Auth).

מדיניויות פתוחות (`USING (true) WITH CHECK (true)`) לכל הפעולות שהאפליקציה משתמשת בהן:
- `snooker_registrations`: INSERT, SELECT, DELETE לכולם.
- `users`: INSERT, SELECT, UPDATE, DELETE לכולם.
- `user_roles`: INSERT, SELECT, DELETE לכולם.
- `analytics`: INSERT, SELECT לכולם.

> הערה: מדיניויות פתוחות תואמות למודל האנונימי הקיים. אל תוסיף Supabase Auth אלא אם התבקש בהמשך.

---

## 🧠 Zustand Store – `src/stores/snookerUserStore.ts`

```ts
interface SnookerUserState {
  name: string; lastName: string; phone: string; agreedToRules: boolean;
  setUser(name, lastName, phone): void;
  setAgreedToRules(agreed): void;
  clearUser(): void;
  isRegistered(): boolean; // name && phone && agreedToRules
}
```
עם `persist` בשם `snooker-user`.

---

## 🧩 קבצי עזר

### `src/lib/analytics.ts`
Wrappers שכותבים ל־`analytics`: `trackPageView`, `trackRegistration(hour, date, name, phone, lastName?, additionalCount?, participantNames?)`, `trackCancellation`, `trackUserCreated`.

### `src/lib/displayName.ts`
Cache של דקה למיפוי `name|lastName → display_name`, עם `refreshDisplayNameCache`, `getDisplayName(name,lastName)`, `getDisplayNamesForParticipants(names[])`.

---

## 🖥️ עמודים ורכיבים

### 1) `SnookerLanding` (`/snooker`)
- לוגו: עיגול שחור עם כדור 8 לבן במרכז.
- כותרת: **"חגיגה בסנוקר"**, subtitle: "שולחן הביליארד | בית קשת".
- אם לא רשום → כפתור גדול "הרשמה למערכת" פותח טופס עם:
  - שם פרטי (חובה), שם משפחה (חובה), טלפון (חובה).
  - כפתור "לקריאה ואישור התקנון" פותח `SnookerRulesSheet` (Sheet מלמטה, 85vh) שדורש **גלילה עד הסוף** כדי לאפשר כפתור "מאשר.ת".
  - ולידציה בעברית עם הודעות שגיאה מתחת לכל שדה.
  - "שמור והמשך" → קורא ל־store וגם ל־Supabase: upsert למשתמש ב־`users`, ואם חדש – `trackUserCreated`.
- אם רשום → כרטיס "שלום {name}" עם הטלפון וקישור "לא אני? לחצו כאן" (מנקה את ה־store), ושני כפתורים:
  - "הרשמה למשחק" → נווט ל־`/snooker/register`.
  - "מי בשולחן?" → פותח view registrations בתוך אותו דף (state, לא ראוט).
- Header עם 🎱 בית קשת + לינק לתקנון (`/snooker/rules`).

### 2) `SnookerRulesSheet` – רכיב פנימי
- תוכן התקנון (עברית) בסעיפים: 🔐 כניסה ומפתח (**קוד לוקבוקס: 8264**), 📋 כללי שימוש (תושבי בית קשת בלבד, גיל 18+, שעה אחת בהזמנה), 🧹 סדר וניקיון, 🚭 עישון (אסור בפנים), 🔒 סיום שהות (כיבוי אורות + נעילת דלתות), ⚠️ אחריות ונזקים.
- לינק בסוף: `https://docs.google.com/document/d/10-buDfV_FiHRjLG8Y2FO07W9Qiz2c3Dac41USrrJMOU/edit?usp=drivesdk` לתקנון המלא.
- כפתור "מאשר.ת" מושבת עד גלילה לסוף (threshold 20px).

### 3) `SnookerRules` (`/snooker/rules`) – עמוד סטטי עם אותו תוכן + CTA "קראתי ומאשר/ת – להרשמה" ← `/snooker/register`.

### 4) `SnookerRegistration` (`/snooker/register`)
- אם לא רשום ב־store → מסך "יש להירשם קודם" עם כפתור חזרה.
- כרטיס עליון: "נרשם בשם: {displayName}" (מ־`getDisplayName`) + טלפון.
- Date selector עם `‹ היום/מחר/יום, dd/MM ›` (אי־אפשר לחזור לפני היום).
- אם היום: כפתור ענק **"כאן עכשיו! 🎱"** לרישום מיידי לשעה הנוכחית.
- רשימת שעות (רק שעות מהשעה הנוכחית והלאה כשהתאריך הוא היום; אחרת 0–23):
  - כל שעה: `HH:00`, אם היא השעה הנוכחית – תג "עכשיו" צהוב.
  - Popover עם רשימת הרשומים; **הקשה על שם של מישהו אחר → פותח WhatsApp** עם הטקסט: `שלום, ראיתי שנרשמתם לסנוקר בשעה HH:00. האם אפשר להצטרף?` (המרה `0XXXXXXXXX → 972XXXXXXXXX`).
  - כפתור `+` שפותח `AddSingleParticipantSheet` (Sheet מלמטה) להוספת אורחים על שם הטלפון של המשתמש.
  - כפתור "הרשמה" (אם לא רשום) או "בטל" (אם רשום).
  - **ביטול חכם**: אם רשומים לאותה שעה אורחים על אותו טלפון → פתח `AlertDialog` "בטל רק אותי / בטל את כולם / ביטול".
- **Realtime**: subscribe ל־`snooker_registrations` (postgres_changes, event=*) ורענן אחרי כל שינוי.
- אירועי אנליטיקה: `trackPageView('snooker-registration')`, `trackRegistration`, `trackCancellation`.

### 5) `AddSingleParticipantSheet`
Sheet מלמטה, קלט אחד לשם משתתף, מציג "כבר רשומים לשעה זו" כרשימה, Enter מגיש.

### 6) `SnookerViewRegistrations` (מסך של "מי בשולחן?")
- Header עם "חזרה" ← לדף הנחיתה.
- Date selector דומה (מאפשר גם ימים בעבר – תג "עבר").
- מציג רק שעות שיש בהן רשומים, קיבוץ לפי שעה עם ספירה.
- שם שלי מודגש (`emerald-600/20`); שם אחר → קליק פותח WhatsApp כמו למעלה.
- לכל הרישום שלי – כפתור X (אדום) לביטול; לא מציג X בתאריך שעבר.
- **תיקון חשוב**: `onClick` על כפתור ה־X חייב `e.stopPropagation()` כדי שלא ייפתח WhatsApp במקביל למחיקה.

### 7) `SnookerStats` (`/snooker/stats`)
- `document.title = "סטטיסטיקות סנוקר"`.
- טוען את כל `snooker_registrations` מ־`2026-01-01` והלאה, ב־batches של 1000.
- KPI cards: סך שעות שימוש (כפילויות), משתמשים ייחודיים, ממוצע שעות/יום, ממוצע שעות/שבוע, **סך שעות תפוסה** (date+hour ייחודי), ממוצע תפוסה/יום, היום הכי פעיל, שעת השיא.
- LineChart שבועי – שעות כוללות מול שעות תפוסה.
- BarChart לפי ימי שבוע (עברית: ראשון…שבת) – עמודות כפולות.
- BarChart לפי שעות היום.
- טבלת שחקנים מובילים ממוינת יורד לפי כמות רשומים (unique לפי phone).
- כפתור **"ייצוא נתונים גולמיים (Excel)"** – `window.prompt` לסיסמה, רק אם `"1981"` יוצר xlsx עם: תאריך, שעה, שם, טלפון, נרשם בתאריך.

### 8) `ReportBugButton` – כפתור צף fixed bottom-left, `bg-amber-100`, טקסט "בוא נשמע אותך", פותח WhatsApp ל־`972526606479` עם ההודעה:
> שלום לך יואב תודה על האתר החמוד והמושקע, שיחקת אותה!  
> רק יש כמה דברים שלא עובדים, או יותר נכון חשבתי שיש מה לשפר, אז קבל:  
> (אפשר גם הודעה קולית, בכיף)

מוצג בכל הדפים (mount ב־`App.tsx`).

### 9) (אופציונלי) Edge Function `og-proxy`
מזהה crawlers (facebookexternalhit, WhatsApp, Twitterbot וכו') ומחזיר HTML עם og tags לתמונת preview. משתמשים רגילים מקבלים 302 ל־`/snooker`.

---

## ✅ קריטריוני קבלה
1. `/snooker` נטען מיד – זיהוי משתמש דרך localStorage.
2. הרשמה חדשה יוצרת שורה ב־`users`, מטריגר קובע `display_name` נכון גם בהתנגשות שם פרטי.
3. הרשמה לשעה מוסיפה ל־`snooker_registrations` וכל הלקוחות האחרים רואים את זה מיידית (Realtime).
4. ביטול הרשמה עם אורחים – פותח דיאלוג בחירה; אין פתיחה של WhatsApp בעת לחיצה על X.
5. `/snooker/stats` טוען מ־2026-01-01, כל ה־KPI וגרפים עובדים; ייצוא Excel דורש 1981.
6. הכל בעברית RTL, עיצוב לבד סנוקר ירוק כהה, כדורים מתגלגלים ברקע.
7. כפתור "בוא נשמע אותך" מופיע בכל הדפים.

---

## ❌ אל תעשה
- אל תוסיף עמודי סאונה / תיירות / Effi.
- אל תשתמש בצבעים "AI generic" (סגול/אינדיגו על לבן).
- אל תוסיף כפתור "שיתוף" בשום מקום.
- אל תוסיף Supabase Auth – זהות נשמרת בטלפון+localStorage.
- אל תשנה את `src/integrations/supabase/client.ts` או `types.ts`.

בהצלחה! 🎱
