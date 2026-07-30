"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Receipt } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

export default function CreateTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState("EXPENSE");
  
  const [formData, setFormData] = useState({
    accountId: "",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0]
  });

  const { data: accounts } = trpc.account.getUserAccounts.useQuery();
  const createTx = trpc.transaction.createTransaction.useMutation({
    onSuccess: () => {
      toast.success("Transaction added successfully!");
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add transaction");
    }
  });

  useEffect(() => {
    if (accounts && accounts.length > 0 && !formData.accountId) {
      setFormData((prev) => ({ ...prev, accountId: accounts[0].id }));
    }
  }, [accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accounts || accounts.length === 0) {
      toast.error("Please create an account first");
      return;
    }
    
    if (!formData.accountId) {
      toast.error("Please select an account");
      return;
    }
    
    createTx.mutate({
      accountId: formData.accountId,
      type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category || "General",
      date: new Date(formData.date),
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">New Transaction</h1>
        <p className="text-muted-foreground mt-1">Record a new expense or income to track your finances.</p>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-xl overflow-hidden bg-background/50 backdrop-blur-xl">
        <div className="flex border-b border-border/50">
          <button
            type="button"
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${type === 'EXPENSE' ? 'bg-rose-500/10 text-rose-500 border-b-2 border-rose-500' : 'text-muted-foreground hover:bg-secondary/50'}`}
            onClick={() => setType('EXPENSE')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500' : 'text-muted-foreground hover:bg-secondary/50'}`}
            onClick={() => setType('INCOME')}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Account</label>
              <Select 
                value={formData.accountId} 
                onValueChange={(val) => setFormData({...formData, accountId: val})}
              >
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-transparent focus:ring-primary">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts && accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} (${parseFloat(acc.balance).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-muted-foreground">$</span>
                <Input 
                  type="number" 
                  step="0.01" 
                  required
                  placeholder="0.00" 
                  className="pl-8 text-2xl h-14 rounded-2xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:bg-background"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <Input 
                  type="date" 
                  required
                  className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <Input 
                  placeholder="e.g. Groceries" 
                  className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description (Optional)</label>
              <Input 
                placeholder="What was this for?" 
                className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="pt-4 flex items-center justify-between p-4 rounded-2xl border border-dashed border-border/60 bg-secondary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Have a receipt?</p>
                  <p className="text-xs text-muted-foreground">Let AI extract the details for you.</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" className="rounded-full">Upload</Button>
            </div>
          </CardContent>

          <CardFooter className="p-8 pt-0">
            <Button 
              type="submit" 
              disabled={createTx.isPending}
              className={`w-full h-14 rounded-2xl text-lg font-semibold shadow-lg transition-all ${
                type === 'EXPENSE' 
                  ? 'bg-rose-500 hover:bg-rose-600 hover:shadow-rose-500/25' 
                  : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25'
              }`}
            >
              {createTx.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {createTx.isPending ? "Processing..." : `Add ${type.charAt(0) + type.slice(1).toLowerCase()}`}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
