import { AppSidebar } from './AppSidebar';
import { getMenuItems } from './menuItems';

export async function AppSidebarServer() {
  const menuItems = await getMenuItems();
  return <AppSidebar menuItems={menuItems} />;
}
