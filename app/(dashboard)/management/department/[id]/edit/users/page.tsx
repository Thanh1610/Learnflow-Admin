import CardInfo from '@/app/components/molecules/ui/CardInfo';
import { getDepartmentById } from '@/app/hooks/serverHooks/useDepartment';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import DepartmentUsersForm from './index';

export const metadata = {
  ...metaObject('Department User'),
};

export default async function EditDepartmentUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('DepartmentPage');
  const { id } = await params;
  const department = await getDepartmentById(id);
  if (!department) {
    return notFound();
  }
  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('editDepartment.usersTitle')}
        description={t('editDepartment.usersDescription')}
        breadcrumbs={[
          {
            label: t('home'),
            href: PAGE_ROUTES.HOME,
          },
          {
            label: t('department'),
            href: PAGE_ROUTES.DEPARTMENT_LIST,
          },
          {
            label: t('editDepartment.usersTitle'),
            href: PAGE_ROUTES.DEPARTMENT_USER.replace('[id]', id),
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <DepartmentUsersForm department={department} />
      </div>
    </div>
  );
}
