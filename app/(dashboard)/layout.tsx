import {
  AppSidebarServer,
  DashboardLayout,
} from '@/app/components/organisms/Sidebar';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout sidebar={<AppSidebarServer />}>{children}</DashboardLayout>
  );
}
