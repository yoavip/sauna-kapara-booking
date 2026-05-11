import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Loader2, Trophy, Users, Clock, Calendar as CalendarIcon, Download, Activity } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "@/hooks/use-toast";

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

    const byDow: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const byUser: Record<string, { name: string; phone: string; count: number }> = {};
    const byHourOfDay: Record<number, number> = {};
    const byWeek: Record<string, number> = {};
    const uniqueDays = new Set<string>();
    const occupiedSlots = new Set<string>(); // date+hour unique
    const occupiedByDow: Record<number, Set<string>> = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set() };
    const occupiedByWeek: Record<string, Set<string>> = {};

    data.forEach((r) => {
      const slot = new Date(r.registered_at);
      const dow = slot.getDay();
      const dateKey = slot.toISOString().slice(0, 10);
      const slotKey = `${dateKey}-${r.hour}`;

      byDow[dow] = (byDow[dow] || 0) + 1;
      uniqueDays.add(dateKey);
      occupiedSlots.add(slotKey);
      occupiedByDow[dow].add(slotKey);

      const key = r.phone;
      if (!byUser[key]) byUser[key] = { name: r.name, phone: r.phone, count: 0 };
      byUser[key].count += 1;

      byHourOfDay[r.hour] = (byHourOfDay[r.hour] || 0) + 1;

      const d = new Date(slot);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      const wk = d.toISOString().slice(0, 10);
      byWeek[wk] = (byWeek[wk] || 0) + 1;
      if (!occupiedByWeek[wk]) occupiedByWeek[wk] = new Set();
      occupiedByWeek[wk].add(slotKey);
    });

    const dowChart = DAYS_HE.map((label, i) => ({
      day: label,
      hours: byDow[i] || 0,
      occupied: occupiedByDow[i].size,
    }));
    const topUsers = Object.values(byUser).sort((a, b) => b.count - a.count);
    const hourChart = Object.keys(byHourOfDay)
      .map((h) => ({ hour: `${h}:00`, hours: byHourOfDay[Number(h)] }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    const weekChart = Object.keys(byWeek)
      .sort()
      .map((wk) => {
        const d = new Date(wk);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        return { week: label, hours: byWeek[wk], occupied: occupiedByWeek[wk]?.size || 0 };
      });

    const weeksCount = Object.keys(byWeek).length || 1;
    const daysCount = uniqueDays.size || 1;
    const avgHoursPerWeek = (totalHours / weeksCount).toFixed(1);
    const avgHoursPerDay = (totalHours / daysCount).toFixed(1);
    const totalOccupied = occupiedSlots.size;
    const avgOccupiedPerDay = (totalOccupied / daysCount).toFixed(1);

    const peakDay = dowChart.reduce((a, b) => (b.hours > a.hours ? b : a), dowChart[0]);
    const peakHour = hourChart.reduce((a, b) => (b.hours > a.hours ? b : a), hourChart[0] || { hour: "-", hours: 0 });

    return {
      totalHours, uniqueUsers, dowChart, topUsers, hourChart, weekChart,
      avgHoursPerWeek, avgHoursPerDay, totalOccupied, avgOccupiedPerDay,
      daysCount, peakDay, peakHour,
    };
  }, [data]);

  const handleExport = () => {
    const pwd = window.prompt("הזן סיסמה לייצוא נתונים גולמיים:");
    if (pwd === null) return;
    if (pwd !== "1981") {
      toast({ title: "סיסמה שגויה", variant: "destructive" });
      return;
    }
    const rows = data.map((r) => ({
      "תאריך": new Date(r.registered_at).toLocaleDateString("he-IL"),
      "שעה": `${r.hour}:00`,
      "שם": r.name,
      "טלפון": r.phone,
      "נרשם בתאריך": new Date(r.registered_at).toLocaleString("he-IL"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Snooker");
    XLSX.writeFile(wb, `snooker-raw-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

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
          <p className="text-muted-foreground">מ-1 בינואר 2026 ועד היום ({stats.daysCount} ימים פעילים)</p>
          <div className="pt-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4" />
              ייצוא נתונים גולמיים (Excel)
            </Button>
          </div>
        </header>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.totalHours}</div>
              <div className="text-sm text-muted-foreground">סך שעות שימוש (כולל כפילויות)</div>
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
              <div className="text-3xl font-bold">{stats.avgHoursPerDay}</div>
              <div className="text-sm text-muted-foreground">ממוצע שעות ליום</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CalendarIcon className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.avgHoursPerWeek}</div>
              <div className="text-sm text-muted-foreground">ממוצע שעות לשבוע</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Activity className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.totalOccupied}</div>
              <div className="text-sm text-muted-foreground">סך שעות תפוסה</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Activity className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.avgOccupiedPerDay}</div>
              <div className="text-sm text-muted-foreground">ממוצע שעות תפוסה ליום</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.peakDay?.day}</div>
              <div className="text-sm text-muted-foreground">היום הכי פעיל</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="mx-auto h-6 w-6 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.peakHour.hour}</div>
              <div className="text-sm text-muted-foreground">שעת השיא</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly trend */}
        <Card>
          <CardHeader>
            <CardTitle>שימוש לפי שבוע (שעות רשומות מול שעות תפוסה)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weekChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" name="סך שעות" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="occupied" name="שעות תפוסה" stroke="hsl(var(--destructive))" strokeWidth={2} />
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
                <Legend />
                <Bar dataKey="hours" name="סך שעות" fill="hsl(var(--primary))" />
                <Bar dataKey="occupied" name="שעות תפוסה" fill="hsl(var(--destructive))" />
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
