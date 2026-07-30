import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { featuresData, howItWorksData, testimonialsData, statsData } from "@/data/landing";

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
      
      {/* Stats section */}
      <div className="container mx-auto px-4 py-12 z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-y border-border/20 py-10 bg-secondary/10 backdrop-blur-sm rounded-3xl">
          {statsData.map((stat, i) => (
            <div key={i} className="space-y-2">
              <h4 className="text-4xl font-bold text-primary">{stat.value}</h4>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features section */}
      <div className="container mx-auto px-4 py-24 z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">Everything you need</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Powerful features to help you manage your finances with ease.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {featuresData.map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl bg-secondary/20 border border-border/30 backdrop-blur-sm hover:bg-secondary/30 transition-colors">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* How it works */}
      <div className="container mx-auto px-4 py-24 z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Get started in three simple steps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorksData.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8">
              <div className="h-20 w-20 rounded-full bg-blue-600/10 flex items-center justify-center mb-6 border border-blue-600/20">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="container mx-auto px-4 py-24 pb-32 z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">Loved by thousands</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Here's what our users have to say about Welth.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, i) => (
            <div key={i} className="flex flex-col p-8 rounded-3xl bg-secondary/20 border border-border/30 backdrop-blur-sm">
              <p className="text-muted-foreground mb-8 flex-1 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={testimonial.image} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
