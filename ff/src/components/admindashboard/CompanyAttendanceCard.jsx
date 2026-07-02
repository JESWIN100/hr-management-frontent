import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Activity } from 'lucide-react';
import Card from './Card.jsx';

export default function CompanyAttendanceCard({ attendanceData = [] }) {
  // Format the SQL date rows into short day names (e.g., "Mon", "Tue")
  const chartData = attendanceData.map(d => ({
    day: new Date(d.record_date).toLocaleDateString('en-GB', { weekday: 'short' }),
    present: d.present_count || 0
  }));

  return (
    <Card title="Company Attendance (Last 7 Days)" icon={Activity}>
      {!chartData.length ? (
        <p className="text-xs text-ink-500 py-10 text-center">No attendance data available.</p>
      ) : (
        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f0f2f4" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#a6afb6' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#a6afb6' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value} Employees`, 'Present']}
              />
              <Bar dataKey="present" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}