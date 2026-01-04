import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Shield, Users, Download, FileText } from "lucide-react";
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
}

const AdminUsersPage = ({ onBack }: AdminUsersPageProps) => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

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

    const usersWithStats: UserWithStats[] = usersData.map(user => ({
      ...user,
      registrationCount: regCounts[user.phone] || 0
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
      .order('registered_at', { ascending: false });

    if (error) {
      toast.error('שגיאה בייצוא נתונים');
      return;
    }

    const csvContent = [
      ['שם', 'טלפון', 'שעה', 'תאריך הרשמה'].join(','),
      ...data.map(r => [
        r.name,
        r.phone,
        r.hour,
        format(new Date(r.registered_at), 'dd/MM/yyyy HH:mm')
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

    const csvContent = [
      ['שם', 'שם משפחה', 'טלפון', 'מספר הרשמות', 'תאריך הצטרפות'].join(','),
      ...usersData.map(u => [
        u.name,
        u.last_name || '',
        u.phone,
        regCounts[u.phone] || 0,
        format(new Date(u.created_at), 'dd/MM/yyyy')
      ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'users_stats.csv');
    toast.success('קובץ סטטיסטיקות יוצא בהצלחה');
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
        <div className="flex gap-3 mb-6">
          <Button variant="outline" onClick={exportRegistrationsCSV} className="flex-1">
            <Download className="w-4 h-4 ml-2" />
            ייצוא הרשמות
          </Button>
          <Button variant="outline" onClick={exportUsersStatsCSV} className="flex-1">
            <FileText className="w-4 h-4 ml-2" />
            ייצוא סטטיסטיקות
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
