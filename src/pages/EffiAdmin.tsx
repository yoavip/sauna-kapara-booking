import { useEffect, useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Home, Users, Calendar as CalendarIcon, Phone, MessageCircle, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_PASSWORD = "effi2025";
const STORAGE_KEY = "effi_admin_authed";

interface Booking {
  id: string;
  full_name: string;
  phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  rules_accepted: boolean;
  notes: string | null;
  created_at: string;
}

const EffiAdmin = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "1");
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("effi_bookings")
      .select("*")
      .order("check_in", { ascending: true });

    if (error) {
      toast.error("שגיאה בטעינת הזמנות");
      setLoading(false);
      return;
    }
    setBookings((data || []) as Booking[]);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchBookings();
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
    } else {
      toast.error("סיסמה שגויה");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`למחוק את ההזמנה של ${name}?`)) return;
    const { error } = await supabase.from("effi_bookings").delete().eq("id", id);
    if (error) {
      toast.error("שגיאה במחיקה");
      return;
    }
    toast.success("ההזמנה נמחקה");
    fetchBookings();
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = `שלום ${name}, מדבר אפי. בנוגע להזמנה שלך...`;
    const phoneNumber = phone.startsWith("0") ? "972" + phone.slice(1) : phone;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-sm w-full p-8 border-0 shadow-xl">
          <div className="w-12 h-12 mx-auto bg-blue-500 rounded-lg flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-center text-slate-900 mb-1">אזור ניהול</h1>
          <p className="text-sm text-center text-slate-500 mb-6">הזן סיסמה להמשך</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              autoFocus
            />
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
              כניסה
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const upcoming = bookings.filter((b) => new Date(b.check_out) >= new Date());
  const past = bookings.filter((b) => new Date(b.check_out) < new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">ניהול הזמנות</h1>
              <p className="text-xs text-slate-500">{bookings.length} הזמנות סה"כ</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(STORAGE_KEY);
              setAuthed(false);
            }}
          >
            יציאה
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {loading ? (
          <p className="text-center text-slate-500">טוען...</p>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-sm">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">אין עדיין הזמנות</p>
          </Card>
        ) : (
          <>
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">הזמנות פעילות ועתידיות ({upcoming.length})</h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingCard key={b.id} booking={b} onDelete={handleDelete} onWhatsApp={openWhatsApp} />
                ))}
                {upcoming.length === 0 && <p className="text-sm text-slate-400 text-center py-4">אין הזמנות פעילות</p>}
              </div>
            </section>

            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-500 mb-3">היסטוריה ({past.length})</h2>
                <div className="space-y-3 opacity-70">
                  {past.map((b) => (
                    <BookingCard key={b.id} booking={b} onDelete={handleDelete} onWhatsApp={openWhatsApp} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const BookingCard = ({
  booking,
  onDelete,
  onWhatsApp,
}: {
  booking: Booking;
  onDelete: (id: string, name: string) => void;
  onWhatsApp: (phone: string, name: string) => void;
}) => {
  const nights = Math.ceil(
    (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="p-4 border-0 shadow-sm" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-slate-900">{booking.full_name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            נשלח ב-{format(new Date(booking.created_at), "dd/MM/yyyy HH:mm", { locale: he })}
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          {nights} {nights === 1 ? "לילה" : "לילות"}
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
        <div className="flex items-center gap-2 text-slate-700">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span className="font-medium">כניסה:</span>
          <span>{format(new Date(booking.check_in), "dd/MM/yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span className="font-medium">יציאה:</span>
          <span>{format(new Date(booking.check_out), "dd/MM/yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="font-medium">אורחים:</span>
          <span>{booking.guests_count}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700" dir="ltr">
          <Phone className="w-4 h-4 text-slate-400" />
          <span>{booking.phone}</span>
        </div>
      </div>

      {booking.notes && (
        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 mb-3">
          <div className="text-xs font-semibold text-slate-500 mb-1">הערות:</div>
          {booking.notes}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onWhatsApp(booking.phone, booking.full_name)}
          className="flex-1 gap-1"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(booking.id, booking.full_name)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default EffiAdmin;
