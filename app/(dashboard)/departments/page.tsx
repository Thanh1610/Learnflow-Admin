import { metaObject } from '@/config/site.config';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { getTranslations } from 'next-intl/server';
import CardInfo from '@/app/components/molecules/ui/CardInfo';
import DeparmentList from './index';
import { getAllDepartments } from '@/app/hooks/serverHooks/useDepartment';

export const metadata = {
  ...metaObject('Course in Department'),
};

export default async function CoursePage() {
  const t = await getTranslations();
  const data = await getAllDepartments();

  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('CoursePage.courseInDepartment.title')}
        description={t('CoursePage.courseInDepartment.description')}
        breadcrumbs={[
          {
            label: t('app.home'),
            href: PAGE_ROUTES.HOME,
          },
          {
            label: t('app.courseInDepartment'),
            href: PAGE_ROUTES.COURSE_IN_DEPARTMENT,
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <DeparmentList data={data} />
      </div>
    </div>
  );
}
