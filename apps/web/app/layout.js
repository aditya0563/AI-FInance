import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Modern Finance Dashboard",
  description: "Next-generation financial management platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30`}>
          <div className="flex flex-1 flex-col relative">
            {children}
          </div>
          <Toaster richColors theme="dark" position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
