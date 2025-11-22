import CardInfo from '@/app/components/molecules/ui/CardInfo';
import DepartmentForm from '@/app/components/organisms/Department/DepartmentForm';
import { getDepartmentById } from '@/app/hooks/serverHooks/useDepartment';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  ...metaObject('Edit Department'),
};

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('DepartmentPage');
  const { id } = await params;

  const department = await getDepartmentById(id);

  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('editDepartment.title')}
        description={t('editDepartment.description')}
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
            label: t('createDepartment.title'),
            href: PAGE_ROUTES.CREATE_DEPARTMENT,
          },
          {
            label: t('editDepartment.title'),
            href: PAGE_ROUTES.EDIT_DEPARTMENT,
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <DepartmentForm type="edit" data={department} />
      </div>
    </div>
  );
}
