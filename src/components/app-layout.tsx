'use client';

import dynamic from 'next/dynamic';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const DataProvider = dynamic(
  () => import('@/lib/data-provider').then((mod) => mod.DataProvider),
  { ssr: false }
);

export function AppLayout({ children }: { children: React.ReactNode }) {
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/pizza-profit-pilot.appspot.com/o/hey%20logo.webp?alt=media";

  return (
    <DataProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
             <Link href="/" className="flex flex-col items-center justify-center gap-2 py-4 text-center">
                <Image
                  src={logoUrl}
                  alt="Hey! Brazilian Pizza Logo"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <span className="text-sm font-semibold tracking-wider uppercase text-sidebar-foreground">Hey! Brazilian Pizza</span>
             </Link>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
          <SidebarFooter>
            <Button asChild className="w-full">
              <Link href="/entry">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Entry
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:hidden">
              <SidebarTrigger />
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src={logoUrl}
                  alt="Hey! Brazilian Pizza Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-sm font-semibold tracking-wider uppercase">Hey! Brazilian Pizza</span>
              </Link>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              {children}
            </main>
        </SidebarInset>
      </SidebarProvider>
    </DataProvider>
  );
}
