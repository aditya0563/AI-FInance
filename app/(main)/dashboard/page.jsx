"use client";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowDownRight, ArrowUpRight, Plus, Wallet, ReceiptText, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: accounts, isLoading: accountsLoading } = trpc.account.getUserAccounts.useQuery();
  const { data: transactions, isLoading: txLoading } = trpc.transaction.getTransactions.useQuery();

  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
  
  if (accountsLoading || txLoading) {
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
            <CardTitle className="text-2xl font-bold tracking-tight">$0.00</CardTitle>
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
            <CardTitle className="text-2xl font-bold tracking-tight">$0.00</CardTitle>
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
            {transactions?.length === 0 ? (
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
                 {/* Transaction list would go here */}
                 <p className="text-sm text-muted-foreground">Transactions found: {transactions?.length}</p>
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
                    <p className="text-3xl font-bold mt-1">$0.00</p>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">of $1,000.00</p>
                </div>
                <Progress value={0} className="h-3 rounded-full bg-secondary" />
                <p className="text-xs text-muted-foreground pt-1">0% used. You're doing great!</p>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <Button variant="secondary" className="w-full rounded-full">Adjust Budget</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
