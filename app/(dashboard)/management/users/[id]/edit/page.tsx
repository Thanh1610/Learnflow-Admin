import CardInfo from '@/app/components/molecules/ui/CardInfo';
import UserForm from '@/app/components/molecules/user/UserForm';
import { getUserById } from '@/app/hooks/serverHooks/useUser';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getServerUserRole } from '@/lib/server-auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const metadata = {
  ...metaObject('Edit User'),
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userRole = await getServerUserRole();

  // Chỉ SYSTEM_ADMIN mới có thể truy cập
  if (userRole !== 'SYSTEM_ADMIN') {
    redirect(PAGE_ROUTES.HOME);
  }

  const { id } = await params;
  const t = await getTranslations('UserPage');
  const userData = await getUserById(id);

  if (!userData) {
    redirect(PAGE_ROUTES.USERS_LIST);
  }

  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('editUser.title')}
        description={t('editUser.description')}
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
            label: t('editUser.title'),
            href: PAGE_ROUTES.EDIT_USER.replace('[id]', id),
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <UserForm mode="edit" userData={userData} />
      </div>
    </div>
  );
}
