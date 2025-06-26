'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, Package, ClipboardPlus } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pnl', label: 'P&L', icon: FileText },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/entry', label: 'Data Entry', icon: ClipboardPlus },
];

export function MainNav() {
  const pathname = usePathname();

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
