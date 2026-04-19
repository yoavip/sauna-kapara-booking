import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Home, CheckCircle2, Users, Phone, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const HOUSE_RULES = [
  { icon: "🚭", title: "אסור לעשן בתוך הבית", desc: "אפשר לעשן בחצר בלבד" },
  { icon: "🌙", title: "שעות שקט", desc: "מ-22:00 עד 08:00" },
  { icon: "🐾", title: "ללא חיות מחמד", desc: "אלא אם תואם מראש" },
  { icon: "🎉", title: "ללא מסיבות", desc: "המקום מיועד לאירוח שקט" },
  { icon: "🕚", title: "צ'ק-אין", desc: "מהשעה 15:00" },
  { icon: "🕚", title: "צ'ק-אאוט", desc: "עד השעה 11:00" },
  { icon: "♻️", title: "ניקיון", desc: "נא להשאיר את הבית מסודר" },
];

const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "שם חייב להכיל לפחות 2 תווים").max(100, "שם ארוך מדי"),
  phone: z.string().trim().regex(/^0\d{8,9}$/, "מספר טלפון לא תקין (לדוגמה: 0501234567)"),
  guestsCount: z.number().int().min(1, "חייב להיות לפחות אורח אחד").max(20, "מקסימום 20 אורחים"),
  notes: z.string().max(500, "הערות ארוכות מדי").optional(),
});

const EffiBooking = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestsCount, setGuestsCount] = useState(2);
  const [notes, setNotes] = useState("");
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      toast.error("יש לבחור תאריכי כניסה ויציאה");
      return;
    }

    if (checkOut <= checkIn) {
      toast.error("תאריך היציאה חייב להיות אחרי תאריך הכניסה");
      return;
    }

    if (!rulesAccepted) {
      toast.error("יש לאשר את כללי הבית");
      return;
    }

    const validation = bookingSchema.safeParse({ fullName, phone, guestsCount, notes });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("effi_bookings").insert({
      full_name: validation.data.fullName,
      phone: validation.data.phone,
      check_in: format(checkIn, "yyyy-MM-dd"),
      check_out: format(checkOut, "yyyy-MM-dd"),
      guests_count: validation.data.guestsCount,
      rules_accepted: rulesAccepted,
      notes: validation.data.notes || null,
    });

    setSubmitting(false);

    if (error) {
      console.error("Booking submission error:", error);
      toast.error("שגיאה בשליחת ההזמנה. נסו שוב.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full p-8 text-center space-y-4 shadow-xl border-0">
          <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">תודה רבה, {fullName}!</h1>
          <p className="text-slate-600">ההזמנה התקבלה בהצלחה. אפי יחזור אליך בהקדם לאישור.</p>
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 space-y-1 text-right">
            <div>📅 כניסה: {format(checkIn!, "dd/MM/yyyy")}</div>
            <div>📅 יציאה: {format(checkOut!, "dd/MM/yyyy")}</div>
            <div>👥 אורחים: {guestsCount}</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" dir="rtl">
      {/* Hero */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">הבית של אפי</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">ברוכים הבאים</h1>
          <p className="text-slate-600">מלאו את הפרטים להזמנת השהות שלכם</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* House Rules */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-900">כללי הבית</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {HOUSE_RULES.map((rule, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <span className="text-2xl">{rule.icon}</span>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{rule.title}</div>
                  <div className="text-xs text-slate-600">{rule.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">פרטי ההזמנה</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4" />
                שם מלא
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ישראל ישראלי"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4" />
                טלפון
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
                required
                dir="ltr"
                className="text-right"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700">
                  <CalendarIcon className="w-4 h-4" />
                  תאריך כניסה
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !checkIn && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {checkIn ? format(checkIn, "dd/MM/yyyy") : <span>בחרו תאריך</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700">
                  <CalendarIcon className="w-4 h-4" />
                  תאריך יציאה
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !checkOut && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {checkOut ? format(checkOut, "dd/MM/yyyy") : <span>בחרו תאריך</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date < (checkIn || new Date(new Date().setHours(0, 0, 0, 0)))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center gap-2 text-slate-700">
                <Users className="w-4 h-4" />
                מספר אורחים
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                >
                  −
                </Button>
                <div className="flex-1 text-center text-lg font-bold text-slate-900">{guestsCount}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setGuestsCount(Math.min(20, guestsCount + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700">הערות (אופציונלי)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="בקשות מיוחדות, שעת הגעה משוערת..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Checkbox
                id="rules"
                checked={rulesAccepted}
                onCheckedChange={(checked) => setRulesAccepted(!!checked)}
                className="mt-0.5"
              />
              <Label htmlFor="rules" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                קראתי ואני מאשר/ת את כללי הבית המופיעים למעלה
              </Label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base font-semibold"
            >
              {submitting ? "שולח..." : "שליחת הזמנה"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400 pb-4">
          הפרטים שלך נשלחים ישירות לאפי בלבד
        </p>
      </main>
    </div>
  );
};

export default EffiBooking;
