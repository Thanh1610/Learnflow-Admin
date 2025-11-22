import CardInfo from '@/app/components/molecules/ui/CardInfo';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getTranslations } from 'next-intl/server';
import DepartmentForm from '@/app/components/organisms/Department/DepartmentForm';
export const metadata = {
  ...metaObject('Create Department'),
};
export default async function CreateDepartmentPage() {
  const t = await getTranslations('DepartmentPage');
  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('createDepartment.title')}
        description={t('createDepartment.description')}
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
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <DepartmentForm type="create" />
      </div>
    </div>
  );
}
