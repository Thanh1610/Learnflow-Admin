import DepartmentTableWrapper from './index';
import CardInfo from '@/app/components/molecules/ui/CardInfo';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';

export const metadata = {
  ...metaObject('Department List'),
};

export default async function DepartmentPage() {
  const t = await getTranslations('DepartmentPage');
  const tDataTable = await getTranslations('DataTable');
  const columns = [
    { name: tDataTable('columns.id'), uid: 'id', sortable: true },
    {
      name: tDataTable('columns.name'),
      uid: 'name',
      sortable: true,
      width: 240,
    },
    { name: tDataTable('columns.description'), uid: 'description' },
    { name: tDataTable('columns.actions'), uid: 'actions' },
  ];
  const data = await prisma.department.findMany({ where: { deletedAt: null } });

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
        <DepartmentTableWrapper columns={columns} data={data} />
      </div>
    </div>
  );
}
