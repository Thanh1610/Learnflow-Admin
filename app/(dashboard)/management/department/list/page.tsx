import CardInfo from '@/app/components/molecules/ui/CardInfo';
import { getAllDepartments } from '@/app/hooks/serverHooks/useDepartment';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getTranslations } from 'next-intl/server';
import DepartmentTableWrapper from './index';

export const metadata = {
  ...metaObject('Department List'),
};

export default async function DepartmentPage() {
  const t = await getTranslations('DepartmentPage');

  const data = await getAllDepartments();
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
            label: t('department'),
            href: PAGE_ROUTES.DEPARTMENT_LIST,
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <DepartmentTableWrapper data={data} />
      </div>
    </div>
  );
}
