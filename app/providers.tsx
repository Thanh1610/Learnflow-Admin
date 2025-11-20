// app/providers.tsx
'use client';

import { SidebarProvider } from '@/app/components/organisms/Sidebar/SidebarContext';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, useState } from 'react';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // keep < access token 15m window

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsClient(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isClient) return null;
  return (
    <HeroUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <SidebarProvider>{children}</SidebarProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
