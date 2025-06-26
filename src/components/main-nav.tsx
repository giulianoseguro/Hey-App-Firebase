'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, Package, ClipboardPlus } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Painel', icon: LayoutDashboard },
  { href: '/pnl', label: 'L & P', icon: FileText },
  { href: '/inventory', label: 'Estoque', icon: Package },
  { href: '/entry', label: 'Entrada de Dados', icon: ClipboardPlus },
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
