import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] -z-10 animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] -z-10 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b border-border/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-xl shadow-lg">
            W
          </div>
          <span className="text-2xl font-bold tracking-tight">Welth</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-full shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 z-10">
        <div className="max-w-4xl mx-auto space-y-8 opacity-0 animate-fade-in-up">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
            <Zap className="mr-2 h-4 w-4" />
            The Future of Personal Finance
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
            Manage your wealth with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              intelligent precision
            </span>
          </h1>
          
          <p className="mx-auto max-w-[600px] text-lg md:text-xl text-muted-foreground leading-relaxed">
            Experience a stunningly fast, AI-powered dashboard that gives you total control over your accounts, budgets, and transactions in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/25 hover:scale-105 transition-transform duration-300">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base backdrop-blur-md bg-background/50">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      {/* Features section peek */}
      <div className="container mx-auto px-4 pb-24 z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Bank-Grade Security", desc: "Your data is encrypted and securely stored." },
            { icon: BarChart3, title: "Real-Time Insights", desc: "Visualize your spending patterns instantly." },
            { icon: Zap, title: "AI Categorization", desc: "Transactions are automatically categorized." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl bg-secondary/20 border border-border/30 backdrop-blur-sm">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
