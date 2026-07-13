import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WealthPath",
  description: "Financial planning SaaS demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between px-6 py-3.5">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-[10px] bg-[linear-gradient(135deg,#0f9d76,#16c79a)] grid place-items-center text-white font-extrabold text-sm">
                W
              </div>
              <span className="font-extrabold text-lg">WealthPath</span>
            </div>
            <nav className="flex items-center gap-2">
              <span className="px-3.5 py-2 rounded-full font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Início
              </span>
              <span className="px-3.5 py-2 rounded-full font-semibold text-sm bg-accent text-accent-foreground cursor-pointer">
                Projeção
              </span>
              <span className="px-3.5 py-2 rounded-full font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Relatórios
              </span>
              <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#1868e0,#4f9dff)] text-white grid place-items-center font-bold text-sm ml-2">
                BR
              </div>
            </nav>
          </div>
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
