import CardInfo from '@/app/components/molecules/ui/CardInfo';
import { getAllUsers } from '@/app/hooks/serverHooks/useUser';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getServerUserRole } from '@/lib/server-auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import UsersListForm from '.';

export const metadata = {
  ...metaObject('Users Management'),
};

export default async function UsersPage() {
  const userRole = await getServerUserRole();

  // Chỉ SYSTEM_ADMIN mới có thể truy cập
  if (userRole !== 'SYSTEM_ADMIN') {
    redirect(PAGE_ROUTES.HOME);
  }

  const t = await getTranslations('UsersPage');
  const users = await getAllUsers();
  console.log(users);
  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('title')}
        description={t('description')}
        breadcrumbs={[
          {
            label: t('home'),
            href: PAGE_ROUTES.HOME,
          },
          {
            label: t('users'),
            href: '/management/users',
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <UsersListForm users={users} />
      </div>
    </div>
  );
}
