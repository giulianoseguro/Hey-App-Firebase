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
             <div className="flex items-center gap-2">
                <Pizza className="size-8 text-primary" />
                <h1 className="text-xl font-bold text-sidebar-foreground">Pizza Profit Pilot</h1>
             </div>
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
              <div className="flex items-center gap-2">
                  <Pizza className="size-7 text-primary" />
                  <h1 className="text-lg font-bold">Pizza Profit Pilot</h1>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DataProvider>
  );
}
