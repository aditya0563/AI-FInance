import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and configurations.</p>
      </div>

      <Card className="rounded-3xl border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle>Budget Settings</CardTitle>
          <CardDescription>Configure your monthly budget threshold.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 border border-dashed border-border/60 rounded-xl bg-secondary/10">
            <p className="text-muted-foreground text-center">Settings configuration is currently under development. Please check back later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
