import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Loader2, Trophy, Users, Clock, Calendar as CalendarIcon } from "lucide-react";

interface Registration {
  id: string;
  name: string;
  phone: string;
  hour: number;
  registered_at: string;
}

const DAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const START_DATE = "2026-01-01";

const SnookerStats = () => {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "סטטיסטיקות סנוקר";
    const load = async () => {
      let all: Registration[] = [];
      let from = 0;
      const size = 1000;
      while (true) {
        const { data: rows, error } = await supabase
          .from("snooker_registrations")
          .select("id, name, phone, hour, registered_at")
          .gte("registered_at", START_DATE)
          .order("registered_at", { ascending: true })
          .range(from, from + size - 1);
        if (error || !rows || rows.length === 0) break;
        all = all.concat(rows as Registration[]);
        if (rows.length < size) break;
        from += size;
      }
      setData(all);
      setLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalHours = data.length;
    const uniqueUsers = new Set(data.map((d) => d.phone)).size;

    // Days of week breakdown - based on the registered hour, not registered_at timestamp
    const byDow: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    // Sessions per user
    const byUser: Record<string, { name: string; phone: string; count: number }> = {};
    // By hour of day
    const byHourOfDay: Record<number, number> = {};
    // Weekly time series
    const byWeek: Record<string, number> = {};

    data.forEach((r) => {
      const slot = new Date(r.registered_at);
      // hour field already represents the slot hour; registered_at has the slot date
      const dow = slot.getDay();
      byDow[dow] = (byDow[dow] || 0) + 1;

      const key = r.phone;
      if (!byUser[key]) byUser[key] = { name: r.name, phone: r.phone, count: 0 };
      byUser[key].count += 1;

      const hod = r.hour;
      byHourOfDay[hod] = (byHourOfDay[hod] || 0) + 1;

      // ISO week start (Sunday)
      const d = new Date(slot);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      const wk = d.toISOString().slice(0, 10);
      byWeek[wk] = (byWeek[wk] || 0) + 1;
    });

    const dowChart = DAYS_HE.map((label, i) => ({ day: label, hours: byDow[i] || 0 }));
    const topUsers = Object.values(byUser).sort((a, b) => b.count - a.count);
    const hourChart = Object.keys(byHourOfDay)
      .map((h) => ({ hour: `${h}:00`, hours: byHourOfDay[Number(h)] }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    const weekChart = Object.keys(byWeek)
      .sort()
      .map((wk) => {
        const d = new Date(wk);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        return { week: label, hours: byWeek[wk] };
      });

    const weeksCount = Object.keys(byWeek).length || 1;
    const avgHoursPerWeek = (totalHours / weeksCount).toFixed(1);

    const peakDay = dowChart.reduce((a, b) => (b.hours > a.hours ? b : a), dowChart[0]);
    const peakHour = hourChart.reduce((a, b) => (b.hours > a.hours ? b : a), hourChart[0] || { hour: "-", hours: 0 });

    return { totalHours, uniqueUsers, dowChart, topUsers, hourChart, weekChart, avgHoursPerWeek, peakDay, peakHour };
  }, [data]);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">סטטיסטיקות סנוקר</h1>
          <p className="text-muted-foreground">מ-1 בינואר 2026 ועד היום</p>
        </header>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.totalHours}</div>
              <div className="text-sm text-muted-foreground">סך שעות שימוש</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.uniqueUsers}</div>
              <div className="text-sm text-muted-foreground">משתמשים שונים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CalendarIcon className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.avgHoursPerWeek}</div>
              <div className="text-sm text-muted-foreground">שעות בממוצע לשבוע</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.peakDay?.day}</div>
              <div className="text-sm text-muted-foreground">היום הכי פעיל ({stats.peakDay?.hours})</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly trend */}
        <Card>
          <CardHeader>
            <CardTitle>שעות שימוש לפי שבוע</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weekChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" name="שעות" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Days of week */}
        <Card>
          <CardHeader>
            <CardTitle>תפוסה לפי ימי השבוע</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dowChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" name="שעות" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hour of day */}
        <Card>
          <CardHeader>
            <CardTitle>תפוסה לפי שעות היום</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.hourChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" name="שעות" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              שעת השיא: {stats.peakHour.hour} ({stats.peakHour.hours} שעות)
            </p>
          </CardContent>
        </Card>

        {/* Top users */}
        <Card>
          <CardHeader>
            <CardTitle>טבלת שחקנים מובילים</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">#</TableHead>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">סך שעות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topUsers.map((u, i) => (
                  <TableRow key={u.phone}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SnookerStats;
