import { getServerUserRole } from '@/lib/server-auth';
import { getLocale } from 'next-intl/server';
import { AppSidebar } from './AppSidebar';
import { getMenuItems } from './menuItems';

export async function AppSidebarServer() {
  const locale = await getLocale();
  const userRole = await getServerUserRole();
  const menuItems = await getMenuItems(locale, userRole);
  return <AppSidebar menuItems={menuItems} />;
}
