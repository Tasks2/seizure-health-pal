import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { FileText, Download, Mail, TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import { SeizureLog, Medication, Appointment, SEIZURE_TYPES } from '@/types/health';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

interface ReportViewProps {
  seizures: SeizureLog[];
  medications: Medication[];
  appointments: Appointment[];
}

type DateRange = '7d' | '30d' | '90d' | '6m' | '1y';

export function ReportView({ seizures, medications, appointments }: ReportViewProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const getDateRangeStart = () => {
    const today = new Date();
    switch (dateRange) {
      case '7d': return subDays(today, 7);
      case '30d': return subDays(today, 30);
      case '90d': return subDays(today, 90);
      case '6m': return subMonths(today, 6);
      case '1y': return subMonths(today, 12);
    }
  };

  const rangeStart = getDateRangeStart();
  const today = new Date();

  const filteredSeizures = seizures.filter(s => 
    new Date(s.date) >= rangeStart && new Date(s.date) <= today
  );

  // Seizure frequency over time
  const getFrequencyData = () => {
    if (dateRange === '7d' || dateRange === '30d') {
      const days = eachDayOfInterval({ start: rangeStart, end: today });
      return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const count = seizures.filter(s => s.date === dateStr).length;
        return {
          date: format(day, dateRange === '7d' ? 'EEE' : 'MMM d'),
          seizures: count,
        };
      });
    } else {
      const weeks = eachWeekOfInterval({ start: rangeStart, end: today });
      return weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart);
        const count = seizures.filter(s => {
          const date = new Date(s.date);
          return date >= weekStart && date <= weekEnd;
        }).length;
        return {
          date: format(weekStart, 'MMM d'),
          seizures: count,
        };
      });
    }
  };

  // Seizure types distribution
  const getTypeDistribution = () => {
    const typeCounts = filteredSeizures.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: SEIZURE_TYPES.find(t => t.value === type)?.label || type,
      value: count,
    }));
  };

  // Trigger analysis
  const getTriggerAnalysis = () => {
    const triggerCounts = filteredSeizures.reduce((acc, s) => {
      (s.triggers || []).forEach(trigger => {
        acc[trigger] = (acc[trigger] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const frequencyData = getFrequencyData();
  const typeDistribution = getTypeDistribution();
  const triggerAnalysis = getTriggerAnalysis();

  // Calculate statistics
  const avgDuration = filteredSeizures.length > 0
    ? Math.round(filteredSeizures.reduce((sum, s) => sum + s.duration, 0) / filteredSeizures.length)
    : 0;
  const avgSeverity = filteredSeizures.length > 0
    ? (filteredSeizures.reduce((sum, s) => sum + s.severity, 0) / filteredSeizures.length).toFixed(1)
    : '0';

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--chart-trend))'];

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(23, 115, 110); // Primary color
    doc.text('SeizureTrack Health Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Report Period: Last ${dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : dateRange === '6m' ? '6 months' : '1 year'}`, pageWidth / 2, 34, { align: 'center' });

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('Summary', 20, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`Total Seizures: ${filteredSeizures.length}`, 20, 60);
    doc.text(`Average Duration: ${avgDuration} seconds`, 20, 68);
    doc.text(`Average Severity: ${avgSeverity}/5`, 20, 76);
    doc.text(`Active Medications: ${medications.length}`, 20, 84);

    // Medications Section
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('Current Medications', 20, 100);
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    let yPos = 110;
    medications.forEach((med, index) => {
      doc.text(`${index + 1}. ${med.name} - ${med.dosage} (${med.frequency})`, 20, yPos);
      yPos += 8;
    });

    if (medications.length === 0) {
      doc.text('No medications recorded', 20, yPos);
      yPos += 8;
    }

    // Seizure Log
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('Recent Seizures', 20, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setTextColor(60);
    filteredSeizures.slice(0, 10).forEach((seizure, index) => {
      const typeLabel = SEIZURE_TYPES.find(t => t.value === seizure.type)?.label || seizure.type;
      doc.text(
        `${format(new Date(seizure.date), 'MMM d, yyyy')} at ${seizure.time} - ${typeLabel} (${seizure.duration}s, severity ${seizure.severity}/5)`,
        20,
        yPos
      );
      yPos += 6;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Top Triggers
    if (triggerAnalysis.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('Common Triggers', 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(60);
      triggerAnalysis.forEach((t) => {
        doc.text(`• ${t.trigger}: ${t.count} occurrence(s)`, 20, yPos);
        yPos += 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This report is for informational purposes. Please consult your healthcare provider for medical advice.', pageWidth / 2, 285, { align: 'center' });

    doc.save(`seizure-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Reports & Trends</h2>
          <p className="text-muted-foreground">Visualize your health patterns and export reports</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="btn-gradient gap-2" onClick={generatePDF}>
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{filteredSeizures.length}</p>
                <p className="text-xs text-muted-foreground">Total Seizures</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{avgDuration}s</p>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{avgSeverity}</p>
                <p className="text-xs text-muted-foreground">Avg Severity</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <PieChart className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{typeDistribution.length}</p>
                <p className="text-xs text-muted-foreground">Seizure Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Frequency Chart */}
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Seizure Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSeizures.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No seizure data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="seizures" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Type Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Seizure Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeDistribution.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No seizure data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {typeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Triggers Analysis */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Common Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {triggerAnalysis.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No trigger data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={triggerAnalysis} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    dataKey="trigger" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Options */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Generate a comprehensive report to share with your healthcare provider. The report includes seizure history, medication list, trends, and trigger analysis.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="btn-gradient gap-2" onClick={generatePDF}>
                <Download className="w-4 h-4" />
                Download PDF Report
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Email to Doctor
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
