'use client';

import { LanguageToggle } from '@/app/components/atoms/Language';
import { MenuItem } from '@/app/components/organisms/Sidebar/menuItems';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarItem, useSidebar } from './index';

function SidebarHeader() {
  const { isOpen, isMobile } = useSidebar();
  const isCollapsed = !isOpen && !isMobile;

  return (
    <div
      className={cn('flex items-center gap-2', isCollapsed && 'justify-center')}
    >
      {!isCollapsed && <h2 className="text-lg font-bold">LearnFlow</h2>}
    </div>
  );
}

function SidebarFooter() {
  const { isOpen, isMobile } = useSidebar();
  const isCollapsed = !isOpen && !isMobile;

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        isCollapsed ? 'justify-center flex-col' : 'justify-start'
      )}
    >
      <ThemeSwitcher />
      <LanguageToggle />
    </div>
  );
}

interface AppSidebarProps {
  menuItems: MenuItem[];
}

export function AppSidebar({ menuItems }: AppSidebarProps) {
  return (
    <Sidebar header={<SidebarHeader />} footer={<SidebarFooter />}>
      <div className="flex flex-col gap-1">
        {menuItems.map((item, index: number) => (
          <SidebarItem
            key={`${item.href}-${index}`}
            href={item.href}
            icon={item.icon}
            label={item.label}
            items={item.items}
          />
        ))}
      </div>
    </Sidebar>
  );
}
