import type { Metadata } from "next";
import { AppProvider } from "../store/context";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import MainLayout from "../components/layout/MainLayout";
import { NoSSR } from "../components/common/NoSSR";
import "./globals.css";
import "@/lib/fontawesome";

export const metadata: Metadata = {
  title: "Rider Finance",
  description: "Sistema de gestão financeira pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning={true}>
        <NoSSR
          fallback={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              backgroundColor: '#121212',
              color: '#ffffff'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h2>Rider Finance</h2>
                <p>Carregando...</p>
              </div>
            </div>
          }
        >
          <AppProvider>
            <ThemeProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </ThemeProvider>
          </AppProvider>
        </NoSSR>
      </body>
    </html>
  );
}
