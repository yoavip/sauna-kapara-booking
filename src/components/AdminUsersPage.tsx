import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Shield, Users, Download, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import ThermometerBackground from "./ThermometerBackground";
import { format } from "date-fns";
import { trackPageView } from "@/lib/analytics";
import { useUserStore } from "@/stores/userStore";

interface AdminUsersPageProps {
  onBack: () => void;
}

interface UserWithStats {
  id: string;
  name: string;
  last_name: string | null;
  phone: string;
  created_at: string;
  registrationCount: number;
  lastSeen: string | null;
}

const AdminUsersPage = ({ onBack }: AdminUsersPageProps) => {
  const { name, phone } = useUserStore();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView('admin_management', name, phone);
  }, []);

  const fetchUsers = async () => {
    // Fetch all users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      setLoading(false);
      return;
    }

    // Fetch registration counts per phone
    const { data: registrations } = await supabase
      .from('registrations')
      .select('phone');

    const regCounts: Record<string, number> = {};
    registrations?.forEach(r => {
      regCounts[r.phone] = (regCounts[r.phone] || 0) + 1;
    });

    // Fetch last activity per user from analytics
    const { data: analytics } = await supabase
      .from('analytics')
      .select('user_phone, created_at')
      .order('created_at', { ascending: false });

    const lastSeenMap: Record<string, string> = {};
    analytics?.forEach(a => {
      if (a.user_phone && !lastSeenMap[a.user_phone]) {
        lastSeenMap[a.user_phone] = a.created_at;
      }
    });

    const usersWithStats: UserWithStats[] = usersData.map(user => ({
      ...user,
      registrationCount: regCounts[user.phone] || 0,
      lastSeen: lastSeenMap[user.phone] || null
    }));

    setUsers(usersWithStats);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const exportRegistrationsCSV = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('שגיאה בייצוא נתונים');
      return;
    }

    const csvContent = [
      ['שם', 'טלפון', 'שעה מוזמנת', 'תאריך מוזמן', 'זמן ביצוע הרשמה'].join(','),
      ...data.map(r => [
        r.name,
        r.phone,
        `${r.hour}:00`,
        format(new Date(r.registered_at), 'dd/MM/yyyy'),
        format(new Date(r.created_at), 'dd/MM/yyyy HH:mm')
      ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'registrations.csv');
    toast.success('קובץ הרשמות יוצא בהצלחה');
  };

  const exportUsersStatsCSV = async () => {
    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      toast.error('שגיאה בייצוא נתונים');
      return;
    }

    // Fetch registration counts per phone
    const { data: registrations } = await supabase
      .from('registrations')
      .select('phone');

    const regCounts: Record<string, number> = {};
    registrations?.forEach(r => {
      regCounts[r.phone] = (regCounts[r.phone] || 0) + 1;
    });

    // Fetch last activity per user from analytics
    const { data: analytics } = await supabase
      .from('analytics')
      .select('user_phone, created_at')
      .order('created_at', { ascending: false });

    const lastSeenMap: Record<string, string> = {};
    analytics?.forEach(a => {
      if (a.user_phone && !lastSeenMap[a.user_phone]) {
        lastSeenMap[a.user_phone] = a.created_at;
      }
    });

    const csvContent = [
      ['שם', 'שם משפחה', 'טלפון', 'מספר הרשמות', 'תאריך הצטרפות', 'נראה לאחרונה'].join(','),
      ...usersData.map(u => [
        u.name,
        u.last_name || '',
        u.phone,
        regCounts[u.phone] || 0,
        format(new Date(u.created_at), 'dd/MM/yyyy'),
        lastSeenMap[u.phone] ? format(new Date(lastSeenMap[u.phone]), 'dd/MM/yyyy HH:mm') : ''
      ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'users_stats.csv');
    toast.success('קובץ סטטיסטיקות יוצא בהצלחה');
  };

  const exportActivityLogCSV = async () => {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('שגיאה בייצוא נתונים');
      return;
    }

    const eventTypeLabels: Record<string, string> = {
      'page_view': 'צפייה בדף',
      'registration': 'הרשמה',
      'cancellation': 'ביטול הרשמה',
      'user_created': 'יוזר חדש נוצר',
    };

    const formatEventDetails = (event: typeof data[0]) => {
      const eventData = event.event_data as Record<string, unknown> | null;
      if (!eventData) return '';
      
      if (event.event_type === 'page_view') {
        const pageLabels: Record<string, string> = {
          'registration': 'דף הרשמה',
          'view_registrations': 'דף מי כאן',
          'admin_management': 'דף ניהול אדמין'
        };
        return pageLabels[eventData.page as string] || eventData.page as string || '';
      }
      
      if (event.event_type === 'registration') {
        const parts = [];
        if (eventData.date) parts.push(`תאריך: ${eventData.date}`);
        if (eventData.hour !== undefined) parts.push(`שעה: ${eventData.hour}:00`);
        if (eventData.additional_participants && Number(eventData.additional_participants) > 0) {
          parts.push(`משתתפים נוספים: ${eventData.additional_participants}`);
        }
        return parts.join(' | ');
      }
      
      if (event.event_type === 'cancellation') {
        const parts = [];
        if (eventData.date) parts.push(`תאריך: ${eventData.date}`);
        if (eventData.hour !== undefined) parts.push(`שעה: ${eventData.hour}:00`);
        return parts.join(' | ');
      }
      
      return '';
    };

    const csvContent = [
      ['זמן', 'סוג פעולה', 'שם משתמש', 'טלפון', 'פרטים'].join(','),
      ...data.map(e => [
        format(new Date(e.created_at), 'dd/MM/yyyy HH:mm:ss'),
        eventTypeLabels[e.event_type] || e.event_type,
        e.user_name || '',
        e.user_phone || '',
        formatEventDetails(e)
      ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'activity_log.csv');
    toast.success('לוג פעילות יוצא בהצלחה');
  };

  const downloadCSV = (content: string, filename: string) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ThermometerBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">ניהול משתמשים</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" onClick={exportRegistrationsCSV} className="flex-1 min-w-[140px]">
            <Download className="w-4 h-4 ml-2" />
            ייצוא הרשמות
          </Button>
          <Button variant="outline" onClick={exportUsersStatsCSV} className="flex-1 min-w-[140px]">
            <FileText className="w-4 h-4 ml-2" />
            ייצוא סטטיסטיקות
          </Button>
          <Button variant="outline" onClick={exportActivityLogCSV} className="flex-1 min-w-[140px]">
            <Activity className="w-4 h-4 ml-2" />
            ייצוא לוג פעילות
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-2xl shadow-warm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">משתמשים רשומים ({users.length})</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">טוען...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">שם משפחה</TableHead>
                  <TableHead className="text-right">תאריך הצטרפות</TableHead>
                  <TableHead className="text-right">מספר הרשמות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.last_name || '-'}</TableCell>
                    <TableCell>{format(new Date(user.created_at), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{user.registrationCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
