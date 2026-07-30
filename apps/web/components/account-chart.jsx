"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export function AccountChart({ transactions }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const grouped = transactions.reduce((acc, tx) => {
      const dateStr = tx.date || tx.createdAt;
      if (!dateStr) return acc;
      
      const date = format(new Date(dateStr), "MMM dd");
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0, sortDate: new Date(dateStr) };
      
      const amount = parseFloat(tx.amount) || 0;
      if (tx.type === "INCOME") acc[date].income += amount;
      if (tx.type === "EXPENSE") acc[date].expense += amount;
      
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a, b) => a.sortDate - b.sortDate);
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return <div className="text-center p-8 text-muted-foreground border rounded-md">No activity data available</div>;
  }

  return (
    <div className="h-[350px] w-full p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
      <h3 className="font-semibold mb-4 text-lg">Account Activity</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Legend />
          <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
