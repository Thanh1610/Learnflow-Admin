import CardInfo from '@/app/components/molecules/ui/CardInfo';
import UserForm from '@/app/components/molecules/user/UserForm';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getServerUserRole } from '@/lib/server-auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const metadata = {
  ...metaObject('Create User'),
};

export default async function CreateUserPage() {
  const userRole = await getServerUserRole();

  // Chỉ SYSTEM_ADMIN mới có thể truy cập
  if (userRole !== 'SYSTEM_ADMIN') {
    redirect(PAGE_ROUTES.HOME);
  }

  const t = await getTranslations('UserPage');
  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('createUser.title')}
        description={t('createUser.description')}
        breadcrumbs={[
          {
            label: t('home'),
            href: PAGE_ROUTES.HOME,
          },
          {
            label: t('users'),
            href: PAGE_ROUTES.USERS_LIST,
          },
          {
            label: t('createUser.title'),
            href: PAGE_ROUTES.CREATE_USER,
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <UserForm mode="create" />
      </div>
    </div>
  );
}
