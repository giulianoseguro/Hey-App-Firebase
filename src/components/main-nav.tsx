
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, Package, History, BarChart3, BookOpenText, Users } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pnl', label: 'P&L', icon: FileText },
  { href: '/profitability', label: 'Profitability', icon: BarChart3 },
  { href: '/payroll', label: 'Payroll', icon: Users },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/menu', label: 'Menu Items', icon: BookOpenText },
  { href: '/transactions', label: 'All Transactions', icon: History },
];

export function MainNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {navLinks.map((link) => {
        const Icon = link.icon;
        // Special case for root, as pathname can be other routes starting with '/'
        const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={link.label}
              onClick={() => setOpenMobile(false)}
            >
              <Link href={link.href}>
                <Icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
