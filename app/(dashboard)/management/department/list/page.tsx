import DepartmentRightContent from '@/app/components/atoms/department/DepartmentRightContent';
import CardInfo from '@/app/components/molecules/CardInfo';
import DataTable from '@/app/components/molecules/DataTable';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getTranslations } from 'next-intl/server';
export const metadata = {
  ...metaObject('Department List'),
};
export default async function DepartmentPage() {
  const t = await getTranslations('DepartmentPage');
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
        rightContent={<DepartmentRightContent />}
      />
      <div className="px-8">
        <DataTable />
      </div>
    </div>
  );
}
