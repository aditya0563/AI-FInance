import { getUserAccounts } from "@/actions/account";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AccountsIndexPage() {
  const accountsResponse = await getUserAccounts();
  const accounts = accountsResponse?.success ? accountsResponse.data : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage and track your financial accounts.</p>
        </div>
        <Link href="/dashboard">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </Link>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border/60 rounded-3xl bg-background/50">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No accounts found</h3>
          <p className="text-muted-foreground mt-2">Create an account to start tracking your finances.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Link key={account.id} href={`/account/${account.id}`}>
              <Card className="rounded-3xl border-border/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Wallet className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl capitalize">{account.name}</CardTitle>
                  <CardDescription className="capitalize font-medium text-muted-foreground">
                    {account.type.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mt-2">
                    ${parseFloat(account.balance).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {account._count?.transactions || 0} Transactions
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
