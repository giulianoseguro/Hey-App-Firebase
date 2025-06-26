'use client';

import { DataProvider } from '@/lib/data-provider';
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
import { PlusCircle, Pizza } from 'lucide-react';
import Link from 'next/link';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
             <Link href="/" className="flex flex-col items-center justify-center gap-2 py-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary p-2">
                    <Pizza className="h-10 w-10 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold tracking-wider uppercase text-sidebar-foreground">Brazilian Pizza</span>
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary p-1">
                    <Pizza className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold tracking-wider uppercase">BRAZILIAN PIZZA</span>
              </Link>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DataProvider>
  );
}
