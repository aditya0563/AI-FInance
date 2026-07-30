"use client";
import { useEffect, useState } from "react";
import { getUserAccounts } from "@/actions/account";
import { getUserTransactions } from "@/actions/transaction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowDownRight, ArrowUpRight, Plus, Wallet, ReceiptText, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionTable } from "@/components/transaction-table";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [allTransactions, setAllTransactions] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      // Fetch data concurrently via Server Actions
      const { getDashboardData } = await import("@/actions/dashboard");
      const [accountsResponse, transactionsResponse, dashboardDataResponse] = await Promise.all([
        getUserAccounts(),
        getUserTransactions(null, 10),
        getDashboardData(),
      ]);

      if (accountsResponse?.success) {
        setAccounts(accountsResponse.data);
      } else if (accountsResponse) {
        console.error("Failed to load accounts:", accountsResponse.error);
      }
      
      if (transactionsResponse?.success) {
        setTransactions(transactionsResponse.data.transactions);
        setNextCursor(transactionsResponse.data.nextCursor);
      } else if (transactionsResponse) {
        console.error("Failed to load transactions:", transactionsResponse.error);
      }
      
      if (dashboardDataResponse?.success) {
        setAllTransactions(dashboardDataResponse.data);
      } else if (dashboardDataResponse) {
        console.error("Failed to load dashboard data:", dashboardDataResponse.error);
      }
      
      setIsLoading(false);
    }

    loadDashboardData();
  }, []);

  const loadMoreTransactions = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const response = await getUserTransactions(nextCursor, 10);
    if (response?.success) {
      setTransactions((prev) => [...(prev || []), ...response.data.transactions]);
      setNextCursor(response.data.nextCursor);
    } else if (response) {
      console.error("Failed to load more transactions:", response.error);
    }
    setIsLoadingMore(false);
  };

  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
  
  // Calculate income and expenses for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = allTransactions?.filter(tx => {
    const txDate = new Date(tx.date || tx.createdAt);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  }) || [];
  
  const totalIncome = currentMonthTransactions
    .filter(tx => tx.type === "INCOME")
    .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    
  const totalExpenses = currentMonthTransactions
    .filter(tx => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-48 rounded-md" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Here's your financial summary at a glance.</p>
        </div>
        <Link href="/transaction/create">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-border/50 bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-muted-foreground">Total Balance</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tight">${totalBalance.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-emerald-500 font-medium">
              <TrendingUp className="mr-1 h-4 w-4" />
              +2.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-medium">Income</CardDescription>
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-emerald-600">${totalIncome.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-3xl border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-medium">Expenses</CardDescription>
              <div className="p-2 bg-rose-500/10 rounded-full">
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-rose-600">${totalExpenses.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="md:col-span-4 rounded-3xl border-border/50 shadow-sm flex flex-col">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col justify-center">
            {!transactions || transactions?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ReceiptText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">No transactions yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  You haven't made any transactions. Add your first expense or income to start tracking.
                </p>
                <Link href="/transaction/create" className="mt-6">
                  <Button variant="outline" className="rounded-full">Add your first transaction</Button>
                </Link>
              </div>
            ) : (
              <div className="p-6">
                 <TransactionTable transactions={transactions} />
                  {nextCursor && (
                    <div className="mt-6 flex justify-center">
                      <Button variant="outline" onClick={loadMoreTransactions} disabled={isLoadingMore} className="rounded-full">
                        {isLoadingMore ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="md:col-span-3 rounded-3xl border-border/50 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Spent this month</p>
                    <p className="text-3xl font-bold mt-1">${totalExpenses.toFixed(2)}</p>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">of $1,000.00</p>
                </div>
                <Progress value={Math.min((totalExpenses / 1000) * 100, 100)} className="h-3 rounded-full bg-secondary" />
                <p className="text-xs text-muted-foreground pt-1">{((totalExpenses / 1000) * 100).toFixed(1)}% used. {totalExpenses > 1000 ? "You're over budget!" : "You're doing great!"}</p>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <Link href="/settings" className="w-full">
                  <Button variant="secondary" className="w-full rounded-full">Adjust Budget</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
