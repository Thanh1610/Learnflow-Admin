import { metaObject } from '@/config/site.config';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { getTranslations } from 'next-intl/server';
import CardInfo from '@/app/components/molecules/ui/CardInfo';
import { getAllCourse } from '@/app/hooks/serverHooks/useCourse';
import CourseTable from '.';
import { getServerUserRole } from '@/lib/server-auth';

export const metadata = {
  ...metaObject('Course List'),
};

export default async function CourseListPage() {
  const t = await getTranslations('CoursePage.courseList');
  const tApp = await getTranslations('app');
  const userRole = await getServerUserRole();
  const data = await getAllCourse();
  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('title')}
        description={t('description')}
        breadcrumbs={[
          {
            label: tApp('home'),
            href: PAGE_ROUTES.HOME,
          },
          {
            label: tApp('courseList'),
            href: PAGE_ROUTES.COURSE_LIST,
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <CourseTable data={data} role={userRole ?? undefined} />
      </div>
    </div>
  );
}
